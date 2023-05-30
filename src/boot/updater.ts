import { Platform } from "quasar";
import { boot } from "quasar/wrappers";
import * as AppSettings from "src/database/AppSettings";
import { UpdateAvailableInfo, bus } from "./eventBus";
import { i18n, locale } from "src/boot/i18n";
import { notifyError } from "src/helper/notify";

const updateCheckInterval = 24 * 60 * 60 * 1000;

export default boot(() => {
    if (!Platform.is.electron && !Platform.is.cordova) {
        return;
    }

    setTimeout(() => void checkForUpdatesIfNeeded(), 2 * 1000)
    setInterval(() => void checkForUpdatesIfNeeded(), updateCheckInterval);
});

async function checkForUpdatesIfNeeded() {
    const lastUpdated = await AppSettings.get<number>("lastUpdated") ?? 0;

    if (lastUpdated + updateCheckInterval <= Date.now()) {
        await checkForUpdates(false);
    }
}

export async function checkForUpdates(isInitiatedByUser = true) {
    try {
        if (Platform.is.electron) {
            window.electronAPI?.checkForUpdates(isInitiatedByUser);
        } else if (Platform.is.cordova) {
            if (Platform.is.android) {
                await checkForUpdatesAndroid(!isInitiatedByUser);
            } else if (Platform.is.ios) {
                await checkForUpdatesIOS(!isInitiatedByUser);
            }
        } else {
            checkForUpdatesDebugInBrowser();
        }
    } catch (error) {
        console.error(error);
        notifyError(i18n.t("CheckForUpdatesError"));
    }

    await AppSettings.set("lastUpdated", Date.now());
}

async function checkForUpdatesAndroid(silent: boolean) {
    const ApkUpdater = window.ApkUpdater;

    if (ApkUpdater) {
        const response = await fetch(process.env.UPDATE_URL + "app-release.json");
        const json = await response.json();
        const installedVersion = await ApkUpdater.getInstalledVersion();

        emitUpdateAvailability(
            installedVersion.version.code < json.app.version.code,
            {
                installedVersion: process.env.APP_VERSION || installedVersion.version.name || "0.0.1",
                availableVersion: json.app.version.name,
                downloadSize: json.compressedSize,
                downloadUrls: [process.env.UPDATE_URL + json.name],
            },
            silent
        )
    }
}

async function checkForUpdatesIOS(silent: boolean) {
    const appleAppId = process.env.APPLE_APP_ID;
    const installedVersion = process.env.APP_VERSION ?? "0.0.1";

    if (process.env.IS_TESTFLIGHT == "true") {
        const response = await fetch(process.env.UPDATE_URL + "testflight.json");
        const json = await response.json();
        const availableVersion = json?.version ?? "";
        const storeUrl = json?.testflightUrl ?? "";

        emitUpdateAvailability(
            isAvailableVersionGreater(availableVersion, installedVersion),
            { installedVersion, availableVersion, storeUrl },
            silent
        )

    } else if (appleAppId) {
        const storeUrl = "https://apps.apple.com/app/" + appleAppId; // alternative scheme: itms-apps://
        const lookupUrl = "https://itunes.apple.com/lookup?id=" + appleAppId;
        const localeComponents = locale.value.toLowerCase().split("-");
        const lang = localeComponents.join("_");
        const country = localeComponents.pop();

        const lookupItunes = (url: string) => fetch(url)
            .then(async response => (await response.json())?.results?.[0])
            .then(({ version, fileSizeBytes, currentVersionReleaseDate, releaseNotes }) => ({
                version, fileSizeBytes, currentVersionReleaseDate, releaseNotes
            }))

        const result = await lookupItunes(lookupUrl + `&lang=${lang}&country=${country}`)
            .catch(() => lookupItunes(lookupUrl))
            .catch(() => undefined);
        const availableVersion = result?.version ?? "";
        const downloadSize = result?.fileSizeBytes;
        
        emitUpdateAvailability(
            isAvailableVersionGreater(availableVersion, installedVersion),
            { installedVersion, availableVersion, downloadSize, storeUrl },
            silent
        )
    }
}

function checkForUpdatesDebugInBrowser() {
    emitUpdateAvailability(Math.random() > 0.5, {
        installedVersion: process.env.APP_VERSION || "0.0.1",
        availableVersion: "0.1.0",
        downloadSize: 12345678,
        downloadUrls: [process.env.UPDATE_URL + "app-release.apk"]
    });
}

function emitUpdateAvailability(isAvailable: boolean, updateInfo: UpdateAvailableInfo, silent = false) {
    if (isAvailable) {
        bus.emit("update-available", updateInfo);
    } else if (!silent) {
        bus.emit("update-unavailable", {
            installedVersion: updateInfo.installedVersion
        });
    }
}

/**
 * compare two version strings in semantic versioning format like {major}.{minor}.{patch}
 */
function isAvailableVersionGreater(availableVersion: string, installedVersion: string) {
    return availableVersion.localeCompare(installedVersion, undefined, { numeric: true }) === 1;
};

/** 
 * only for Cordova Android 
 */
export async function downloadAndInstall(urls: string[]) {
    if (!Platform.is.cordova || !Platform.is.android) {
        return;
    }

    const ApkUpdater = window.ApkUpdater;
    const url = urls[0];

    if (!ApkUpdater) {
        return;
    }

    try {
        const options = {
            onDownloadProgress: (event: any) => event.progress,
            onUnzipProgress: (event: any) => event.progress
        };
        try {
            await ApkUpdater.download(url.replace(/\.apk$/, ".zip"), options);
        } catch (error) {
            await ApkUpdater.download(url, options);
        }
        await ApkUpdater.install();
    } catch (error) {
        console.error(error);
        notifyError(
            i18n.t("DownloadUpdateError"), 
            i18n.t("OperationWasCanceled")
        );
    }
}
