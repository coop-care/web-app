import Vue from 'vue';
import * as Api from "ts-api-client";
import { OmahaQ, getOmaha } from "../helper/model"

const api = new Api.DefaultApi();

Vue.prototype.$api = api;

declare module 'vue/types/vue' {
    // 3. Declare augmentation for Vue
    interface Vue {
      $api: Api.DefaultApi,
      $omaha: OmahaQ,
    }
  }
  
export default async ({ }) => {
  Vue.prototype.$omaha = new OmahaQ(await getOmaha('EN'));
}