/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

const { createSplits } = require('../bundleSplitter');

test('Generates bundles matching diagram in docs directory', () => {
    const entriesByGroup = {
        cms: ['jquery', 'tooltip', 'colorpicker', 'carousel', 'calendar'],
        product: [
            'jquery',
            'swatches',
            'colorpicker',
            'magnifier',
            'addtocart',
        ],
        category: ['jquery', 'tooltip', 'options', 'magnifier', 'grid'],
        cart: ['jquery', 'cart-api', 'colorpicker', 'shipping', 'fancyselect'],
    };
    const results = createSplits(entriesByGroup, {});
    expect(results).toMatchInlineSnapshot(`
Object {
  "groups": Object {
    "cart": Object {
      "modules": Set {
        "cart-api",
        "shipping",
        "fancyselect",
      },
      "name": "cart",
      "sharedSplitNames": Set {
        "all",
      },
    },
    "category": Object {
      "modules": Set {
        "options",
        "grid",
      },
      "name": "category",
      "sharedSplitNames": Set {
        "all",
        "cms-category-shared",
        "product-category-shared",
      },
    },
    "cms": Object {
      "modules": Set {
        "carousel",
        "calendar",
      },
      "name": "cms",
      "sharedSplitNames": Set {
        "all",
        "cms-category-shared",
      },
    },
    "product": Object {
      "modules": Set {
        "swatches",
        "addtocart",
      },
      "name": "product",
      "sharedSplitNames": Set {
        "all",
        "product-category-shared",
      },
    },
  },
  "sharedGroups": Object {
    "all": Set {
      "jquery",
      "colorpicker",
    },
    "cms-category-shared": Set {
      "tooltip",
    },
    "product-category-shared": Set {
      "magnifier",
    },
  },
}
`);
});
