import { makeTerminologyWithMaps } from "../helper/terminology";
import { register } from "timeago.js";
import { de as timeagoDE } from "timeago.js/lib/lang";

import enUS from "./en-us";
import terminologyEN from "./en-us/terminology.json";
enUS.terminology = makeTerminologyWithMaps(terminologyEN);

import deDE from "./de-de";
import terminologyDE from "./de-de/terminology.json";
deDE.terminology = makeTerminologyWithMaps(terminologyDE);

register("de-de", timeagoDE);

export default {
  "en-us": enUS,
  "de-de": deDE
};
