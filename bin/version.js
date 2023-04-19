#!/usr/bin/env node

const { exitOnError, changeCordovaVersion } = require("./utils/utils");

exitOnError(() => {
  changeCordovaVersion(process.env.npm_package_version);
});
