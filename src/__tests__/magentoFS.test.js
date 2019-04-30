/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

const { join } = require('path');
const { getAllThemes } = require('../magentoFS');

test('Finds all themes when static content signing is enabled', async () => {
    const staticDir = join(__dirname, '__fixtures__/signedStatic');
    const [firstTheme] = await getAllThemes(staticDir);
    expect(firstTheme).toBe(
        join(staticDir, '1234567890/frontend/Magento/luma'),
    );
});

test('Finds all themes when static content signing is disabled', async () => {
    const staticDir = join(__dirname, '__fixtures__/unsignedStatic');
    const [firstTheme] = await getAllThemes(staticDir);
    expect(firstTheme).toBe(join(staticDir, 'frontend/Magento/blank'));
});
