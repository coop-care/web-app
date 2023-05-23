import { copyToClipboard } from "quasar";
import { promise as promisify } from "./utils";

declare global {
    interface CordovaPlugins {
        clipboard: {
            copy: (text: string, onSuccess: () => void, onError: (error: Error) => void) => void
        } | undefined;
    }
}

export async function copyText(text: string) {
    let promise: Promise<void>;

    /* Copying to clipboard from android webview (cordova) failed due to missing permissions.
       I tried a lot with permissions, but couldn't make this work, so we're using a plugin. */
    if (window.cordova?.plugins?.clipboard?.copy) {
        promise = promisify(window.cordova?.plugins?.clipboard?.copy, text);
    } else {
        promise = copyToClipboard(text);
    }

    let result = false; 
    await promise
        .then(() => result = true)
        .catch(console.error);

    return result;
}
