import Vue from 'vue';
import VueRouter from 'vue-router';

import routes from './routes';

import { stitch } from '../boot/stitch';

Vue.use(VueRouter);

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE,
  });

  Router.beforeEach((to, from, next) => {
    // console.log("before each. to:", to.name, "from:", from.name);
    if (stitch.auth.isLoggedIn) {
      next()
    } else {
      if (to.name === 'login') { next() }
      else if (to.name === 'register') { next() }
      else if (to.name === 'confirm') { next() }
      else { next({ name: 'login'}) }
    }
  })

  return Router;
}
