import { route } from "quasar/wrappers";
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from "vue-router";
import { StateInterface } from "../store";
import routes from "./routes";
import { ccApi } from "../api/apiProvider";
import LocalDatabaseApi from "src/api/local";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route<StateInterface>(function ({ store }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === "history" ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: (to, from, savedPosition) => {
      if (savedPosition) {
        return savedPosition;
      } else if (to.meta.noScroll && (to.params.clientId == from.params.clientId)) {
        return undefined;
      } else {
        return { left: 0, top: 0 };
      }
    },
    routes,

    // Leave this as is and make changes in quasar.config.js instead!
    // quasar.config.js -> build -> vueRouterMode
    // quasar.config.js -> build -> publicPath
    history: createHistory(
      process.env.MODE === "ssr" ? void 0 : process.env.VUE_ROUTER_BASE
    ),
  });

  Router.beforeEach((to, from, next) => {
    // console.log("before each. to:", to.name, "from:", from.name);

    if (!!to.params.sheet && !(to.meta.sheets as Record<string, any>)?.[to.params.sheet as string]) {
      console.error(`component not registered for sheet '${to.params.sheet}' at route '${to.name?.toString()}'`);
    }

    if (ccApi.isLoggedIn) {
      if (to.name == "login") {
        next({ name: "clientNoneSelected" });
      } else {
        (ccApi as LocalDatabaseApi).setLocalValue?.("currentPath", to.path);
        next();
      }
    } else {
      if (to.meta.noAuth) {
        next();
      } else {
        store.direct.commit.setRedirectPath(to.path);
        next({ name: "login" });
      }
    }
  });

  Router.afterEach((to, from) => {
    if (to.name == "login") {
      to.meta.transition = "fade"
    } else if (from.name == "login") {
      to.meta.transition = "fade"
    }
  })

  return Router;
});
