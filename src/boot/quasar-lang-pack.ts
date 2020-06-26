import Quasar from "quasar";

declare module "vue/types/vue" {
    interface Vue {
        $loadLangPack: (locale: string) => void;
    }
}

// @ts-ignore
export default async ({ app, Vue }) => {
    Vue.prototype.$loadLangPack = async (locale: string) => {
        let lang = app.i18n.fallbackLocale;

        if (
            [
                "en-us",
                "en-gb",
                "fa-ir",
                "ko-kr",
                "nb-no",
                "pt-br",
                "zh-hans",
                "zh-hant"
            ].includes(locale)
        ) {
            lang = locale;
        } else {
            lang = locale.split("-")[0];
        }

        try {
            await import(
                /* webpackInclude: /(de|en-us)\.js$/ */
                "quasar/lang/" + lang
            ).then(langPack => {
                // @ts-ignore
                Quasar.lang.set(langPack.default);
            });
        } catch (err) {
            // Requested Quasar Language Pack does not exist,
            // let's not break the app, so catching error
        }
    };

    await Vue.prototype.$loadLangPack(app.i18n.locale);
};
