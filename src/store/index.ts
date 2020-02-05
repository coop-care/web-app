import Vue from "vue";
import Vuex from "vuex";
import { ObjectID } from "bson";
import { downloadJSON } from "../helper/download";
import { colors } from "quasar";
import { Client } from "../models/client";
import { createDirectStore } from "direct-vuex";
import getters from "./getters";
import mutations from "./mutations";
import actions from "./actions";

const { setBrand } = colors;

Vue.use(Vuex);

export interface StoreState {
    clients: Client[];
    selectedClientId: ObjectID | undefined;
    isLoadingClient: boolean;
    isLoadingClientList: boolean;
}

const { store, rootActionContext, moduleActionContext } = createDirectStore({
    state: {
        clients: [],
        selectedClientId: undefined,
        isLoadingClient: false,
        isLoadingClientList: false
    } as StoreState,
    getters,
    mutations,
    actions,

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: (process.env.DEV as unknown) === true || process.env.DEV === "true"
});

store.dispatch.fetchClientsFromDB();

setBrand("classification", "#f44336");
setBrand("outcome", "#009688");
setBrand("intervention", "#ff6f00");

// @ts-ignore
window.download = () => downloadJSON(store.state.clients || [], "sample1.json");

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
