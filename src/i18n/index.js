import enUS from "./en-us";
import deDE from "./de-de";

import terminologyEN from "./en-us/terminology.json";
enUS.terminology = terminologyEN;
import terminologyDE from "./de-de/terminology.json";
deDE.terminology = terminologyDE;

export default {
  "en-us": enUS,
  "de-de": deDE
};
