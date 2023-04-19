# CoopCare

We relieve nurses in documentation and planning by using the Omaha System and support care teams in cooperation and in strengthening their clients.

## Prerequisites for developing and building

You might need to install some CLI tools first:

* [Node >= 16.x and NPM](https://nodejs.org)
* [Quasar CLI](https://quasar.dev/start/quasar-cli)
* [Icon Genie CLI](https://quasar.dev/icongenie/installation)
* [Cordova CLI](https://quasar.dev/quasar-cli-webpack/developing-cordova-apps/preparation)

### Install the dependencies
```bash
npm install
```

### Environment variables

To run the app, you need to create .env files in the project root directory. You can create and name them according to your needs. However, there are some .env files required for the most common purposes:

* `.env` for production builds (default)
* `development.env` for development builds
* `demo.env` for demo web app

Some environment variables provide specific or sensitive information that are used at runtime, others are used at build time for building, signing, notarizing or uploading the app. Here is a list of commonly used [environment variables in this project](docs/environment.md).

### https certificate for localhost

Starting the app in development mode requires valid https certificates for localhost. This is necessary as some Web APIs are only available in secure contexts and the development environment should be as close as possible to the production app. To achieve this, you need to [install mkcert first](https://github.com/FiloSottile/mkcert#installation). [mkcert](https://github.com/FiloSottile/mkcert) is a simple tool for making locally-trusted development certificates. After the installation follow these steps:

0. Run `mkcert -install` to setup a local root CA on your development machine once
0. In this project's root directory, run `mkcert -cert-file localhost.pem -key-file localhost-key.pem localhost 127.0.0.1 ::1` to create the certificate and key. We strongly recommend that you add your development machines IP addresses to that list after *::1* before running the command. The IP addresses will be used by Cordova to access the app in development mode from external test devices, simulators and emulators. You can add further domain names as well in case you need them. Two files will be created in the project directory named *localhost-key.pem* and *localhost.pem*. In case your IP address changes, you need to recreate certificate and key, otherwise your Cordova app will freeze on launch.
0. You will need to [install and trust your local rootCA.pem file on every external test device](https://github.com/FiloSottile/mkcert#mobile-devices). You find that file in the folder printed by running `mkcert -CAROOT`. To install your rootCA.pem file in the simulator drag & drop the rootCA.pem file onto the running simulator. Check in Settings App under "General > About > Certificate Trust Settings" if it is trusted.

For further guidance on mkcert we recommend reading [these](https://words.filippo.io/mkcert-valid-https-certificates-for-localhost/) [articles](https://auth0.com/blog/using-https-in-your-development-environment/) or it's [GitHub Readme](https://github.com/FiloSottile/mkcert).

Finally we are ready to run the app in development mode!

### Preparations for iOS and Android development

Developing for iOS and Android requires some initial installation and configuration on your development system, so before you start you want to follow this guide to [setup Cordova](https://quasar.dev/quasar-cli-webpack/developing-cordova-apps/preparation). After that check our own [notes for Cordova configuration](docs/cordova.md) which includes our learnings about building on the latest versions of macOS.

You will also need to create the file `src-cordova/build.json` which includes required configuration to build the app for [iOS](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html#using-buildjson) and [Android](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#using-buildjson).

## Run the app in development mode

For debugging including hot-code reloading, error reporting, etc. 

#### Developing and testing in a browser

```bash
npm run dev web
```

#### Developing the demo version in a browser

```bash
npm run dev demo
```

#### Developing the mobile app on a device or simulator

The following commands will launch CoopCare in development mode for debugging on a locally connected device or if none is connected on installed simulators or emulators:

```bash
npm run dev ios
```

```bash
npm run dev android
```

You can connect the Safari or Chrome developer tools on your computer to your device, simulator or emulator for debugging.

#### Developing the desktop app on your local system

```bash
npm run dev electron
```

## Install on a connected mobile device

The installed build behaves closer to a production build, but is still debuggable.

```bash
npm run device ios
```

```bash
npm run device android
```

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md).

## Customizing the app

To learn more about changing the app configuration and user interface, see the [Quasar documentation](https://quasar.dev/docs/). You might also want to familiarize with the app's architecture using [Vue.js](https://vuejs.org/guide/introduction.html).

## Build for testing and production

To build CoopCare for testing and production use, see our [guide on how to build and publish the app](docs/build.md).
