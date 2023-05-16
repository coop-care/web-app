import { app, BrowserWindow, dialog, session, shell } from "electron"
import { $i18n } from "./i18n"

/** 
 * disable all session permissions requests from remote content (which should never be loaded anyway) 
 * and allow all permissions for local content from APP_URL 
 */
export function handlePermissionRequests() {
    session.fromPartition("default-partition").setPermissionRequestHandler((webContents, permission, callback) => {
        if (isAppUrlOrigin(webContents.getURL())) {
            return callback(true);
        } else {
            return callback(false);
        }
    })
}

app.on("web-contents-created", (event, contents) => {
    // disables the creation of webviews from renderer process,
    // see https://www.electronjs.org/docs/latest/tutorial/security#12-verify-webview-options-before-creation
    contents.on("will-attach-webview", event => event.preventDefault())

    // limit navigation to APP_URL only,
    // see https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
    contents.on("will-navigate", (event, navigationUrl) => {
        if (!isAppUrlOrigin(navigationUrl)) {
            event.preventDefault()

            if (isAllowedScheme(navigationUrl)) {
                void shell.openExternal(navigationUrl)
            }
        }
    })

    // limit creation of new windows to APP_URL only and open external http(s) URLs with openExternal (in system browser),
    // see https://www.electronjs.org/docs/latest/tutorial/security
    contents.setWindowOpenHandler(({ url }) => {
        const { protocol } = new URL(url);

        if (isAppUrlOrigin(url)) {
            return { action: "allow" }

        } else if (isAllowedScheme(url)) {
            setImmediate(() => {
                void shell.openExternal(url)
            })

            return { action: "deny" }

        } else if (["https:", "http:"].includes(protocol)) {
            const selectedButtonIndex = dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow() as BrowserWindow, {
                message: $i18n.t("openExternalLinkDialogMessage"),
                detail: url,
                type: "question",
                buttons: [$i18n.t("Yes"), $i18n.t("No")],
                defaultId: 0,
                cancelId: 1
            })

            if (selectedButtonIndex == 0) {
                setImmediate(() => {
                    void shell.openExternal(url)
                })
            }

            return { action: "deny" }

        } else {
            return { action: "deny" }
        }
    })
})

function isAppUrlOrigin(url: string) {
    const parsedUrl = new URL(url);
    const appUrl = new URL(process.env.APP_URL || "");
    return parsedUrl.protocol == appUrl.protocol  /* "file:" in production */
        && parsedUrl.origin == appUrl.origin /* null in production */
        && parsedUrl.pathname == appUrl.pathname;  /* path to index.html in production */
}

function isAllowedScheme(url: string) {
    const parsedUrl = new URL(url);
    const allowList = ["mailto:", "tel:", "maps:", "geo:"];
    return allowList.includes(parsedUrl.protocol);
}
