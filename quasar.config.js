/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js


/* eslint-disable @typescript-eslint/no-var-requires */


const { configure } = require("quasar/wrappers");
const { readFileSync } = require("fs");
const path = require("path");
const { LicenseWebpackPlugin } = require("license-webpack-plugin");

const env = require("dotenv").config({
    path: require("path").resolve(
      process.cwd(),
      (process.env.QENV?.replace(/^production$/, "") || "") + ".env"
    )
  }).parsed || {};
env.QENV = process.env.QENV;

module.exports = configure(function (ctx) {
  return {
    // https://v2.quasar.dev/quasar-cli-webpack/supporting-ts
    supportTS: {
      tsCheckerConfig: {
        eslint: {
          enabled: true,
          files: "./src/**/*.{ts,tsx,js,jsx,vue}",
          /* Fixing the heap allocation problem while type checking with ForkTsCheckerWebpackPlugin and Webpack 4 by doubling the memory limit.
          The files in src-cordova are causing the increase in memory usage and type checking duration (twice as long).
          Alternatively, they could be excluded by including only src directories except src-cordova in tsconfig.json ("include": ["src", "src-electron"]) */
          memoryLimit: 4096,
        },
      }
    },

    // https://v2.quasar.dev/quasar-cli-webpack/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-webpack/boot-files
    boot: [
      "eventBus",
      // "fetch",
      // "database",
      "i18n",
      "api",
      "quasar-lang-pack",
      "fetchData",
      // "openURL",
      // "router",
      // "updater",
    ],

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-css
    css: [
      "app.sass",
      "print.sass"
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v5',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      "roboto-font", // optional, you are not bound to it
      "material-icons", // optional, you are not bound to it
      "fontawesome-v6",
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-build
    build: {
      vueRouterMode: "hash", // available values: 'hash', 'history'
      devtool: "source-map", // builds slowest, but most accurate, which is good for debugging, see https://webpack.js.org/configuration/devtool/

      // transpile: false,
      // publicPath: '/',

      // Add dependencies for transpiling with Babel (Array of string/regex)
      // (from node_modules, which are by default not transpiled).
      // Applies only if "transpile" is set to true.
      // transpileDependencies: [],

      // rtl: true, // https://quasar.dev/options/rtl-support
      // preloadChunks: true,
      // showProgress: false,
      // gzip: true,
      // analyze: true,

      // Options below are automatically set depending on the env, set them if you want to override
      // extractCSS: false,

      // https://v2.quasar.dev/quasar-cli-webpack/handling-webpack
      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      // chainWebpack (/* chain */) {}

      env: {
        ...env,        
        APP_VERSION: JSON.parse(readFileSync("./package.json")).version || 0,
        APP_BUILD: (new Date()).toISOString().replace(/\D/g, ""),
      },

      extendWebpack(config) {
        config.resolve.alias = {
          ...config.resolve.alias,
          "vue-facing-decorator": "vue-facing-decorator/dist/index-return-cons"
        };

        /* pre-compiles all locale messages to enable the runtime-only version,
        otherwise the CSP header needs to allow unsafe-eval for script which should be avoided for security reasons */
        // config.module.rules.push({
        //   test: /index\.(json5?|ya?ml)$/, // target json, json5, yaml and yml files, but not files named terminology or other
        //   type: "javascript/auto",
        //   loader: "@intlify/vue-i18n-loader",
        //   include: [ // Use `Rule.include` to specify the files of locale messages to be pre-compiled
        //     path.resolve(__dirname, "src/i18n")
        //   ]
        // });

        // enable loading web assembly
        config.module.rules.push({
          test: /argon2\.wasm$/,
          loader: "base64-loader",
          type: "javascript/auto",
        });
        config.module.noParse = /argon2\.wasm$/;
        config.resolve.fallback = {
          ...config.resolve.fallback,
          path: false,
          fs: false,
          Buffer: false,
          process: false,
        };
        config.experiments = {
          ...config.experiments,
          asyncWebAssembly: true,
        };
        config.performance = {
          ...config.performance,
          hints: false,
          maxEntrypointSize: 512000,
          maxAssetSize: 512000,
        };


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
          "xml-escape": "MIT",
          "rechoir": "MIT"
        }

        config.plugins = (config.plugins || []).concat([
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
                licenseText: readFileSync("node_modules/@quasar/extras/fontawesome-v6/LICENSE.txt", {encoding: "utf-8"}),
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
        ]);
      },

    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-devServer
    devServer: {
      server: {
        type: "http"
        // type: "https",
        // options: {
        //   key: path.join(__dirname, "localhost-key.pem"),
        //   cert: path.join(__dirname, "localhost.pem"),
        // },
      },
      port: 8080,
      open: false // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-framework
    framework: {
      config: {
        notify: {
          position: "top",
          timeout: 3000
        }
      },

      iconSet: "material-icons", // Quasar icon set
      lang: "en-US", // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: [
        "Notify", 
        "Meta", 
        "Dialog"
      ]
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: ["fadeInDown", "fadeOutUp", "slideInRight", "slideOutRight", "slideInLeft", "slideOutLeft"],

    // https://v2.quasar.dev/quasar-cli-webpack/developing-ssr/configuring-ssr
    ssr: {
      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
                      // (gets superseded if process.env.PORT is specified at runtime)

      maxAge: 1000 * 60 * 60 * 24 * 30,
        // Tell browser when a file from the server should expire from cache (in ms)

      // chainWebpackWebserver (/* chain */) {},

      middlewares: [
        ctx.prod ? "compression" : "",
        "render" // keep this as last one
      ]
    },

    // https://v2.quasar.dev/quasar-cli-webpack/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: "GenerateSW", // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {}, // only for GenerateSW

      // for the custom service worker ONLY (/src-pwa/custom-service-worker.[js|ts])
      // if using workbox in InjectManifest mode
      // chainWebpackCustomSW (/* chain */) {},

      manifest: {
        name: "CoopCare",
        short_name: "CoopCare",
        description: "We relieve nurses in documentation and planning by using the Omaha System and support care teams in cooperation and in strengthening their clients.",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#960372",
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

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-cordova-apps/configuring-cordova
    cordova: {
      // add the dynamic top padding on iOS mobile devices
      iosStatusBarPadding: true,

      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-electron-apps/configuring-electron
    electron: {
      supportTS: true,
      bundler: "builder", // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: "de.coopcare.app",
        productName: "CoopCare",
        copyright: "Copyright © Michael Kamphausen",
        mac: {
          target: [{
            target: "zip",
            arch: ["arm64", "x64", "universal"]
          }],
          category: "public.app-category.medical",
          icon: "src-electron/icons/icon.icns",
          hardenedRuntime: true,
          entitlements: "src-electron/build/entitlements.mac.plist",
          entitlementsInherit: "src-electron/build/entitlements.mac.plist",
          asarUnpack: [ // fixes error related to signing that appeared when launching the production app
            "node_modules/keytar"
          ],
        },
        win: {
          target: [{
            target: "nsis",
            arch: ["x64", "ia32"]
          }],
          icon: "src-electron/icons/icon.ico",
        },
        linux: {
          target: [],
          category: "MedicalSoftware",
        },
        snap: {
          publish: {
            provider: "generic",
            url: env.UPDATE_URL
          }
        },
        afterSign: "src-electron/scripts/afterSign.js",
        publish: [{
        //   provider: "github"
        // },{
          provider: "generic",
          url: env.UPDATE_URL
        }],
        electronUpdaterCompatibility: ">= 2.16"
      },

      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      chainWebpackMain (/* chain */) {
        // do something with the Electron main process Webpack cfg
        // extendWebpackMain also available besides this chainWebpackMain
      },

      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      chainWebpackPreload (/* chain */) {
        // do something with the Electron main process Webpack cfg
        // extendWebpackPreload also available besides this chainWebpackPreload
      }
    }
  }
});
