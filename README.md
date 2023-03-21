# CoopCare

We relieve nurses in documentation and planning by using the Omaha System and support care teams in cooperation and in strengthening their clients.

## Developing and building 

### Install the dependencies
```bash
npm install
```

Generate all required icons and splash screens:

```bash
npm run icons
```

### Start the app in development mode

Including hot-code reloading, error reporting, etc.

Starting the app in development mode requires valid https certificates for localhost. This is necessary as some Web APIs are only available in secure contexts and the development environment should be as close as possible to the production app. To achieve this, you need to [install mkcert first](https://github.com/FiloSottile/mkcert#installation). [mkcert](https://github.com/FiloSottile/mkcert) is a simple tool for making locally-trusted development certificates. After the installation follow these steps:

0. Run `mkcert -install` to setup a local root CA on your development machine once
0. In this project's root directory, run `mkcert -cert-file localhost.pem -key-file localhost-key.pem localhost 127.0.0.1 ::1` to create the certificate and key. We strongly recommend that you add your development machines IP addresses to that list after *::1* before running the command. The IP addresses will be used by Cordova to access the app in development mode from external test devices, simulators and emulators. You can add further domain names as well in case you need them. Two files will be created in the project directory named *localhost-key.pem* and *localhost.pem*. In case your IP address changes, you need to recreate certificate and key, otherwise your Cordova app will freeze on launch.
0. You will need to [install and trust your local rootCA.pem file on every external test device](https://github.com/FiloSottile/mkcert#mobile-devices). You find that file in the folder printed by running `mkcert -CAROOT`. To install your rootCA.pem file in the simulator drag & drop the rootCA.pem file onto the running simulator. Check in Settings App under "General > About > Certificate Trust Settings" if it is trusted.

For further guidance on mkcert we recommend reading [these](https://words.filippo.io/mkcert-valid-https-certificates-for-localhost/) [articles](https://auth0.com/blog/using-https-in-your-development-environment/) or it's [GitHub Readme](https://github.com/FiloSottile/mkcert).

Finally we are ready to run the app in development mode!

Developing and testing in a browser:

```bash
npm run dev:web
```
Developing and testing the demo version in a browser:

```bash
npm run dev:demo
```
Developing and testing the app installed on a device or simulator, depending on the desired platform:

```bash
npm run dev:ios

npm run dev:android

npm run dev:electron
```

### Build the app for production

Build the browser-based demo version:

```bash
npm run build:demo
```

Build the app for a specific platform:

```bash
npm run build:ios

npm run build:android

npm run build:electron
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js).

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md).
