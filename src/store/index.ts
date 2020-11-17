import Vue from "vue";
import Vuex from "vuex";
import { Client, User, Team, TeamMember } from "../models";
import { createDirectStore } from "direct-vuex";
import getters from "./getters";
import mutations from "./mutations";
import actions from "./actions";

Vue.use(Vuex);

export interface StateInterface {
    currentUser?: User;
    teams: Team[];
    teamMembers: Record<string, TeamMember>;
    clients: Client[];
    isLoadingClientList: boolean;
}

const { store, rootActionContext, moduleActionContext } = createDirectStore({
    state: {
        currentUser: undefined,
        teams: [],
        teamMembers: {},
        clients: [],
        isLoadingClientList: false
    } as StateInterface,
    getters,
    mutations,
    actions,

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: (process.env.DEV as unknown) === true || process.env.DEV === "true"
});

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Store<S> {
        direct: AppStore;
    }
}
