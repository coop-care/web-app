import Terminology from "../helper/terminology";

import enUS from "./en-us";
import terminologyEN from "./en-us/terminology.json";
import glossaryEN from "./en-us/glossary.json";
enUS.terminology = terminologyEN;
enUS.glossary = glossaryEN;

import deDE from "./de-de";
import terminologyDE from "./de-de/terminology.json";
import glossaryDE from "./de-de/glossary.json";
deDE.terminology = terminologyDE;
deDE.glossary = glossaryDE;

import { register } from "timeago.js";
import { de as timeago_de } from "timeago.js/lib/lang";

register("de-de", timeago_de);

export default {
  "en-us": enUS,
  "de-de": deDE
};
