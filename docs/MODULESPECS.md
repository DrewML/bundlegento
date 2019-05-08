# Module Specification

The only responsibility of `bundlegento` is to generate optimized JavaScript bundles. Once these have been generated, it is the responsiblity of a Magento module to load and serve these optimized assets at runtime.

This module does not exist yet. If you're reading this document, though, you can probably build it :).

## Requirements

1. The module should be called `Bundlegento` with `Magento` as the vendor
1. Module must follow all Magento coding standards
1. Module must be installable as a composer package
1. Module must live in a separate repo from the `bundlegento` tool
1. Must support Magento version 2.1.4 and up _minimum__

## Implementation Details

 When `Magento_Bundlegento` is installed, its job is to determine which script tags (if any) should be injected into the `head` of the document during rendering.

 A store that has used `bundlegento` to generate optimized JavaScript will have a new `bundlegento` directory within each _bundled_ locale. As an example, if Luma was bundled within a default installation of Magento using only the `en_US` locale, all bundle data would be located in `pub/static/frontend/Magento/luma/en_US/bundlegento`.

 The `bundlegento` directory within a locale includes 2 different types of files:

- Bundled JavaScript files
- Bundlegento Manifest

The _manifest_ is what should be used by `Magento_Bundlegento` to determine what (if any) bundle files to include. Below is an example of the structure and contents of a manifest:

```json
{
    "rules": {
        "cms": {
            "includeForLayoutHandles": ["cms_index_index"],
            "excludeForLayoutHandles": []
        },
        "product": {
            "includeForLayoutHandles": ["catalog_product_view"],
            "excludeForLayoutHandles": []
        },
        "category_special": {
            "includeForLayoutHandles": ["catalog_category_view", "catalog_shoes"],
            "excludeForLayoutHandles": []
        },
        "category": {
            "includeForLayoutHandles": ["catalog_category_view"],
            "excludeForLayoutHandles": ["catalog_shoes"]
        }
    },
    "groups": {
        "cms": ["all.js"],
        "product": ["all.js", "product.js", "product-category-shared.js"],
        "category_special": ["all.js", "category-special.js"],
        "category": ["all.js", "category.js", "product-category-shared.js"]
    }
}
```

The `rules` are used to determine what group's JS files should be included. The following table illustrates how these rules work:

| Handles On Page                      | Included JS                                     | 
|--------------------------------------|-------------------------------------------------|  
| cms_index_index                      | all.js                                          | 
| catalog_product_view                 | all.js, category.js, product-category-shared.js | 
| catalog_category_view, catalog_shoes | all.js, category-special.js                     | 
| catalog_category_view                | all.js, category.js, product-category-shared.js | 

## Pseudo Code

The following pseudo code illustrates roughly how you can determine what JS bundles to load, using a list of handles for the current route + a bundlegento manifest.

```js
const manifest = readFile('bundlegento-manifest.json');
const loadedHandles = magento.handlesForCurrentRoute(); // ['catalog_category_view', 'catalog_shoes']
const jsFiles = [];

for (const [groupName, rules] of manifest.rules) {
    // Important Note: _Every_ value in `includeForLayoutHandles` MUST
    // be present. If 10 handles are in includes, all 10 need to be on 
    // a page to make a match
    const allIncludesMatch = rules.includeForLayoutHandles.every(handle => {
        return loadedHandles.includes(handle);
    });
    const oneExcludeMatches = rules.excludeForLayoutHandles.some(handle => {
        return loadedHandles.includes(handle);
    });

    if (allIncludesMatch && !oneExcludeMatches) {
        jsfiles.concat(manifest[groupName]);
    }
}

return jsFiles;
```

## Moving of files in head

With this module enabled, some files we already include in the `<head>` of a store should be moved around a bit.

In an unbundled store, script tags get added to the head in this order:

1. require.js
1. mixins.js
1. requirejs-config.js

When enabled, this module should:

- Concatenate together `require.js` and `mixins.js`, serving them as a single file
- Inject all JS bundles necessary for the page (as specified by manifest) directly _after_ the concatenated `requirejs+mixins.js`, but before `requirejs-config.js`