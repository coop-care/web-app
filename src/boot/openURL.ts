import { Platform } from "quasar";
import { boot } from "quasar/wrappers";

export default boot(() => {
    // see https://github.com/apache/cordova-ios/blob/master/guides/Cordova%20Custom%20URL%20Scheme%20Handling.md
    if (Platform.is.cordova) {
        window.handleOpenURL = (url: string) => {
            setTimeout(() => {
                console.log("handleOpenURL:", url);
            }, 0)
        }
    }
})