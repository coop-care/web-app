import { boot } from "quasar/wrappers"
import { classToPlain } from "class-transformer";
import { downloadJSON } from "../helper/download";
import { setColorSet, defaultColors } from "../helper/color";
import { ccApi } from "../api/apiProvider";
import { Team } from "../models";
import { ObjectID } from "bson";
import VueI18n from "vue-i18n"

export default boot(({ app }) => {
  const store = app.store?.direct;
  const i18n = app.i18n as VueI18n;

  if (store && i18n && i18n.locale) {
    void store.dispatch.fetchEssentialDataFromDB({ locale: i18n.locale }).catch(() => 0);

    let lastFetch = 0;
    window.addEventListener("visibilitychange", () => {
      if ((document.visibilityState == "visible") && (Date.now() > lastFetch + 3600 * 1000)) {
        void store.dispatch.fetchEssentialDataFromDB({ locale: i18n.locale }).catch(() => 0);
        lastFetch = Date.now();
      }
    });
    window.addEventListener("online", () => {
      void store.dispatch.fetchEssentialDataFromDB({ locale: i18n.locale }).catch(() => 0);
      lastFetch = Date.now();
    });
  }

  if ((process.env.DEV as unknown) === true || process.env.DEV === "true") {
    // @ts-ignore
    window.download = () => downloadJSON(classToPlain(store.state.clients) || [], "sample1.json");
    // @ts-ignore
    window.api = ccApi
    // @ts-ignore
    window.store = store
    // @ts-ignore
    window.ObjectID = ObjectID
    // @ts-ignore
    window.Team = Team
  }

  setColorSet(store?.state.currentUser?.colorScheme || defaultColors);

})