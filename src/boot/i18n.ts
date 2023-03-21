import { boot } from "quasar/wrappers";
import { createI18n } from "vue-i18n";
import { Quasar } from "quasar";
import { DateTime } from "luxon";

import messages from "../i18n";
import { StateInterface } from "src/store";
import { WritableComputedRef } from "vue";
import { bus } from "./eventBus";

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = typeof messages["en-US"];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-interface */
declare module "vue-i18n" {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-interface */

async function loadLangPack(locale: string) {
    try {
        await import(
            /* webpackInclude: /(de|en-US)\.js$/ */
            "quasar/lang/" + locale
        ).catch(error => {
            if (locale.includes("-")) {
                return import("quasar/lang/" + locale.split("-")[0])
            } else {
                throw error
            }
        }).then(langPack => {
            Quasar.lang.set(langPack.default);
        });
    } catch (error) {
        // Requested Quasar Language Pack does not exist,
        // let's not break the app, so catching error
        console.error("Quasar Language Pack does not exist", error)
    }
};

export function matchLocale(
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

export function errorToString(error: any) {
  return (error as Error)?.message || `${error}`;
};

export function errorMessage(error: any) {
  const errorMessage = errorToString(error);

  if (i18n.global.te(errorMessage)) {
    return i18n.global.t(errorMessage);
  } else {
    console.error(error);
    return i18n.global.t("GenericError");
  }
};

export function fileSize(value: number) {
  const units = ["Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte", "Petabyte"];
  const magnitude = value == 0
    ? 0
    : Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const unit = units[magnitude];
  value = value / Math.pow(1024, magnitude);
  return i18n.global.n(value, unit);
};

const defaultDateTimeFormats: Record<string, Intl.DateTimeFormatOptions> = {
  "DateShort": DateTime.DATE_SHORT, // 11.4.2012
  "DateMed": DateTime.DATE_MED, // 11. Apr 2012
  "DateFull": DateTime.DATE_FULL, // 11. April 2012
  "DateHuge": DateTime.DATE_HUGE, // Mittwoch, 11. April 2012
  "DateTimeShort": DateTime.DATETIME_SHORT, // 11.4.2021, 21:15
  "DateTimeMed": DateTime.DATETIME_MED, // 11. Apr 2021, 21:15
  "DateTimeShortSeconds": DateTime.DATETIME_SHORT_WITH_SECONDS, // 11.4.2021, 21:15:42
  "WeekdayLong": { // Mittwoch
    weekday: "long"
  },
  "DayMonthShort": { // 11. Apr
    day: "numeric",
    month: "short",
  },
  "DateTimeShortSecondsWeekday": { // Fr 11.04.2021, 21:15:42
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  },
  "TimeSimple": DateTime.TIME_SIMPLE, // 21:15 (or 09:15 PM)
};

const defaultNumberFormats: Record<string, Intl.NumberFormatOptions> = {
  "Percent": {
    style: "percent"
  },
  "Byte": {
    style: "unit",
    unit: "byte",
    maximumFractionDigits: 1,
  },
  "Kilobyte": {
    style: "unit",
    unit: "kilobyte",
    maximumFractionDigits: 1,
  },
  "Megabyte": {
    style: "unit",
    unit: "megabyte",
    maximumFractionDigits: 1,
  },
  "Gigabyte": {
    style: "unit",
    unit: "gigabyte",
    maximumFractionDigits: 1,
  },
  "Terabyte": {
    style: "unit",
    unit: "terabyte",
    maximumFractionDigits: 1,
  },
  "Petabyte": {
    style: "unit",
    unit: "petabyte",
    maximumFractionDigits: 1,
  }
}

const fallbackLocale = Quasar.lang.isoName;
const availableLocales = Object.keys(messages);
const datetimeFormats = availableLocales.reduce((result, locale) => {
  result[locale] = defaultDateTimeFormats;
  return result;
}, {} as any);
const numberFormats = availableLocales.reduce((result, locale) => {
  result[locale] = defaultNumberFormats;
  return result;
}, {} as any);

const i18n = createI18n<{ message: MessageSchema }, MessageLanguages>({
  legacy: false,
  globalInjection: true,
  allowComposition: true,
  warnHtmlInMessage: "error",
  locale: matchLocale(
    Quasar.lang.getLocale() || "",
    availableLocales,
    fallbackLocale
  ),
  fallbackLocale,
  messages,
  datetimeFormats,
  numberFormats
});

// Workaround: messages has a key "rrule" which should be of type Record<string, string>, 
// but is of type Record<string, (string[]) => string> because of vue-i18n-loader behaviour.
// Only needed if @intlify/vue-i18n-loader is in use.
// Object.values(messages)
//   .forEach(messages =>
//     messages.rrule = Object.entries(messages.rrule)
//         .reduce((result, [key, value]: [string, any]) => {
//             result[key] = value({ normalize: (item: string[]) => item.join()});
//             return result
//         }, {} as Record<string, string>) as typeof messages.rrule
//   )

const locale = i18n.global.locale as unknown as WritableComputedRef<string>;

export default boot(({ app, store }) => {
  // Set i18n instance on app
  app.use(i18n);

  // propagate locale changes
  bus.on("did-change-locale", (value: string) => {
    locale.value = value;
    loadLangPack(value);
    window.electronAPI?.didChangeLocale(value);

    if (store.direct.state.currentUser && store.direct.state.currentUser.locale != value) {
      void store.direct.dispatch.saveCurrentUser((user) => {
        user.locale = value;
      });
    }
  })

  // receive locale change from electron menu
  window.electronAPI?.addListener("did-change-locale", (value: string) => {
    if (locale.value != value) {
      bus.emit("did-change-locale", value)
    }
  })

  // get locale from current user's settings
  store.subscribe((mutation, state: StateInterface) => {
    if (mutation.type == "setCurrentUser" || mutation.type == "updateCurrentUser") {
      const userLocaleOrBrowserDefault = state.currentUser?.locale ||
        matchLocale(Quasar.lang.getLocale() || "", availableLocales, fallbackLocale);

      if (userLocaleOrBrowserDefault != locale.value) {
        bus.emit("did-change-locale", userLocaleOrBrowserDefault);
      }
    }
  })
});


const i18nGlobal = i18n.global;
export { locale, i18nGlobal as i18n };
