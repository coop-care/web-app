#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const { writeFileSync } = require("fs");
const { exitOnError, runCommand } = require("./utils/utils");

if (process.env.npm_lifecycle_event == "device") {
    return;
}

exitOnError(() => {
    const directory = path.join(__dirname, "../src-cordova/platforms/android/app/build/outputs/apk/release/")
    
    runCommand(`../node_modules/apk-update/apk-update.js ${directory}app-release.apk ${directory}`);

    const json = require(directory + "app-release.json");
    json.releaseDate = (new Date()).toISOString();

    writeFileSync(directory + "app-release.json", JSON.stringify(json));
})

