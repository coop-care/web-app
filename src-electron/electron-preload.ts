/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 */

import { contextBridge } from "electron"
import { ipcRenderer } from "electron"

const secureEventTypes = [
    "did-change-locale"
] as const
export type SecureEventType = (typeof secureEventTypes)[number]


contextBridge.exposeInMainWorld("electronAPI", {

    didChangeLocale: (locale: string) => 
        ipcRenderer.send("did-change-locale", locale),

    addListener: (event: SecureEventType, handler: (...args: unknown[]) => void) => {
        if (secureEventTypes.includes(event)) {
            ipcRenderer.on(event, (_, ...args) => handler(...args))
        }
    },

    removeListener: (event: SecureEventType, handler: (...args: unknown[]) => void) => {
        if (secureEventTypes.includes(event)) {
            ipcRenderer.off(event, (_, ...args) => handler(...args))
        }
    },

    checkForUpdates: (isInitiatedByUser = true) => 
        ipcRenderer.send("check-for-updates", isInitiatedByUser),

    vault: {
        get: (service: string, account: string): Promise<string | undefined> => {
            return ipcRenderer.invoke("get-password", service, account)
        },
        set: async (service: string, account: string, password: string): Promise<void> => {
            return ipcRenderer.invoke("set-password", service, account, password);
        },
        remove: async (service: string, account: string): Promise<boolean> => {
            return ipcRenderer.invoke("remove-password", service, account);
        }
    }
})
