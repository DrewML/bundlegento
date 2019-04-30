/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

const { createResolver } = require('../bundler');

test('testing', () => {
    const resolve = createResolver({
        paths: {
            jquery: 'jquery/jquery',
        },
    });
    expect(resolve('jquery')).toBe('jquery/jquery.js');
});
