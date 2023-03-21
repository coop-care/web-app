import { app, Menu, MenuItem, BrowserWindow/*, shell*/ } from "electron"
import { $i18n, changeLocale } from "./i18n"
// import { createWindow } from "./window"
import { isMac } from "./helper"
import { checkForUpdates } from "./updater"

export function setupAppMenu() {
    const template = [
        ...(isMac ? [{
            label: app.name,
            submenu: [
                {
                    label: $i18n.t("AboutApp", { appname: app.name }),
                    role: "about"
                },
                {
                    label: $i18n.t("CheckForUpdates"),
                    click: checkForUpdates,
                    id: "checkForUpdates"
                },
                { type: "separator" },
                {
                    label: $i18n.t("Services"),
                    role: "services"
                },
                { type: "separator" },
                {
                    label: $i18n.t("HideApp", { appname: app.name }),
                    role: "hide"
                },
                {
                    label: $i18n.t("HideOthers"),
                    role: "hideOthers"
                },
                {
                    label: $i18n.t("Unhide"),
                    role: "unhide"
                },
                { type: "separator" },
                {
                    label: $i18n.t("QuitApp", { appname: app.name }),
                    role: "quit"
                }
            ]
        }] : []),
        {
            label: $i18n.t("File"),
            submenu: [
                // {
                //     label: $i18n.t("NewWindow"),
                //     accelerator: "CommandOrControl+N",
                //     click: createWindow
                // },
                // { type: "separator" },
                ...(isMac ? [
                    {
                        label: $i18n.t("CloseWindow"),
                        role: "close"
                    },
                    { type: "separator" },
                ] : []),
                {
                    label: $i18n.t("Print"),
                    accelerator: "CommandOrControl+P",
                    click: print,
                    id: "print"
                },
                ...(!isMac ? [
                    { type: "separator" },
                    {
                        label: $i18n.t("Exit"),
                        role: "quit"
                    }
                ] : []),
            ]
        },
        {
            label: $i18n.t("Edit"),
            submenu: [
                {
                    label: $i18n.t("Undo"),
                    role: "undo"
                },
                {
                    label: $i18n.t("Redo"),
                    role: "redo"
                },
                { type: "separator" },
                {
                    label: $i18n.t("Cut"),
                    role: "cut"
                },
                {
                    label: $i18n.t("Copy"),
                    role: "copy"
                },
                {
                    label: $i18n.t("Paste"),
                    role: "paste"
                },
                ...(isMac ? [
                    {
                        label: $i18n.t("PasteAndMatchStyle"),
                        role: "pasteAndMatchStyle"
                    },
                    {
                        label: $i18n.t("Delete"),
                        role: "delete"
                    },
                    {
                        label: $i18n.t("SelectAll"),
                        role: "selectAll"
                    },
                    { type: "separator" },
                    {
                        label: $i18n.t("Speech"),
                        submenu: [
                            {
                                label: $i18n.t("StartSpeaking"),
                                role: "startSpeaking"
                            },
                            {
                                label: $i18n.t("StopSpeaking"),
                                role: "stopSpeaking"
                            }
                        ]
                    }
                ] : [
                    {
                        label: $i18n.t("Delete"),
                        role: "delete"
                    },
                    { type: "separator" },
                    {
                        label: $i18n.t("SelectAll"),
                        role: "selectAll"
                    }
                ])
            ]
        },
        {
            label: $i18n.t("View"),
            submenu: [
                {
                    label: $i18n.t("Language"),
                    submenu: $i18n.availableLocales.map(locale => ({
                        type: "checkbox",
                        label: $i18n.t(locale.toLowerCase()),
                        click: (menuItem: MenuItem) => changeLocale(menuItem.id),
                        id: locale,
                        checked: $i18n.locale == locale
                    }))
                },
                { type: "separator" },
                {
                    label: $i18n.t("Reload"),
                    role: "forceReload"
                },
                { type: "separator" },
                {
                    label: $i18n.t("ResetZoom"),
                    role: "resetZoom"
                },
                {
                    label: $i18n.t("ZoomIn"),
                    role: "zoomIn"
                },
                {
                    label: $i18n.t("ZoomOut"),
                    role: "zoomOut"
                },
                { type: "separator" },
                {
                    label: $i18n.t("ToggleFullscreen"),
                    role: "togglefullscreen"
                }
            ]
        },
        isMac ? {
            label: $i18n.t("Window"),
            role: "windowMenu",
        } : {
            label: $i18n.t("Window"),
            submenu: [
                {
                    label: $i18n.t("MinimizeWindowOnWindows"),
                    role: "minimize"
                },
                {
                    label: $i18n.t("ZoomWindow"),
                    role: "zoom"
                },
                {
                    label: $i18n.t("CloseWindow"),
                    role: "close"
                },
            ]
        },
        {
            label: $i18n.t("Help"),
            role: "help",
            submenu: [
                // {
                //     label: $i18n.t("Feedback"),
                //     click: () => shell.openExternal("mailto:feedback@coopcare.de?subject=Feedback"),
                //     id: "feedback",
                // },
                // {
                //     label: $i18n.t("Acknowledgements"),
                //     click: routeApp,
                //     id: "acknowledgements",
                // },
                // {
                //     label: $i18n.t("Contribute"),
                //     click: () => shell.openExternal("https://www.coopcare.de/en/contributing/"),
                //     id: "contribute",
                // },
                // {
                //     label: $i18n.t("Privacy Policy"),
                //     click: routeApp,
                //     id: "privacy-policy",
                // },
                // {
                //     label: $i18n.t("Legal Notice"),
                //     click: routeApp,
                //     id: "legal-notice",
                // },
                ...(!isMac ? [
                    { type: "separator" },
                    {
                        label: $i18n.t("AboutApp", { appname: app.name }),
                        role: "about"
                    },
                    {
                        label: $i18n.t("CheckForUpdates"),
                        click: checkForUpdates,
                        id: "checkForUpdates"
                    },
                ] : []),
            ]
        }
    ]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const menu = Menu.buildFromTemplate(template as any)
    Menu.setApplicationMenu(menu)
}

export function setMenuItemEnabled(id: string, enabled: boolean) {
    const menuItem = Menu.getApplicationMenu()?.getMenuItemById(id)

    if (menuItem) {
        menuItem.enabled = enabled
    }
}

function print(menuItem: MenuItem, browserWindow?: BrowserWindow) {
    browserWindow?.webContents.print()
}

// function routeApp(menuItem: MenuItem, browserWindow?: BrowserWindow) {
//     const window = browserWindow || createWindow()
//     const url = `${process.env.APP_URL || ""}/#/${menuItem.id}`
//     void window.loadURL(url)
// }