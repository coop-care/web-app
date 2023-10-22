/**
 * Replacing the Cordova WebViews IndexedDB implementation with 
 * Cordova Sqlite Plugin cordova-sqlite-storage and an IndexedDB shim,
 * to ensure that the databases are always reliably persistent and not deleted by the system
 * when it runs out of disk space which is likely the case on Android.
 * 
 * Performance penalty of this implementation compared to browser's IndexedDB is 
 * about 1.3x - 2.6x for read operations and 1.6x - 7.6x for write operations.
 * 
 * Performance could be theoretically improved by using one of the GPL-licensed Sqlite plugin versions
 * described at https://github.com/storesafe/cordova-sqlite-storage#comparison-of-supported-plugin-versions
 * and https://storesafe.io. 
 * Though my own performance tests showed that https://github.com/storesafe/cordova-plugin-sqlite-evplus-ext-common-free
 * performed about 80 % slower than cordova-sqlite-storage plugin on an Android device.
 * There are also Sqlite plugin versions with encryption using SQLCipher.
 */

import { boot } from "quasar/wrappers";
import { Platform } from "quasar";
// @ts-ignore
import regeneratorRuntime from "regenerator-runtime";
// @ts-ignore
import setGlobalVars from "indexeddbshim/dist/indexeddbshim-noninvasive";
import Dexie from "dexie";

