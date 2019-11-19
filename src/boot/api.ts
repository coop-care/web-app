import Vue from 'vue';
import * as Api from "ts-api-client";

const api = new Api.DefaultApi();

// api.appGetOmahaProblemDomains({})
//   .then((r) => {
//     Vue.prototype.
//   })

Vue.prototype.$api = api;



declare module 'vue/types/vue' {
    // 3. Declare augmentation for Vue
    interface Vue {
      $api: Api.DefaultApi,
      // $omahaDomains: Api.OmahaProblemDomain
    }
  }
  
// export default ({ app, Vue }) => {
//     // app.api = new Api.DefaultApi();
//     Vue.prototype.$api = new Api.DefaultApi();
// }