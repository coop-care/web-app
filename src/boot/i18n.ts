import { boot } from "quasar/wrappers"
import messages from "src/i18n"
import Vue from "vue"
import VueI18n from "vue-i18n"
import { Quasar } from "quasar"
import { StateInterface } from "src/store"
import { DateTime } from "luxon"

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

const defaultDateTimeFormats: Record<string, Intl.DateTimeFormatOptions> = {
  "DateShort": DateTime.DATE_SHORT, // 11.4.2012
  "DateMed": DateTime.DATE_MED, // 11. Apr 2012
  "DateFull": DateTime.DATE_FULL, // 11. April 2012
  "DateHuge": DateTime.DATE_HUGE, // Mittwoch, 11. April 2012
  "DateTimeShort": DateTime.DATETIME_SHORT, // 11.4.2021 21:15
  "DateTimeMed": DateTime.DATETIME_MED, // 11. Apr 2021 21:15
  "WeekdayLong": { // Mittwoch
    weekday: "long"
  },
  "DayMonthShort": { // 11. Apr
    day: "numeric",
    month: "short",
  },
  "TimeSimple": DateTime.TIME_SIMPLE, // 21:15 (or 09:15 PM)
};

const defaultLocale = Quasar.lang.isoName;
const availableLocales = Object.keys(messages);
const dateTimeFormats = availableLocales.reduce((result, locale) => {
  result[locale] = defaultDateTimeFormats;
  return result;
}, {} as VueI18n.DateTimeFormats);

const i18n = new VueI18n({
  locale: matchLocale(
    Quasar.lang.getLocale() || "",
    availableLocales,
    defaultLocale
  ),
  fallbackLocale: defaultLocale,
  messages,
  dateTimeFormats,
  warnHtmlInMessage: "error"
})

export default boot(({ app, Vue }) => {
  // Set i18n instance on app
  app.i18n = i18n;

  app.store?.subscribe((mutation, state: StateInterface) => {
    if (mutation.type == "setCurrentUser" || mutation.type == "updateCurrentUser") {
      const newLocale = state.currentUser?.locale ||
        matchLocale(Quasar.lang.getLocale() || "", availableLocales, defaultLocale);

      if (newLocale != i18n.locale) {
        i18n.locale = newLocale;
        Vue.prototype.$loadLangPack(newLocale);
      }
    }
  })
})
