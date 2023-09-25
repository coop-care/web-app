
/**
 * Changes the contents of a file based on a regular expression
 * @param {string} path path of the file with the contents to be changed
 * @param {RegExp} pattern the regular expression should consist of three capture groups:
 * the first one contains the characters needed to identify the begin of the section to be replaced, 
 * the second one contains the characters of the section to be replaced or simply put: the old value,
 * the third one contains the characters that mark the end of the section to be replaced.
 * Example: `/(<widget .*id=\")([A-Za-z.]*)(\")/`
 * @param {string} replaceValue the new value that is inserted at the location of the old value.
 * There is no need to reference capture groups here.
 * @returns the old value
 */
function replaceFileContent(path, pattern, replaceValue) {
  const { readFileSync, writeFileSync } = require("fs");
  const originalContent = readFileSync(path, "utf8");
  const originalValue = originalContent.match(pattern)?.[2];
  const changedContent = originalContent.replace(pattern, `$1${replaceValue}$3`);

  writeFileSync(path, changedContent);

  return originalValue;
}

/**
 * Changes the attribute `id` of the `widget` root element in `src-cordova/config.xml`.
 * Throws error if parameter appId is empty or undefined.
 * @param {string} appId the new app id
 * @returns the previous app id value
 */
function changeCordovaAppId(appId) {
  if (!appId) {
    throw new Error("missing app id");
  }

  const previousId = replaceFileContent("src-cordova/config.xml", /(<widget .*id=\")([A-Za-z.]*)(\")/, appId);

  if (appId != previousId) {
    const sourceDir = "src-cordova/platforms/android/app/src/main/java/" + previousId.replace(/\./g, "/");
    const targetDir = "src-cordova/platforms/android/app/src/main/java/" + appId.replace(/\./g, "/");
    const previousIdRegExp = previousId.replace(/\./g, "\\\.");
    runCommand(`mkdir -p ${targetDir}; mv ${sourceDir}/MainActivity.java ${targetDir}/MainActivity.java`);
    replaceFileContent(targetDir + "/MainActivity.java", new RegExp("( )(" + previousIdRegExp + ")(;)", "g"), appId);
    replaceFileContent("src-cordova/platforms/android/android.json", new RegExp("(\")(" + previousIdRegExp + ")(\")", "g"), appId);
  }

  return previousId;
}

/**
 * Changes the attribute `version` of the `widget` root element in `src-cordova/config.xml`.
 * Throws error if parameter version is empty or undefined.
 * @param {string} version the new version string
 * @returns the previous version string
 */
function changeCordovaVersion(version) {
  if (!version) {
    throw new Error("missing app version string");
  }

  return replaceFileContent("src-cordova/config.xml", /(<widget .*version=\")([0-9,.]*)(\")/, version);
}

/**
 * Changes the property `productName` in `package.json`. 
 * Electron uses this property as path component for the app data directory.
 * As we want to use seperate app data folders for different type of electron builds,
 * it is necessary to change the productName property for different types of app builds.
 * Throws error if parameter productName is empty or undefined.
 * @param {string} productName the new product name
 * @returns the previous productName
 */
function changeProductName(productName) {
  if (!productName) {
    throw new Error("missing product name");
  }

  return replaceFileContent("package.json", /(\"productName\": \")(.*)(\")/, productName);
}

/**
 * Reads the property `productName` from `package.json`.
 * @returns the productName
 */
function getProductName() {
  const { readFileSync } = require("fs");
  const packageJSON = readFileSync("package.json", "utf8");
  return /(\"productName\": \")(.*)(\")/.exec(packageJSON)[2];
}

/**
 * Read the env variables from the .env file matching the environment name defined by env variable QENV, 
 * e.g. `QENV=development` matches development.env. `QENV=production` or when QENV variable is not set,
 * the variables from .env file are loaded.
 * Throws error when no matching .env file was found.
 * @param {string} defaultEnvironment fallback to this default envronment name when QENV is not specified.
 * @returns dictionary with env variables
 */
function readEnv(defaultEnvironment = "production") {
  const environment = process.env.QENV || defaultEnvironment;
  const env = require("dotenv").config({
      path: require("path").resolve(
          process.cwd(),
          (environment?.replace(/^production$/, "") || "") + ".env"
      )
  }).parsed;

  if (!env) {
    throw new Error(`No .env file found for environment "${environment}"`);
  }

  env.QENV = environment;

  return env;
}

/**
 * Run command in a child process shell.
 * If this function is called in a context where an eviornment variable `DRYRUN=true` is set,
 * it will log the command instead of executing it.
 * @param {string} command The command to run.
 * @returns The stdout from the command.
 */
function runCommand(command) {
  if (!command) {
    throw new Error("command is not defined");
  }

  if (process.env.DRYRUN == "true") {
    return console.log(command);
  } else {
    return require("child_process").execSync(command, { stdio: "inherit" });
  }
}

/**
 * If an exception is thrown from the prvided method, the error is written to stdout
 * and the process exits with exit code 1
 * @param {() => void} method any code to be executed that can potentially throw exceptions
 * @param {() => void} onError optional method to be executed when an exception was thrown
 */
function exitOnError(method, onError) {
  try {
    method();
  } catch (error) {
    onError?.();
    console.error(error);
    process.exit(1);
  }
}

/**
 * Generates different app icons depending on environment argument
 * @param {string} environment value is either "development" or "production"
 */
function generateIcons(environment) {
  runCommand(`icongenie generate -p icongenie/${environment}`);
}

/**
 * Constructs a list of quasar CLI commands needed to build the requested product
 * using the current mode and environment.
 * @param {string} mode 
 * @param {string} product 
 * @param {string} environment 
 * @param {Record<string, string>} extraVariables a map with optional keys "ios", "android" or "electron"
 *  and additional environment variables as values that are set for the command. Useful for
 *  overriding or adding a variable under specific circumstances.
 * @returns {string[]} list of quasar CLI commands
 */
function quasarCommands(mode, product, environment, extraVariables) {
  const cmd = mode == "device" ? "build" : mode;
  let command = `QENV=${environment} quasar ${cmd}`;

  if (["ios", "android"].includes(product)) {
    command = `${extraVariables[product] ?? ""} ${command} -m ${product}`;

    if (mode == "dev") {
      command = "USE_HTTP=true " + command;
    }

    if (mode == "device") {
      if (product == "ios") {
        command += " --debug --skip-pkg";
      } else if (product == "android") {
        command += " --debug";
      }
    }

    command += " -- --buildConfig=build.json";

    if (mode == "build") {
      command += " --device --release"
    }

    if (product == "ios") {
      // For an unknown reason exit code is 1 even after a succesful build which results in an exception.
      // On the other hand, this script's execution will continue even when a real error occured.
      command += " || true"; 
    }
  } else if (["mac", "win", "linux", "electron"].includes(product)) {
    command = `${extraVariables[product] ?? ""} ${command} -m electron`;

    if (mode == "build") {
      if (product == "electron") {
        command += " -T all";
      } else if (product == "mac") {
        command += " -T mac";
      } else if (product == "win") {
        command += " -T win";
      } else if (product == "linux") {
        command += " -T linux";
      }
      
      command += " --publish";
    }
  } else if (product == "cordova") {
    return ["ios", "android"].flatMap(product => quasarCommands(mode, product, environment, extraVariables));
  } else if (product == "app") {
    return ["ios", "android", "electron"].flatMap(product => quasarCommands(mode, product, environment, extraVariables));
  }

  return [command];
}

/**
 * Writes testflight update infos to file dist/testflight/testflight.json,
 * so the app client can determine if a newer testflight update is available for installation
 * @param {string} testflightUrl deep link into testflight app, e.g. https://beta.itunes.apple.com/v1/app/<APP_ID>
 * @param {string} invitationUrl invitation url to join the testflight programm for this app, e.g. https://testflight.apple.com/join/<TOKEN>
 */
function writeTestflightUpdateInfoFile(testflightUrl, invitationUrl) {
  const { readFileSync, writeFileSync, mkdirSync } = require("fs");
  const directory = require("path").join(process.cwd(), "dist/testflight/");
  const version = JSON.parse(readFileSync("./package.json")).version || 0;
  const releaseDate = (new Date()).toISOString();
  const json = {
      version,
      testflightUrl,
      invitationUrl,
      releaseDate,
  }

  mkdirSync(directory, { recursive: true });
  writeFileSync(directory + "testflight.json", JSON.stringify(json));
}

/**
 * Reverting an action when the main operation has finished or aborted by an exception
 * by adding it's reverse action `action` including `description` to a `revertActionList`
 * in order to run all these reverse actions by calling `revertFinally` function when
 * the main operation finished or was aborted.
 * @param {string} description describing the reverse action
 * @param {() => void} action reverse action
 * @param {{description: string; action: () => void}[]} revertActionList mutable list of reverse actions
 */
function revertLater(description, action, revertActionList) {
  revertActionList.push({description, action});
}

/**
 * Run all reverse actions added to `revertActionList` by `revertLater` function.
 * Should be called when the main operation finished or was aborted.
 * @param {{description: string; action: () => void}[]} revertActionList mutable list of reverse actions
 */
function revertFinally(revertActionList) {
    revertActionList.forEach(({action, description}) => {
      action();
      console.log("Reverted:", description);
    });
}

module.exports = {
  replaceFileContent, 
  changeCordovaAppId, 
  changeCordovaVersion, 
  changeProductName,
  getProductName,
  readEnv,
  runCommand,
  exitOnError,
  generateIcons,
  quasarCommands,
  writeTestflightUpdateInfoFile,
  revertLater,
  revertFinally
};
