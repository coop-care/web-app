import { Quasar } from "quasar";
import { boot } from "quasar/wrappers";
import { locale } from "src/boot/i18n";

declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $loadLangPack: (locale: string) => void;
    }
}

export async function loadLangPack(locale: string) {
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

export default boot(async ({ app }) => {
    // for Options API
    app.config.globalProperties.$loadLangPack = loadLangPack;
    // for Composition API
    app.provide("loadLangPack", loadLangPack);

    await loadLangPack(locale.value);
});
