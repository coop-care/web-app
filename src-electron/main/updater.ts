import { dialog, ipcMain, shell } from "electron"
import { autoUpdater } from "electron-updater"
import { setMenuItemEnabled } from "./menu"
import { $i18n } from "./i18n"
import { reportError } from "../../src/helper/utils"
import { fileSize } from "../../src/boot/i18n"

/* Based on main documentation at https://www.electron.build/auto-update and several examples:
   - https://github.com/electron-userland/electron-builder/blob/docs-deprecated/encapsulated%20manual%20update%20via%20menu.js
   - https://gist.github.com/iffy/0ff845e8e3f59dbe7eaf2bf24443f104
   - https://github.com/iffy/electron-updater-example
*/

let wasInitiatedByUser = true;

export function setupUpdater() {
    autoUpdater.autoDownload = false;

    ipcMain.on("check-for-updates", (_, isInitiatedByUser: boolean) => {
        wasInitiatedByUser = isInitiatedByUser;
        void checkForUpdates();
    })
}

autoUpdater.on("error", (error) => {
    void dialog.showMessageBox({
        type: "error",
        title: $i18n.t("GenericErrorTitle"),
        message: $i18n.t("GenericUpdateError"),
        buttons: [$i18n.t("OK"), $i18n.t("reportErrorViaMail")],
        defaultId: 0,
    }).then(value => {
        if (value.response === 1) {
            void shell.openExternal(reportError(error, "Error while updating"))
        }
    })
    setMenuItemEnabled("checkForUpdates", true);
    wasInitiatedByUser = true;
})

autoUpdater.on("update-available", (info) => {
    void dialog.showMessageBox({
        type: "info",
        title: $i18n.t("updateAvailableTitle"),
        message: $i18n.t("updateAvailable", {
            availableVersion: info.version,
            installedVersion: process.env.APP_VERSION,
            downloadSize: info.files[0].size
                ? $i18n.t("fileSizeUpdate", { fileSize: fileSize(info.files[0].size) })
                : undefined
        }),
        buttons: [$i18n.t("Yes"), $i18n.t("remindLaterButton")],
        defaultId: 0,
        cancelId: 1,
    }).then(value => {
        if (value.response === 0) {
            void autoUpdater.downloadUpdate();
        } else {
            setMenuItemEnabled("checkForUpdates", true);
        }
    });
    wasInitiatedByUser = true;
})

autoUpdater.on("update-not-available", (info) => {
    if (wasInitiatedByUser) {
        void dialog.showMessageBox({
            title: $i18n.t("updateUnavailableTitle"),
            message: $i18n.t("updateUnavailable", {version: process.env.APP_VERSION}),
            buttons: [$i18n.t("OK")],
            defaultId: 0,
            cancelId: 0,
        })
    }

    setMenuItemEnabled("checkForUpdates", true);
    wasInitiatedByUser = true;
})

autoUpdater.on("update-downloaded", (event) => {
    void dialog.showMessageBox({
        title: $i18n.t("updateDownloadedTitle"),
        message: $i18n.t("updateDownloaded"),
        buttons: [$i18n.t("restartButton"), $i18n.t("laterButton")],
        defaultId: 0,
        cancelId: 1,
    }).then(value => {
        if (value.response === 0) {
            autoUpdater.quitAndInstall()
        }
    })
})

autoUpdater.on("checking-for-update", () => undefined)

autoUpdater.on("download-progress", (progressInfo) => undefined)

export async function checkForUpdates() {
    setMenuItemEnabled("checkForUpdates", false);
    await autoUpdater.checkForUpdates();
}
