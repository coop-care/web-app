import { makeTerminologyWithMaps } from "../helper/terminology";
import { register } from "timeago.js";
import { de as timeagoDE } from "timeago.js/lib/lang";
import store from "../store";

import enUS from "./en-us/index.json";
import terminologyEN from "./en-us/terminology.json";
(enUS as Record<string, any>).terminology = makeTerminologyWithMaps(
    terminologyEN
);
import countriesEN_US from "localized-countries/data/en_US.json";
(enUS as Record<string, any>).countries = countriesEN_US;

import deDE from "./de-de/index.json";
import terminologyDE from "./de-de/terminology.json";
(deDE as Record<string, any>).terminology = makeTerminologyWithMaps(
    terminologyDE
);
import countriesDE_DE from "localized-countries/data/de_DE.json";
(deDE as Record<string, any>).countries = countriesDE_DE;

if (!store.direct.getters.isDemo) {
    const responseHandler = (response: Response) => {
        if (response.ok) {
            return response
                .text()
                .then(text => JSON.parse(text.replace(/\/\*[\s\S]*?\*\//, ""))); // strip leading comment
        } else {
            throw new Error("no data");
        }
    };
    void fetch("diagnoses.sln")
        .then(responseHandler)
        .then(data => {
            enUS.diagnosisNames = data.diagnoses["en-us"];
            enUS.problemCodesByDiagnosis = data.problemCodesByDiagnosis;
            deDE.diagnosisNames = data.diagnoses["de-de"];
            deDE.problemCodesByDiagnosis = data.problemCodesByDiagnosis;
        });
    void fetch("usersguide_EN.sln")
        .then(responseHandler)
        .then(data => {
            enUS.usersGuide = data;
        });
    void fetch("usersguide_DE.sln")
        .then(responseHandler)
        .then(data => {
            deDE.usersGuide = data;
        });
} else {
    const responseHandler = (response: Response) => {
        if (response.ok) {
            return response
                .text()
                .then(text => JSON.parse(text.replace(/\/\*[\s\S]*?\*\//, ""))); // strip leading comment
        } else {
            throw new Error("no data");
        }
    };
    void fetch("covid19_EN.json")
        .then(responseHandler)
        .then(data => {
            enUS.usersGuide = data;
        });
    void fetch("covid19_DE.json")
        .then(responseHandler)
        .then(data => {
            deDE.usersGuide = data;
        });
}

register("de-de", timeagoDE);

export default {
    "en-us": enUS,
    "de-de": deDE
};
