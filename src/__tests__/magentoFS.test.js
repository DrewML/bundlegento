/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

const { join } = require('path');
const { getAllLanguages, themeExists } = require('../magentoFS');

const fixtureFor = n => join(__dirname, '__fixtures__', n);

test('Finds all languages when static signing is enabled', async () => {
    const staticDir = fixtureFor('signedStatic');
    const theme = { name: 'luma', vendor: 'Magento' };
    const languages = await getAllLanguages(staticDir, theme);
    expect(languages).toEqual(['en_US', 'nl_BE']);
});

test('Finds all languages when static signing is disabled', async () => {
    const staticDir = fixtureFor('unsignedStatic');
    const theme = { name: 'blank', vendor: 'Magento' };
    const languages = await getAllLanguages(staticDir, theme);
    expect(languages).toEqual(['en_US', 'nl_BE']);
});

test('Finds theme that exists when static signing is enabled', async () => {
    const staticDir = fixtureFor('signedStatic');
    const theme = { name: 'luma', vendor: 'Magento' };
    const exists = await themeExists(staticDir, theme);
    expect(exists).toBe(true);
});

test('Does not find theme that does not exist when static signing is enabled', async () => {
    const staticDir = fixtureFor('signedStatic');
    const theme = { name: 'nope', vendor: 'Magento' };
    const exists = await themeExists(staticDir, theme);
    expect(exists).toBe(false);
});

test('Finds theme that exists when static signing is disabled', async () => {
    const staticDir = fixtureFor('unsignedStatic');
    const theme = { name: 'blank', vendor: 'Magento' };
    const exists = await themeExists(staticDir, theme);
    expect(exists).toBe(true);
});

test('Does not find theme that does not exist when static signing is disabled', async () => {
    const staticDir = fixtureFor('unsignedStatic');
    const theme = { name: 'nope', vendor: 'Magento' };
    const exists = await themeExists(staticDir, theme);
    expect(exists).toBe(false);
});
