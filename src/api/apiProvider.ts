import Vue from "vue";
import CoopCareApiInterface from "./coopCareApiInterface";
import DemoApi from "./demo";
import StitchApi from "./stitch";

declare module "vue/types/vue" {
    interface Vue {
        $ccApi: CoopCareApiInterface;
    }
}

let ccApi: CoopCareApiInterface;

if (process.env.BACKEND == "demo") {
    ccApi = new DemoApi();
} else {
    ccApi = new StitchApi("openomaha-elgvq", "openomaha", "clients");
}

export { ccApi };
Vue.prototype.$ccApi = ccApi;
