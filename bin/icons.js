#!/usr/bin/env node

const { readEnv, generateIcons, exitOnError } = require("./utils/utils");

exitOnError(() => {
  const env = readEnv();
  generateIcons(env.QENV);
});
