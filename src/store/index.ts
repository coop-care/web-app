// import { store as storeWrapper } from "quasar/wrappers"
import { InjectionKey } from "vue"
import { Router } from "vue-router"
import {
  // createStore,
  Store as VuexStore,
  useStore as vuexUseStore,
} from "vuex"
import { createDirectStore } from "direct-vuex"
import { Client, User, Team, TeamMember, BackOffice } from "../models";
import getters from "./getters";
import mutations from "./mutations";
import actions from "./actions";

// import example from './module-example'
// import { ExampleStateInterface } from './module-example/state';

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export interface StateInterface {
    // persistent data:
    teams: Team[];
    teamMembers: Record<string, TeamMember>;
    backoffices: BackOffice[];
    clients: Client[];
    currentUser?: User;
    // ephemeral state:
    isLoadingClientList: boolean;
    redirectPath: string;
}

// provide typings for `this.$store`
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $store: VuexStore<StateInterface>
  }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<StateInterface>> = Symbol("vuex-key")

// Provide typings for `this.$router` inside Vuex store
 declare module "vuex" {
   export interface Store<S> {
     readonly $router: Router;
     direct: typeof store;
     readonly state: S;
   }
 }

const { store, rootActionContext, moduleActionContext } = createDirectStore({
    state: {
        // persistent data:
        teams: [],
        teamMembers: {},
        backoffices: [],
        clients: [],
        currentUser: undefined,
        // ephemeral state:
        isLoadingClientList: false,
        redirectPath: "",
    } as StateInterface,
    getters,
    mutations,
    actions,

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: (process.env.DEV as unknown) === true || process.env.DEV === "true"
});

// export default storeWrapper(function (/* { ssrContext } */) {
//   const Store = createStore<StateInterface>({
//     modules: {
//       // example
//     },

//     // enable strict mode (adds overhead!)
//     // for dev mode and --debug builds only
//     strict: !!process.env.DEBUGGING
//   })

//   // Export the original Vuex store because of quasar
//   return Store;
// })

// Export the original Vuex store because of quasar
export default store.original;

// the typesafe, direct store
export { store };

// The following exports will be used to enable types in the
// implementation of actions.
export { rootActionContext, moduleActionContext };

export function useStore() {
  return vuexUseStore(storeKey)
}
