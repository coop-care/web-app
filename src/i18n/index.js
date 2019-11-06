import Terminology from "../helper/terminology";

import enUS from "./en-us";
import terminologyEN from "./en-us/terminology.json";
import glossaryEN from "./en-us/glossary.json";
enUS.terminology = Terminology.makeIds(terminologyEN);
enUS.glossary = glossaryEN;

import deDE from "./de-de";
import terminologyDE from "./de-de/terminology.json";
import glossaryDE from "./de-de/glossary.json";
deDE.terminology = Terminology.makeIds(terminologyDE);
deDE.glossary = glossaryDE;

export default {
  "en-us": enUS,
  "de-de": deDE
};
