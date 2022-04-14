/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const { configure } = require("quasar/wrappers")
const { readFileSync } = require("fs")
const path = require("path")
const { LicenseWebpackPlugin } = require("license-webpack-plugin")

module.exports = configure(function (ctx) {
  return {
    // https://quasar.dev/quasar-cli/supporting-ts
    supportTS: {
      tsCheckerConfig: {
        eslint: true,
        /* Fixing the heap allocation problem while type checking with ForkTsCheckerWebpackPlugin and Webpack 4 by doubling the memory limit.
        The files in src-cordova are causing the increase in memory usage and type checking duration (twice as long).
        Alternatively, they could be excluded by including only src directories except src-cordova in tsconfig.json ("include": ["src", "src-electron"]) */
        memoryLimit: 8192
      }
    },

    sourceFiles: {
      router: "src/router/index.ts",
      store: "src/store/index.ts"
    },

    // https://quasar.dev/quasar-cli/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://quasar.dev/quasar-cli/boot-files
    boot: [
      "i18n",
      "quasar-lang-pack",
      "fetchData"
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
    css: [
      "app.sass",
      "print.sass"
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v5',
      // 'fontawesome-v5',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      "roboto-font", // optional, you are not bound to it
      "material-icons", // optional, you are not bound to it
      "fontawesome-v5",
    ],

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      vueRouterMode: "hash", // available values: 'hash', 'history'
      devtool: "source-map",

      // transpile: false,

      // Add dependencies for transpiling with Babel (Array of string/regex)
      // (from node_modules, which are by default not transpiled).
      // Applies only if "transpile" is set to true.
      // transpileDependencies: [],

      // rtl: false, // https://quasar.dev/options/rtl-support
      // preloadChunks: true,
      // showProgress: false,
      // gzip: true,
      // analyze: true,

      // Options below are automatically set depending on the env, set them if you want to override
      // extractCSS: false,

      env: {
        APP_VERSION: JSON.parse(readFileSync("./package.json")).version || 0,
        APP_BUILD: (new Date()).toISOString().replace(/\D/g, ""),
      },

      // https://quasar.dev/quasar-cli/handling-webpack
      extendWebpack(cfg) {
        // linting is slow in TS projects, we execute it only for production builds
        if (ctx.prod) {
          cfg.module.rules.push({
            enforce: "pre",
            test: /\.(js|vue)$/,
            loader: "eslint-loader",
            exclude: /node_modules/
          })
        }

        const findDependencies = (names) => {
          const results = [...new Set(names.flatMap(name => [name, ...Object.keys(JSON.parse(readFileSync(`src-cordova/node_modules/${name}/package.json`)).dependencies || {})]))];

          if (results.length > names.length) {
            return findDependencies(results);
          } else {
            return results;
          }
        }

        /* An unexaustive list of licenses that are compatible with AGPL-3.0 license.
           Licenses that are incompatible with AGPL-3.0 are unacceptable and may not be combined with the source code of this app.
           For a complete list, see https://www.gnu.org/licenses/license-list.html.
           For a compatibility overview, see https://web.archive.org/web/20210101030518/https://dwheeler.com/essays/floss-license-slide.html.
        */
        const unacceptableLicenseTest = (license) => ![
          "MIT",
          "Apache-2.0",
          "ISC",
          "LGPL",
          "Unlicense",
          "CC0-1.0",
          "BSD-3-Clause",
          "BSD-2-Clause",
          "0BSD",
          "(MIT AND BSD-3-Clause)",
          "MIT or GPL-2.0",
        ].includes(license);
        const licenseTypeOverrides = {
          "realm-web": "Apache-2.0",
          "cordova-plugin-keyboard": "Apache-2.0",
          "cordova-plugin-printer": "Apache-2.0",
          "shelljs": "BSD-3-Clause",
          "tail": "MIT",
          "xml-escape": "MIT"
        }

        cfg.plugins = (cfg.plugins || []).concat([
          new LicenseWebpackPlugin({
            outputFilename: "oss-licenses.json",
            perChunkOutput: false,
            unacceptableLicenseTest,
            renderLicenses: modules => JSON.stringify(
              modules.map(module => ({
                name: module.name,
                author: (author => {
                  const authorName = author.name || author;
                  const name = authorName.replace(/( <.+@.+>)/, "").replace(/( \(http.+\))/, "");
                  const email = author.email || authorName.match(/^.* <(.+@.+)>.*$/)?.[1];
                  const url = (author.url || authorName.match(/^.* \((http.+)\).*$/)?.[1])//?.replace(/^(?!http)/, "http://");
                  return {name: name + (email ? ` <${email}>` : "") + (url ? ` (${url})`: "")};
                })(module.packageJson?.author || ""),
                license: module.licenseId,
                licenseText: module.licenseText,
                repository: (module.packageJson?.repository?.url || module.packageJson?.repository)
                  ?.replace(/^(git\+https|git|git\+ssh):/, "https:").replace(/^git@github.com:/, "https://github.com/").replace(/^(?!https:)/, "https://github.com/"),
                // source: `https://registry.npmjs.org/${module.name}/-/${module.name.split("/").pop()}-${module.packageJson?.version}.tgz`,
                homepage: module.packageJson?.homepage,
                // version: module.packageJson?.version
              })).concat([{
                name: "@fortawesome/fontawesome-free",
                author: {
                  name: "The Font Awesome Team (https://github.com/orgs/FortAwesome/people)",
                },
                license: "(CC-BY-4.0 AND OFL-1.1 AND MIT)", // the OFL-1.1 part applies to this project and should be compatible, see explanation at https://www.gnu.org/licenses/license-list.html#SILOFL
                licenseText: readFileSync("node_modules/@quasar/extras/fontawesome-v5/LICENSE.txt", {encoding: "utf-8"}),
                repository: "https://github.com/FortAwesome/Font-Awesome",
                homepage: "https://fontawesome.com"
              }, {
                name: "@mdi/font",
                author: {
                  name: "Austin Andrews (http://twitter.com/templarian)",
                },
                license: "Apache-2.0",
                licenseText: readFileSync("node_modules/@quasar/extras/material-icons/LICENSE", { encoding: "utf-8" }),
                repository: "https://github.com/Templarian/MaterialDesign-Webfont.git",
                homepage: "https://materialdesignicons.com"
              }, {
                name: "roboto-font",
                author: {
                  name: "Christian Robertson"
                },
                license: "Apache-2.0",
                licenseText: readFileSync("node_modules/@quasar/extras/material-icons/LICENSE", { encoding: "utf-8" }),
              }]),
            null, 2),
            licenseTypeOverrides,
            licenseTemplateDir: path.resolve(__dirname, "license-templates"),
            additionalModules: ctx.mode.cordova
              ? findDependencies(Object.keys(JSON.parse(readFileSync("src-cordova/package.json")).devDependencies))
                .map(name => {
                  const license = licenseTypeOverrides[name]
                    || JSON.parse(readFileSync(`src-cordova/node_modules/${name}/package.json`)).license;

                  if (unacceptableLicenseTest(license)) {
                    throw new Error(`Unacceptable License for "${name}": ${license}`);
                  }

                  return {
                    name,
                    directory: path.join(__dirname, "src-cordova", "node_modules", name)
                  }
                })
              : []
          })
        ])
      }
    },

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
      https: false,
      port: 8080,
      open: false // opens browser window automatically
    },

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
    framework: {
      iconSet: "material-icons", // Quasar icon set
      lang: "en-us", // Quasar language pack
      config: {},

      // Possible values for "importStrategy":
      // * 'auto' - (DEFAULT) Auto-import needed Quasar components & directives
      // * 'all'  - Manually specify what to import
      importStrategy: "auto",

      // For special cases outside of where "auto" importStrategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: ["Meta", "Dialog"]
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: ["fadeInDown", "fadeOutUp", "slideInRight", "slideOutRight", "slideInLeft", "slideOutLeft"],

    // https://quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      pwa: false
    },

    // https://quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: "GenerateSW", // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {
        include: [/.*/],
        navigateFallback: "index.html"
      }, // only for GenerateSW
      metaVariables: {
        appleMobileWebAppStatusBarStyle: "black" // 'black-translucent'
      },
      manifest: {
        name: "CoopCare",
        short_name: "CoopCare",
        description: "We relieve nurses in documentation and planning by using the Omaha System and support care teams in cooperation and in strengthening their clients.",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#960372",
        start_url: "/",
        icons: [
          {
            src: "icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png"
          },
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icons/icon-256x256.png",
            sizes: "256x256",
            type: "image/png"
          },
          {
            src: "icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png"
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // add the dynamic top padding on iOS mobile devices
      iosStatusBarPadding: true,

      // Quasar handles app exit on mobile phone back button.
      // Requires Quasar v1.9.3+ for true/false, v1.12.6+ for '*' wildcard and array values
      // backButtonExit: true / false / '*' / ['/login', '/home', '/my-page'],

      // On the other hand, the following completely
      // disables Quasar's back button management.
      // Requires Quasar v1.14.1+
      // backButton: true / false

      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      bundler: "packager", // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // https://electron.github.io/electron-packager/master/interfaces/electronpackager.options.html

        // all: true,
        platform: ["darwin", "win32"],
        arch: ["x64"],

        junk: true,

        // OS X / Mac App Store
        appBundleId: "de.coopcare.app",
        appCategoryType: "public.app-category.medical",
        // osxSign: '',
        protocol: "coopcare://",

        // Windows only
        win32metadata: {
          CompanyName: "CoopCare"
        }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: "coopcare"
      },

      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: false,

      extendWebpack(/* cfg */) {
        // do something with Electron main process Webpack cfg
        // chainWebpack also available besides this extendWebpack
      }
    }
  }
})
