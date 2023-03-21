#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const { readFileSync, writeFileSync } = require("fs");
const { execSync } = require("child_process")

const originalConfig = readFileSync("quasar.config.js", "utf8");
const modifiedConfig = originalConfig.replace(/(arch: \["arm64", "x64", "universal"\])/, "//$1");

writeFileSync("quasar.config.js", modifiedConfig);

let env = "";

if (process.env.QENV) {
    env = "QENV=" + process.env.QENV + " ";
}

try {
    execSync(env + "quasar build -m electron -T mac --publish", { stdio: "inherit" });
} catch (error) {
    console.error(error);
}

writeFileSync("quasar.config.js", originalConfig);
