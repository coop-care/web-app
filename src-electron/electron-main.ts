import { app, BrowserWindow, nativeTheme } from "electron"
import path from "path"
import { unlinkSync } from "fs"
import { platform, isMac } from "./main/helper"
import { handlePermissionRequests } from "./main/security"
import { setupI18n } from "./main/i18n"
import { setupAppMenu, setMenuItemEnabled } from "./main/menu"
import { createWindow } from "./main/window"
import { setupKeySafe } from "./main/keysafe"
import { setupUpdater } from "./main/updater"

// workaround for DevTools on Windows with dark mode
try {
  if (platform === "win32" && nativeTheme.shouldUseDarkColors === true) {
    unlinkSync(path.join(app.getPath("userData"), "DevTools Extensions"))
  }
}
catch (_) { }

void app.whenReady()
  .then(handlePermissionRequests)
  .then(setupKeySafe)
  .then(setupI18n)
  .then(setupAppMenu)
  .then(setupUpdater)
  .then(createWindow)

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit()
  } else {
    setMenuItemEnabled("print", false)
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
