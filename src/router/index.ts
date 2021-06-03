import { route } from "quasar/wrappers"
import VueRouter from "vue-router"
import { Store } from "vuex"
import { StateInterface } from "../store"
import routes from "./routes"
import { ccApi } from "../api/apiProvider";
import store from "../store";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default route<Store<StateInterface>>(function ({ Vue }) {
  Vue.use(VueRouter)

  const Router = new VueRouter({
    scrollBehavior: (to, from, savedPosition) => {
      if (savedPosition) {
        return savedPosition;
      } else if (to.name?.startsWith("client") &&
        (to.params.clientId == from.params.clientId)) {
        return undefined;
      } else {
        return { x: 0, y: 0 };
      }
    },
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  Router.beforeEach((to, from, next) => {
    // console.log("before each. to:", to.name, "from:", from.name);
    if (ccApi.isLoggedIn) {
      if (store.state.currentUser?.signature == "" && to.name != "userSettings") {
        next({ name: "userSettings" });
      } else {
        if (store.state.redirectPath) {
          const path = store.state.redirectPath;
          store.direct.commit.setRedirectPath("");
          next(path);
        } else {
          next();
        }
      }
    } else {
      if (["login", "register", "confirm", "requestPasswordReset", "resetPassword"]
        .includes(to.name || "")
      ) {
        next();
      } else {
        store.direct.commit.setRedirectPath(to.path);
        next({ name: "login" });
      }
    }
  });

  return Router
})
