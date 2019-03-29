# API

The `bundlegento` API is the same interface consumed by the the [CLI](CLI.md), but can be used to integrate `bundlegento` functionality more deeply into other tools or workflows.

## Installation

```sh
npm i -D bundlegento
# or, if using Yarn
yarn add -D bundlegento
```

## Add your Store Configuration

The easiest way to create a config is by having the `bundlegento` CLI automatically generate one for you:

```sh
bundlegento --init
# Configuration file written to /Users/me/mystore/.bundlegentorc
```

See the [config docs](CONFIG.md) for further information.

## Example Usage

```js
const { runForProject } = require('bundlegento');
const configPath = '/Users/me/mystore/bundle-conf.json';

runForProject(configPath).then(results => {
    const { groups, sharedGroups } = results;
    // Do anything with bundling results here
});
```
