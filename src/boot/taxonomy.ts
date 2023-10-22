import { boot } from "quasar/wrappers";
import { bus } from "./eventBus";
import { Guideline } from "src/models/guideline";
import { TaxonomyDatabase } from "src/database/TaxonomyDatabase";
import { locale } from "./i18n";
import { jsonDateReviver } from "src/helper/utils";

export default boot(async ({ store }) => {
    const database = new TaxonomyDatabase();

    // load and store data
    const downloadPromises = [
        "covid19_EN.json", 
        "covid19_DE.json",
        ...(process.env.DEV 
            ? [
                "usersguide_EN.jsonc",
                "usersguide_DE.jsonc",
            ]
            : []
        ),
    ].map(async filename => {
        const response = await fetch(filename)

        if (!response.ok) {
            throw new Error("no data");
        }

        let text = await response.text();
        text = text.replace(/\/\*[\s\S]*?\*\//, ""); // strip leading comment
        const guideline = JSON.parse(text, jsonDateReviver) as Guideline;
        await database.guidelines.put(guideline);
    });
    await Promise.all(downloadPromises);

    // retrieve data for current locale
    const updateLocale = async (locale: string) => {
        const [languageCode] = locale.split("-");
        const guidelineList = await database.guidelines
            .where("locale").equals(languageCode)
            .toArray()
        const guidelinesById = guidelineList.reduce((result, current) => {
            result[current.id] = current;
            return result;
        }, {} as Record<string, Guideline>);
        store.direct.commit.setGuidelines(guidelinesById);
    };

    bus.on("did-change-locale", updateLocale);
    updateLocale(locale.value);
});
