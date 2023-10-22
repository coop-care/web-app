import { BrowserWindow } from "electron"
import path from "path"
import { isMac } from "./helper"
import { setMenuItemEnabled } from "./menu"

export function createWindow() {
    const window = new BrowserWindow({
        icon: path.resolve(__dirname, "icons/icon.png"), // tray icon
        width: 1024,
        height: 768,
        minWidth: 320,
        minHeight: 480,
        useContentSize: true,
        webPreferences: {
            contextIsolation: true,
            // More info: /quasar-cli/developing-electron-apps/electron-preload-script
            preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD || ""),
        },
        titleBarStyle: isMac ? "hidden" : "default",
        // titleBarOverlay: {
        //   color: "#1976D2",
        //   symbolColor: "#ffffff",
        // },
    })

    void window.loadURL(process.env.APP_URL || "")
    setMenuItemEnabled("print", true)

    if (process.env.DEBUGGING) {
        // if on DEV or Production with debug enabled
        window.webContents.openDevTools()
    } else {
        // we're on production; no access to devtools pls
        window.webContents.on("devtools-opened", () => {
            window.webContents.closeDevTools()
        })
    }

    // disable devtools shortcuts in production and enable them with debug
    window.webContents.on("before-input-event", (event, input) => {
        if (input.code == "KeyI" && ((!isMac && input.control && input.shift) || (isMac && input.alt && input.meta))) {
            if (process.env.DEBUGGING) {
                if (!window.webContents.isDevToolsOpened()) {
                    window.webContents.openDevTools()
                } else {
                    window.webContents.closeDevTools()
                }
            } else {
                event.preventDefault()
            }
        }
    })

    return window
}