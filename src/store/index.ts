import Vue from "vue";
import Vuex from "vuex";
import { Download } from "../helper/download";
import { colors } from "quasar";
import { Customer } from "../models/customer";
import { createDirectStore } from "direct-vuex";
import getters from "./getters";
import mutations from "./mutations";
import actions from "./actions";

const { setBrand } = colors;

Vue.use(Vuex);

export interface StoreState {
    customers: Customer[];
    selectedCustomer: Customer | undefined;
    isLoadingCustomer: boolean;
    isLoadingCustomerList: boolean;
}

const { store, rootActionContext, moduleActionContext } = createDirectStore({
    state: {
        customers: [],
        selectedCustomer: undefined,
        isLoadingCustomer: false,
        isLoadingCustomerList: false
    } as StoreState,
    getters,
    mutations,
    actions,

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: (process.env.DEV as unknown) === true || process.env.DEV === "true"
});

setBrand("classification", "#f44336");
setBrand("outcome", "#009688");
setBrand("intervention", "#ff6f00");

// @ts-ignore
window.download = () => {
    Download.json(store.state.selectedCustomer || {}, "sample1.json");
};

// Export the original Vuex store because of quasar
export default store.original;

// the typesafe, direct store
export { store };

// The following exports will be used to enable types in the
// implementation of actions.
export { rootActionContext, moduleActionContext };

// The following lines enable types in the injected store '$store'.
export type AppStore = typeof store;
declare module "vuex" {
    interface Store<S> {
        direct: AppStore;
    }
}
