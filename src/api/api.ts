import Vue from "vue";
import StitchApi from "./stitch";
import CoopCareApiInterface from "./coopCareApiInterface";

declare module "vue/types/vue" {
    interface Vue {
        $ccApi: CoopCareApiInterface;
    }
}

export const ccApi = new StitchApi("openomaha-elgvq", "openomaha", "clients");

Vue.prototype.$ccApi = ccApi;
