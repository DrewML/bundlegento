# Caveats

The following caveats exist for the time being:

1. Does _not_ work with usage of the RequireJS "context" feature (for multi-version loading of deps)
1. Does _not_ work with different RequireJS configs for page. Only the config discovered on the first page crawled will be used
1. Does _not_ minify source files outside of the bundle. If you want to minify standalone module files, [`terser`](https://github.com/terser-js/terser) can be used
1. Only works on CMS/Product/Catalog pages. It does not work for the admin, shopping cart, checking, customer account page, etc.
1. Does _not_ work with the `compact` deployment strategy in Magento 2
