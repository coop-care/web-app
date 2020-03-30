import { makeTerminologyWithMaps } from "../helper/terminology";
import { register } from "timeago.js";
import { de as timeagoDE } from "timeago.js/lib/lang";

import enUS from "./en-us";
import terminologyEN from "./en-us/terminology.json";
enUS.terminology = makeTerminologyWithMaps(terminologyEN);

import deDE from "./de-de";
import terminologyDE from "./de-de/terminology.json";
deDE.terminology = makeTerminologyWithMaps(terminologyDE);

const responseHandler = response => {
  if (response.ok) {
    return response.json();
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
  .catch(() => 0);
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
