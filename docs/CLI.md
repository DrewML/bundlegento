# CLI

The `bundlegento` CLI exposes a convenient way for you to bundle your Magento 2 JavaScript from the command line.

## Installation

```sh
npm i -g bundlegento
# or, if using Yarn
yarn global add bundlegento
```

## Add your Store Configuration

The easiest way to create a config is by having the `bundlegento` CLI automatically generate one for you:

```sh
bundlegento --init
# Configuration file written to /Users/me/mystore/.bundlegentorc
```

See the [config docs](CONFIG.md) for further information.

## Run

Run `bundlegento` from the command line, and make sure the [configuration file is discoverable](CONFIG.md#supported-formats). When bundling is complete, the tool will inform you of the location of your bundles and some additional stats.
