import { boot } from "quasar/wrappers";
import { downloadJSON } from "../helper/download";
import { setColorSet, defaultColors } from "../helper/color";
import { ccApi } from "../api/apiProvider";
import { Team } from "../models";
import { ObjectId } from "bson";
import { locale } from "src/boot/i18n";

export default boot(({ store }) => {
    void store.direct.dispatch.fetchEssentialDataFromDB({ locale: locale.value }).catch(() => 0);

    let lastFetch = 0;
    window.addEventListener("visibilitychange", () => {
        if ((document.visibilityState == "visible") && (Date.now() > lastFetch + 120 * 1000)) {
            void store.direct.dispatch.fetchEssentialDataFromDB({ locale: locale.value }).catch(() => 0);
            lastFetch = Date.now();
        }
    });
    window.addEventListener("online", () => {
        void store.direct.dispatch.fetchEssentialDataFromDB({ locale: locale.value }).catch(() => 0);
        lastFetch = Date.now();
    });

    if ((process.env.DEV as unknown) === true || process.env.DEV === "true") {
        const global = window as any;
        global.download = () => downloadJSON(store.direct.state.clients.map(client => client.toJSON()), "sample1.json", true);
        global.$ccApi = ccApi
        global.$store = store;
        global.ObjectId = ObjectId;
        global.Team = Team;
    }

    setColorSet(store?.state.currentUser?.colorScheme || defaultColors);
})
