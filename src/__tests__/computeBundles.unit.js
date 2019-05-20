/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

const { computeBundles } = require('../computeBundles');

test('Generates bundles matching diagram in docs directory', () => {
    const entriesByGroup = new Map(
        Object.entries({
            cms: ['jquery', 'tooltip', 'colorpicker', 'carousel', 'calendar'],
            product: [
                'jquery',
                'swatches',
                'colorpicker',
                'magnifier',
                'addtocart',
            ],
            category: ['jquery', 'tooltip', 'options', 'magnifier', 'grid'],
            cart: [
                'jquery',
                'cart-api',
                'colorpicker',
                'shipping',
                'fancyselect',
            ],
        }),
    );
    const bundleSpec = computeBundles(entriesByGroup, {});
    expect(bundleSpec).toMatchInlineSnapshot(`
Map {
  "cms" => Object {
    "dependsOnGroups": Set {
      "all",
      "cms-category-shared",
    },
    "modules": Set {
      "carousel",
      "calendar",
    },
    "name": "cms",
  },
  "product" => Object {
    "dependsOnGroups": Set {
      "all",
      "product-category-shared",
    },
    "modules": Set {
      "swatches",
      "addtocart",
    },
    "name": "product",
  },
  "category" => Object {
    "dependsOnGroups": Set {
      "all",
      "cms-category-shared",
      "product-category-shared",
    },
    "modules": Set {
      "options",
      "grid",
    },
    "name": "category",
  },
  "cart" => Object {
    "dependsOnGroups": Set {
      "all",
    },
    "modules": Set {
      "cart-api",
      "shipping",
      "fancyselect",
    },
    "name": "cart",
  },
  "all" => Object {
    "dependsOnGroups": Set {
      "all",
    },
    "modules": Set {
      "jquery",
      "colorpicker",
    },
    "name": "all",
  },
  "cms-category-shared" => Object {
    "dependsOnGroups": Set {
      "all",
    },
    "modules": Set {
      "tooltip",
    },
    "name": "cms-category-shared",
  },
  "product-category-shared" => Object {
    "dependsOnGroups": Set {
      "all",
    },
    "modules": Set {
      "magnifier",
    },
    "name": "product-category-shared",
  },
}
`);
});
