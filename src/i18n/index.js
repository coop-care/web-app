import enUS from "./en-us";
import terminologyEN from "./en-us/terminology.json";
enUS.terminology = terminologyEN;

import deDE from "./de-de";
import terminologyDE from "./de-de/terminology.json";
deDE.terminology = terminologyDE;

import { register } from "timeago.js";
import { de as timeagoDE } from "timeago.js/lib/lang";

register("de-de", timeagoDE);

export default {
  "en-us": enUS,
  "de-de": deDE
};
