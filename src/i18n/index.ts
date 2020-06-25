import { makeTerminologyWithMaps } from "../helper/terminology";
import { register } from "timeago.js";
import { de as timeagoDE } from "timeago.js/lib/lang";

import enUS from "./en-us/index.json";
import terminologyEN from "./en-us/terminology.json";
(enUS as Record<string, any>).terminology = makeTerminologyWithMaps(
    terminologyEN
);

import deDE from "./de-de/index.json";
import terminologyDE from "./de-de/terminology.json";
(deDE as Record<string, any>).terminology = makeTerminologyWithMaps(
    terminologyDE
);

const responseHandler = (response: Response) => {
    if (response.ok) {
        return response
            .text()
            .then(text => JSON.parse(text.replace(/\/\*[\s\S]*?\*\//, ""))); // strip leading comment
    } else {
        throw new Error("no data");
    }
};
fetch("statics/diagnoses.sln")
    .then(responseHandler)
    .then(data => {
        enUS.diagnosisNames = data.diagnoses["en-us"];
        enUS.problemCodesByDiagnosis = data.problemCodesByDiagnosis;
        deDE.diagnosisNames = data.diagnoses["de-de"];
        deDE.problemCodesByDiagnosis = data.problemCodesByDiagnosis;
    })
    .catch(error => console.log(5, error));
fetch("statics/usersguide_EN.sln")
    .then(responseHandler)
    .then(data => {
        enUS.usersGuide = data;
    })
    .catch(() => 0);
fetch("statics/usersguide_DE.sln")
    .then(responseHandler)
    .then(data => {
        deDE.usersGuide = data;
    })
    .catch(() => 0);

register("de-de", timeagoDE);

export default {
    "en-us": enUS,
    "de-de": deDE
};
