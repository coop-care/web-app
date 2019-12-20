import Vue from "vue";
import VueI18n from "vue-i18n";
// @ts-ignore
import messages from "src/i18n";
import Quasar from "quasar";

Vue.use(VueI18n);

function matchLocale(
  locale: string,
  availableLocales: string[],
  fallbackLocale: string
) {
  let resultingLocale = locale;

  if (!availableLocales.includes(resultingLocale)) {
    let shortLocale = locale.split("-")[0];
    resultingLocale = shortLocale;

    if (!availableLocales.includes(resultingLocale)) {
      let shortToCompleteLocaleMap: { [key: string]: string } = {};

      resultingLocale =
        availableLocales.find(locale => {
          return shortLocale == locale.split("-")[0];
        }) || fallbackLocale;
    }
  }

  return resultingLocale;
}

const i18n = new VueI18n({
  // @ts-ignore
  locale: matchLocale(Quasar.lang.getLocale(), Object.keys(messages), "en-us"),
  fallbackLocale: "en-us",
  messages
});

// @ts-ignore
export default ({ app }) => {
  // Set i18n instance on app
  app.i18n = i18n;
};

export { i18n };
