import Vue from "vue";
import VueI18n from "vue-i18n";
import messages from "src/i18n";
import Quasar from "quasar";

Vue.use(VueI18n);

const i18n = new VueI18n({
  // @ts-ignore
  locale: Quasar.lang.getLocale(),
  fallbackLocale: "en-us",
  messages
});

// @ts-ignore
export default ({ app }) => {
  // Set i18n instance on app
  app.i18n = i18n;
};

export { i18n };
