# Caveats

The following caveats exist for the time being:

1. `bundlegento` does _not_ work with usage of the RequireJS "context" feature (for multi-version loading of deps)
2. `bundlegento` does _not_ work with different RequireJS configs for page. Only the config discovered on the first page crawled will be used
3. `bundlegento` does _not_ minify source files outside of the bundle. If you want to minify standalone module files, [`terser`](https://github.com/terser-js/terser) can be used
