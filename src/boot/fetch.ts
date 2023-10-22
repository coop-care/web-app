import { Platform } from "quasar";
import { boot } from "quasar/wrappers";

/* Overriding Fetch API on Cordova iOS to ensure the expected Response-MIME-Type is set
for Automerge WASM. It needs to be "application/wasm" instead of "application/octet-stream".
No idea why Cordova on iOS gets it wrong. */
if (Platform.is.cordova && Platform.is.ios) {
    const originalFetch = window.fetch;
    window.fetch = async (resource, options) => {
        if (resource.constructor == String && resource.endsWith(".wasm")) {
            const response = await originalFetch(resource, options);
            const modifiedResponse = new Response(await response.arrayBuffer());
            modifiedResponse.headers.append("Content-Type", "application/wasm");
            return Promise.resolve(modifiedResponse);
        } else {
            return originalFetch(resource as RequestInfo | URL, options);
        }
    }
}

export default boot(() => undefined)