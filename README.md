# CoopCare

We relieve nurses in documentation and planning by using the Omaha System and support care teams in cooperation and in strengthening their clients.

## Install the dependencies
```bash
npm install
```

### Start the app in development mode

Including hot-code reloading, error reporting, etc.

```bash
quasar dev
```

Note: the app can currently only be launched as demo version, because we are undergoing a major rebuild of CoopCare's foundation to provide offline capability and end-to-end encryption in data synchronization.

When building the app, type errors might occur stating "Subsequent property declarations must have the same type" (TS2717) that can be safely ignored as the build of the app will succeed anyway.

### Lint the files
```bash
npm run lint
```

### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).

## Contribute

Please read our [Contributing Guide](CONTRIBUTING.md).
