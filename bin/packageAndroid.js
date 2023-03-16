#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const { execSync } = require("child_process");
const { writeFileSync } = require("fs");

const directory = path.join(__dirname, "../src-cordova/platforms/android/app/build/outputs/apk/release/")

try {
    execSync(`apk-update ${directory}app-release.apk ${directory}`, { stdio: "inherit" });
} catch (error) {
    console.error(error);
}

const json = require(directory + "app-release.json");
json.releaseDate = (new Date()).toISOString();

writeFileSync(directory + "app-release.json", JSON.stringify(json));
