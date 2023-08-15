import { makeTerminologyWithMaps } from "../helper/terminology";

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

if (false && process.env.DEV) {
    const responseHandler = (response: Response) => {
        if (response.ok) {
            return response
                .text()
                .then(text => JSON.parse(text.replace(/\/\*[\s\S]*?\*\//, ""))); // strip leading comment
        } else {
            throw new Error("no data");
        }
    };
    void fetch("diagnoses.jsonc")
        .then(responseHandler)
        .then(data => {
            enUS.diagnosisNames = data.diagnoses["en-us"];
            enUS.problemCodesByDiagnosis = data.problemCodesByDiagnosis;
            deDE.diagnosisNames = data.diagnoses["de-de"];
            deDE.problemCodesByDiagnosis = data.problemCodesByDiagnosis;
        });
}

export default {
  "en-US": enUS,
  "de-DE": deDE,
};
