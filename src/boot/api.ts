import { boot } from "quasar/wrappers";
import CoopCareApiInterface from "../api/coopCareApiInterface";
import { ccApi } from "../api/apiProvider";

declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $ccApi: CoopCareApiInterface;
    }
}

export default boot(({ app }) => {
    // for Options API
    app.config.globalProperties.$ccApi = ccApi;
    // for Composition API
    app.provide("ccApi", ccApi);
});
