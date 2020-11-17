import { boot } from "quasar/wrappers"
import messages from "src/i18n"
import Vue from "vue"
import VueI18n from "vue-i18n"
import { Quasar } from "quasar"
import { StateInterface } from "src/store"

declare module "vue/types/vue" {
  interface Vue {
    i18n: VueI18n;
  }
}

Vue.use(VueI18n)

function matchLocale(
  locale: string,
  availableLocales: string[],
  fallbackLocale: string
) {
  let resultingLocale = locale

  if (!availableLocales.includes(resultingLocale)) {
    const shortLocale = locale.split("-")[0]
    resultingLocale = shortLocale

    if (!availableLocales.includes(resultingLocale)) {
      resultingLocale =
        availableLocales.find(locale => {
          return shortLocale === locale.split("-")[0]
        }) || fallbackLocale
    }
  }

  return resultingLocale
}

const defaultLocale = Quasar.lang.isoName;
const availableLocales = Object.keys(messages);

const i18n = new VueI18n({
  locale: matchLocale(
    Quasar.lang.getLocale(),
    availableLocales,
    defaultLocale
  ),
  fallbackLocale: defaultLocale,
  messages
})

export default boot(({ app, Vue }) => {
  // Set i18n instance on app
  app.i18n = i18n;

  app.store?.subscribe((mutation, state: StateInterface) => {
    if (mutation.type == "setCurrentUser" || mutation.type == "updateCurrentUser") {
      const newLocale = state.currentUser?.locale ||
        matchLocale(Quasar.lang.getLocale(), availableLocales, defaultLocale);

      if (newLocale != i18n.locale) {
        i18n.locale = newLocale;
        Vue.prototype.$loadLangPack(newLocale);
      }
    }
  })
})
