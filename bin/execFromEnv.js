#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const { execSync } = require("child_process");

const key = process.argv[2];

const env = require("dotenv").config({
    path: require("path").resolve(
        process.cwd(),
        (process.env.QENV?.replace(/^production$/, "") || "") + ".env"
    )
}).parsed;

const command = env[key];

if (!command) {
    console.error(`command ${key} is not defined`);
    process.exit(1);
}

try {
    execSync(command, { stdio: "inherit" });
} catch (error) {
    console.error(error);
}
