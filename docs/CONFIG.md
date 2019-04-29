# Configuring Bundlegento

`bundlegento` relies on a configuration file to obtain all the info necessary for bundling your Magento 2 store.

## Creating a Configuration File

A sample configuration file can be generated in your current working directory:

```sh
bundlegento --init
# Configuration file written to /Users/me/mystore/.bundlegentorc
```

## Supported Formats

[`cosmiconfig`](https://github.com/davidtheclark/cosmiconfig) is used to automatically discover, load, and parse your configuration file, which enables support for a wide variety of configuration formats.

The following filenames/formats are recognized:

| Name                      | Format     |
| ------------------------- | ---------- |
| **.bundlegentorc**        | JSON5/YAML |
| **.bundlegentorc.json**   | JSON5      |
| **.bundlegentorc.yaml**   | YAML       |
| **.bundlegentorc.yml**    | YAML       |
| **.bundlegentorc.js**     | JavaScript |
| **bundlegento.config.js** | JavaScript |

If `bundlegento` is not finding your configuration file, you can view the [algorithm](https://github.com/davidtheclark/cosmiconfig) used by `cosmiconfig`.

## Overriding Configuration Search

If you'd prefer to use a different name for your configuration file, or skip searching of the filesystem, you can pass in an absolute path:

```sh
bundlegento --config /Users/me/mystore/mybundlegentoconfig.json
```
