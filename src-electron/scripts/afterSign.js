/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */

// require('dotenv').config();
const { notarize } = require("@electron/notarize");

exports.default = async function afterSign(context) {
    await notarizing(context);
}

// source: https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/
async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    
    if (electronPlatformName !== "darwin") {
        return;
    }

    const appName = context.packager.appInfo.productFilename;

    return await notarize({
        tool: "notarytool",
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLEID,
        appleIdPassword: process.env.APPLEIDPASS,
        teamId: process.env.APPLE_TEAMID
    });
};