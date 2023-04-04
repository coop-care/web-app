/* eslint-disable @typescript-eslint/no-explicit-any */
import { SecureEventType } from "../src-electron/electron-preload"

export interface ElectronAPI {
    didChangeLocale: (locale: string) => void;
    addListener: (event: SecureEventType, handler: (...args: any[]) => void) => void;
    removeListener: (event: SecureEventType, handler: (...args: any[]) => void) => void;
    checkForUpdates: (isInitiatedByUser: boolean) => void;
    vault: {
        get: (service: string, account: string) => Promise<string | undefined>;
        set: (service: string, account: string, password: string) => Promise<void>;
        remove: (service: string, account: string) => Promise<boolean>;
    };
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
        sqlitePlugin?: any;
        shimIndexedDB?: any;
        estimateCustomStorage?: () => Promise<StorageEstimate>;
        isStoragePersisted?: () => boolean;
        handleOpenURL?: (url: string) => void;
        ApkUpdater?: {
            download: (url: string, options: Record<string, any>) => Promise<void>;
            install: () => Promise<void>;
            getInstalledVersion: () => Promise<{
                version: {
                    code: number;
                    name: string;
                }
            }>;
        };
        plugins?: {
            socialsharing?: {
                shareWithOptions: (options: { message?: string; subject?: string; files?: string[]; url?: string; }) => void
            }
        };
    }

    interface Cordova {
        plugin?: {
            http?: {
                sendRequest: (url: string, options: Record<string, any> | undefined, success: (response: any) => void, error: (response: any) => void) => void;
            };
        };
        InAppBrowser?: {
            open: (url: string, target?: string, options?: Record<string, any>) => any;
        };
        file: {
            applicationStorageDirectory: string;
        }
    }
}
