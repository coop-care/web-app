import Terminology from "../helper/terminology";
import enUS from "./en-us";
import deDE from "./de-de";

import terminologyEN from "./en-us/terminology.json";
enUS.terminology = Terminology.makeIds(terminologyEN);
import terminologyDE from "./de-de/terminology.json";
deDE.terminology = Terminology.makeIds(terminologyDE);

export default {
  "en-us": enUS,
  "de-de": deDE
};
