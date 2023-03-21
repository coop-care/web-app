#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const { readFileSync, writeFileSync, mkdirSync } = require("fs");

const env = require("dotenv").config({
    path: require("path").resolve(
        process.cwd(),
        (process.env.QENV?.replace(/^production$/, "") || "") + ".env"
    )
}).parsed;

const directory = path.join(__dirname, "../dist/testflight/");

const json = {
    version: JSON.parse(readFileSync("./package.json")).version || 0,
    testflightUrl: env.TESTFLIGHT_URL,
    invitationUrl: env.TESTFLIGHT_INVITATION,
    releaseDate: (new Date()).toISOString(),
}

mkdirSync(directory, { recursive: true });
writeFileSync(directory + "testflight.json", JSON.stringify(json));
