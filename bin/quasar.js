#!/usr/bin/env node

const { parseArgs } = require("util");
const { readFileSync, writeFileSync } = require("fs");
const { 
  exitOnError, 
  runCommand, 
  readEnv, 
  generateIcons, 
  changeCordovaAppId, 
  writeTestflightUpdateInfoFile, 
  revertLater, 
  revertFinally,
  quasarCommands,
  changeProductName,
  getProductName
} = require("./utils/utils");

const revertActionList = [];

const ModeValues = ["dev", "device", "build"];
const ProductValues = {
  "dev": ["web", "demo", "ios", "android", "electron"],
  "device": ["ios", "android"],
  "build": ["web", "demo", "ios", "android", "cordova", "mac", "win", "linux", "electron", "system", "app"]
};

exitOnError(() => {

  // == parse arguments ==

  const args = process.argv.slice(2);
  const mode = process.env.npm_lifecycle_event;
  let product = args.shift();
  const { publish, version } = parseArgs({
    args: args.map(arg => "--" + arg),
    options: {
      publish: { type: "string" },
      version: { type: "string" },
    }
  }).values;

  const isWeb = ["web", "demo"].includes(product);
  const isApp = !isWeb;
  const isTestFlight = !!publish && publish != "release" && ["ios", "cordova", "app"].includes(product);

  // == use environment variables ==

  const defaultEnvironment = product == "demo"
    ? "demo"
    : mode == "dev" || mode == "device" || publish == "dev"
      ? "development"
      : undefined;

  const env = readEnv(defaultEnvironment);
  const productionAppId = readEnv().APP_ID;
  const additionalVariables = {};

  if (isTestFlight) {
    if (env.QENV == "development") {
      env.QENV = "production";
      env.APP_ID = productionAppId;
      additionalVariables["ios"] = `IS_TESTFLIGHT=true UPDATE_URL=${env.UPDATE_URL}`;
    } else {
      additionalVariables["ios"] = "IS_TESTFLIGHT=true";
    }
  }

  if (product == "android" && (mode == "device" || mode == "dev")) {
    env.APP_ID = env.APP_ID.replace(/\.dev$/, ".debug");
    additionalVariables["android"] = `APP_ID=${env.APP_ID}`;
  }

  console.log(`Using environment "${env.QENV}" and app id "${env.APP_ID}"\n`);

  // == validate arguments ==

  if (!ModeValues.includes(mode)) {
    throw new Error(`Unknown argument "${mode}" for mode. Valid values are: ${ModeValues.join(", ")}`)
  }

  if (!product) {
    throw new Error(`Missing argument product. Valid values for mode "${mode}" are: ${ProductValues[mode].join(", ")}`)
  }

  if (!ProductValues[mode].includes(product)) {
    throw new Error(`Unknown argument "${product}" for product. Valid values for mode "${mode}" are: ${ProductValues[mode].join(", ")}`)
  }

  if (!!publish && mode != "build") {
    throw new Error("Argument \"publish\" is only available for mode \"build\".")
  }

  if (!!publish && !env.UPLOAD_FILES && product != "ios") {
    throw new Error(`Missing required env variable UPLOAD_FILES for publishing product "${product}".`);
  }

  if (!!publish && !env.DOWNLOAD_DIRECTORY && isApp) {
    throw new Error(`Missing required env variable DOWNLOAD_DIRECTORY for publishing product "${product}".`);
  }

  if (!!publish && !env.CLEAR_DOWNLOAD_DIRECTORY && product == "app") {
      throw new Error(`Missing required env variable CLEAR_DOWNLOAD_DIRECTORY for publishing product "${product}".`);
  }

  if (!!publish && !env.APPLEID && ["ios", "cordova", "app"].includes(product)) {
      throw new Error(`Missing required env variable APPLEID for publishing product "${product}".`);
  }

  if (!!publish && !env.APPLEIDPASS && ["ios", "cordova", "app"].includes(product)) {
      throw new Error(`Missing required env variable APPLEIDPASS for publishing product "${product}".`);
  }

  if (publish == "dev" && ["cordova", "app"].includes(product)) {
      throw new Error(`Product "${product}" is not available for "publish=dev".`);
  }

  if (!!version && mode != "build") {
    throw new Error("Argument \"version\" is only available for mode \"build\".")
  }

  if (!version && ["beta", "release"].includes(publish)) {
    throw new Error(`Argument "version" is required when publishing for channel "${publish}". Recommended value is version=patch.`)
  }

  // == generate icons ==
  
  if (isWeb) {
    generateIcons("production");
  } else if (mode == "build") {
    generateIcons(env.QENV);
  } else {
    generateIcons("development");
  }

  // == cordova only: adjust app id if needed ==

  if (["ios", "android", "cordova", "app"].includes(product)) {
    console.log(`Using app id ${env.APP_ID} for cordova`);
    changeCordovaAppId(env.APP_ID);

    if (!!productionAppId) {
      revertLater(
        "cordova app id in src-cordova/config.xml", 
        () => changeCordovaAppId(productionAppId), 
        revertActionList
      );
    }
  }

  // == electron and development.env only: adjust product name to ==

  if (env.QENV == "development" && ["mac", "windows", "linux", "system", "electron", "app"].includes(product)) {
    const productName = getProductName() + " (Dev)";
    console.log(`Using product name "${productName}" for electron`);
    const previousProductName = changeProductName(productName);

    if (!!previousProductName) {
      revertLater(
        "productName in package.json", 
        () => changeProductName(previousProductName), 
        revertActionList
      );
    }
  }

  // == electron only: build for the develeopment machine's system architecture only ==

  if (product == "system") {
    const quasarConfigPath = "quasar.config.js";
    const originalQuasarConfig = readFileSync(quasarConfigPath, "utf8");
    // comment lines with architectures out in builder configuration, 
    // causing only the current development machine's system architecture
    // to be built as default fallback and revert it later
    const quasarConfig = originalQuasarConfig.replace(/(arch: \[)/g, "// $1");
    writeFileSync(quasarConfigPath, quasarConfig);

    revertLater(
      quasarConfigPath, 
      () => writeFileSync(quasarConfigPath, originalQuasarConfig), 
      revertActionList
    );

    if (process.platform == "darwin") {
      product = "mac";
    } else if (process.platform == "win32") {
      product = "win";
    } else if (process.platform == "linux") {
      product = "linux";
    } else {
      throw new Error(`Your operating system "${process.platform}" is not supported.`)
    }
  }

  // == set version and run build commands before finally reverting temporary changes ==

  if (version) {
    runCommand(`VERSION=${version} npm run set:version`);
  }

  quasarCommands(mode, product, env.QENV, additionalVariables).forEach(runCommand);

  // == device mode only: transmit build to connected device ==

  if (mode == "device") {
    if (product == "ios") {
      runCommand("pushd src-cordova; cordova run ios --debug --device --buildConfig=build.json; popd");
    } else if (product == "android") {
      runCommand("adb install dist/cordova/android/apk/debug/app-debug.apk");
    }
  }

  // == upload build results ==

  if (publish) {
    const filesToUpload = [];

    if (isWeb) {
      filesToUpload.push("dist/spa/*");
    }
    if (isTestFlight) {
      writeTestflightUpdateInfoFile(env.TESTFLIGHT_URL, env.TESTFLIGHT_INVITATION);
      filesToUpload.push("dist/testflight/testflight.json");
    }
    if (["android", "cordova", "app"].includes(product)) {
      filesToUpload.push("dist/cordova/android/apk/release/app-release.{json,apk,zip}");
    }
    if (["mac", "electron", "app"].includes(product)) {
      filesToUpload.push("dist/electron/Packaged/{latest-mac.yml,*mac.zip,*mac.zip.blockmap}");
    }
    if (["win", "electron", "app"].includes(product)) {
      filesToUpload.push("dist/electron/Packaged/{latest.yml,*.exe,*.exe.blockmap}");
    }
    if (["linux", "electron", "app"].includes(product)) {
      // not supported yet
      // filesToUpload.push("dist/electron/Packaged/{latest-linux.yml,*.AppImage,*.snap}");
    }

    if (isWeb) {
      runCommand("rm dist/spa/*.jsonc");
    }

    if (product == "app" && !!env.CLEAR_DOWNLOAD_DIRECTORY) {
      runCommand(env.CLEAR_DOWNLOAD_DIRECTORY);
    }

    if (filesToUpload.length > 0 && !!env.UPLOAD_FILES) {
      const remoteDirectory = isApp 
        ? env.DOWNLOAD_DIRECTORY 
        : product == "demo"
          ? "demo"
          : publish;
      console.log(`Uploading to remote directory "${remoteDirectory}"`);
      const uploadCommand = env.UPLOAD_FILES.replace(/<SOURCE>/, filesToUpload.join(" ")) + remoteDirectory + "/";
      runCommand(uploadCommand);
    }

    if (["ios", "cordova", "app"].includes(product) && !!env.APPLEID && !!env.APPLEIDPASS) {
      const buildDirectory = "src-cordova/platforms/ios/build/Release-iphoneos";
      runCommand(`xcrun altool --upload-app -f ${buildDirectory}/*.ipa -t ios -u ${env.APPLEID} -p ${env.APPLEIDPASS}`);
    }
  }

  revertFinally(revertActionList);
},
() => {
  revertFinally(revertActionList);
});
