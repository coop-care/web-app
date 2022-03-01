/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { app, BrowserWindow, nativeTheme, Menu } from "electron"

try {
  if (process.platform === "win32" && nativeTheme.shouldUseDarkColors === true) {
    require("fs").unlinkSync(require("path").join(app.getPath("userData"), "DevTools Extensions"))
  }
} catch (_) { }

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = __dirname
}

let mainWindow

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      // Change from /quasar.conf.js > electron > nodeIntegration;
      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: process.env.QUASAR_NODE_INTEGRATION,
      nodeIntegrationInWorker: process.env.QUASAR_NODE_INTEGRATION,

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      // preload: path.resolve(__dirname, "electron-preload.js")
    }
  })

  mainWindow.loadURL(process.env.APP_URL)

  mainWindow.on("closed", () => {
    mainWindow = null
  })

  const isMac = process.platform === "darwin";

  const template = [
    { role: "appMenu" },
    { role: "fileMenu" },
    { role: "editMenu" },
    // { role: "viewMenu" }
    { role: "windowMenu" },
    {
      role: "help",
      submenu: [
        {
          label: "Learn More",
          click: async () => {
            const { shell } = require("electron")
            await shell.openExternal("https://electronjs.org")
          }
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
  }
})