if (Platform.is.cordova) {
    // waiting on cordova deviceready event ensures that sqlitePlugin is available before IndexedDB shim setup for Android,
    // which could otherwise fail because of the race condition
    document.addEventListener("deviceready", () => {
        const readEntries = (directory: DirectoryEntry) => 
            new Promise<Entry[]>((resolve, reject) => directory.createReader().readEntries(resolve, reject));

        const getMetadata = (entry: Entry) => 
            new Promise<Metadata>((resolve, reject) => entry.getMetadata(resolve, reject));

        type ExtendedEntry = {
            name: string;
            type: "file" | "directory" | "unknown";
            path?: string;
            size?: number;
            modificationTime?: Date;
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const listDirectory = (path: string) => new Promise<ExtendedEntry[]>((resolve, reject) =>
            window.resolveLocalFileSystemURL(path, directory =>
                resolve(
                    (async () =>
                        await Promise.all(
                            (await readEntries(directory as DirectoryEntry)).map(async entry => ({
                                name: entry.name,
                                type: entry.isFile
                                    ? "file"
                                    : entry.isDirectory
                                        ? "directory"
                                        : "unknown",
                                ...(await getMetadata(entry))
                            } as ExtendedEntry))
                        )
                    )()
                ),
                reject
            )
        );

        const recursivelyListFilesInDirectory = (path: string): Promise<ExtendedEntry[]> => new Promise<ExtendedEntry[]>((resolve, reject) =>
            window.resolveLocalFileSystemURL(path, directory =>
                resolve(
                    (async (): Promise<ExtendedEntry[]> => {
                        const directories: string[] = [];
                        const files: ExtendedEntry[] = await Promise.all((await readEntries(directory as DirectoryEntry)).map(async entry => {
                            if (entry.isDirectory) {
                                directories.push(path + "/" + entry.name)
                            }
                            
                            return {
                                name: entry.name,
                                path,
                                type: entry.isFile
                                    ? "file"
                                    : entry.isDirectory
                                        ? "directory"
                                        : "unknown",
                                ...(await getMetadata(entry))
                            } as ExtendedEntry;
                        }));

                        return Promise.all(directories.map(path => recursivelyListFilesInDirectory(path)))
                            .then(listsOfFiles => listsOfFiles.flatMap(files => files).concat(files))
                    })()
                ),
                reject
            )
        );

        const getUsage = async (path: string) => (await recursivelyListFilesInDirectory(path))
            .reduce((current: number, entry: ExtendedEntry) => current + (entry.size || 0), 0);

        const getQuota = async (): Promise<number | undefined> => {
            const value = await new Promise<number>((resolve, reject) => cordova.exec(resolve, reject, "File", "getFreeDiskSpace", []));

            if (isNaN(value)) {
                return undefined;
            } else {
                return Platform.is.android
                    ? value * 1024
                    : value;
            }
        };

        const estimateCustomStorage = async (path: string): Promise<StorageEstimate> => ({
            quota: await getQuota(),
            usage: await getUsage(path),
        });
        
        if (Platform.is.android && "sqlitePlugin" in window) {
            // implicit dependency of indexeddbshim
            regeneratorRuntime;

            const databaseOptions = (name: string) => ({
                name,
                ...(
                    Platform.is.ios
                        ? { iosDatabaseLocation: "Library" }
                        : { location: "default" }
                ),
            });
            const openDatabase = (name: string) => window.sqlitePlugin.openDatabase(databaseOptions(name));
            const deleteDatabase = (name: string) =>
                new Promise((resolve, reject) => window.sqlitePlugin.deleteDatabase(databaseOptions(name), resolve, reject));

            function escapeUnmatchedSurrogates(arg: string) {
                // http://stackoverflow.com/a/6701665/271577
                return arg.replace(/((?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])))(?!(?:(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))|(^|(?:(?![\uD800-\uDBFF](?![\uDC00-\uDFFF]))[\s\S]))((?:(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))/g, function (_, unmatchedHighSurrogate, precedingLow, unmatchedLowSurrogate) {
                    // Could add a corresponding surrogate for compatibility with `node-sqlite3`: http://bugs.python.org/issue12569 and http://stackoverflow.com/a/6701665/271577
                    //   but Chrome having problems
                    if (unmatchedHighSurrogate) {
                        return "^2" + unmatchedHighSurrogate.codePointAt().toString(16).padStart(4, "0");
                    }

                    return (precedingLow || "") + "^3" + unmatchedLowSurrogate.codePointAt().toString(16).padStart(4, "0");
                });
            }

            function escapeNameForSQLiteIdentifier(arg: string) {
                // http://stackoverflow.com/a/6701665/271577
                return "_" + // Prevent empty string
                    escapeUnmatchedSurrogates(arg.replace(/\^/g, "^^") // Escape our escape
                        // http://www.sqlite.org/src/tktview?name=57c971fc74
                        .replace(/\0/g, "^0") // We need to avoid identifiers being treated as duplicates based on SQLite's ASCII-only case-insensitive table and column names
                        // (For SQL in general, however, see http://stackoverflow.com/a/17215009/271577
                        // See also https://www.sqlite.org/faq.html#q18 re: Unicode (non-ASCII) case-insensitive not working
                        .replace(/([A-Z])/g, "^$1"));
            } // The escaping of unmatched surrogates was needed by Chrome but not Node

            // we need to derive the database file name from the database name to be able to delete it,
            // but the escapeDatabaseName function is not exposed by indexeddbshim so we are providing
            // the exact same implementation
            const escapeDatabaseName = (name: string) => "D" + escapeNameForSQLiteIdentifier(name) + ".sqlite";

            // overwrite native implementation with shim globally in window object
            setGlobalVars(window, {
                win: { openDatabase },
                escapeDatabaseName
            });
            window.shimIndexedDB.__useShim();
            Dexie.dependencies = {
                indexedDB: window.indexedDB,
                IDBKeyRange: window.IDBKeyRange
            };

            // less invasive alternative: set shim object on window and make Dexie use it
            // const shim = {};
            // setGlobalVars(shim, {
            //     win: { openDatabase },
            //     escapeDatabaseName
            // });
            // global.shim = shim;
            // Dexie.dependencies = {
            //     indexedDB: shim.indexedDB,
            //     IDBKeyRange: shim.IDBKeyRange
            // };

            // ensure that deleting a database also deletes the corresponding sqlite file
            const originalDeleteDatabase: (name: string) => IDBOpenDBRequest = window.shimIndexedDB.deleteDatabase;
            window.shimIndexedDB.deleteDatabase = (name: string) => {
                // @ts-ignore "TS2741: Property 'prototype' is missing but required in type 'IDBOpenDBRequest'", only occurs with Electron
                const fakeRequest: IDBOpenDBRequest = {
                    onblocked: null,
                    onupgradeneeded: null,
                    addEventListener: function (): void {
                        throw new Error("Function not implemented.");
                    },
                    removeEventListener: function (): void {
                        throw new Error("Function not implemented.");
                    },
                    error: null,
                    onerror: null,
                    onsuccess: null,
                    readyState: "done",
                    result: undefined as unknown as IDBDatabase,
                    source: null as unknown as IDBObjectStore,
                    transaction: null,
                    dispatchEvent: function (): boolean {
                        throw new Error("Function not implemented.");
                    }
                }
                const originalRequest: IDBOpenDBRequest = originalDeleteDatabase.apply(window.shimIndexedDB, [name]);
                originalRequest.onsuccess = async (event: Event) => {
                    await fakeRequest.onsuccess?.(event);
                    await deleteDatabase(escapeDatabaseName(name));
                }
                originalRequest.onerror = (event: Event) => fakeRequest.onerror?.(event);
                originalRequest.onblocked = (event: Event) => fakeRequest.onblocked?.(event as IDBVersionChangeEvent);
                originalRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => fakeRequest.onupgradeneeded?.(event);

                return fakeRequest;
            }

            window.estimateCustomStorage = () => estimateCustomStorage(cordova.file.applicationStorageDirectory + "databases");
            window.isStoragePersisted = () => true;

        } else if (Platform.is.ios) {
            const versionNumber = parseInt(window.navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/)?.[1] ?? "0");

            if (versionNumber >= 16) {
                window.estimateCustomStorage = () => estimateCustomStorage(cordova.file.applicationStorageDirectory + "/Library/WebKit/WebsiteData/Default");
            } else {
                window.estimateCustomStorage = () => estimateCustomStorage(cordova.file.applicationStorageDirectory + "/Library/WebKit/WebsiteData/IndexedDB/v1");
            }
        }
    }, false);
}

export default boot(() => undefined);
