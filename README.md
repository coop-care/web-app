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
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md).
