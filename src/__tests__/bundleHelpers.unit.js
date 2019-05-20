/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

const { renameModule, wrapTextModule } = require('../bundleHelpers');

test('renameModule names simple AMD module', () => {
    const src = `
        define([], function() {
            return 1;
        })
    `;
    const result = renameModule('foo', src);
    expect(result).toMatchInlineSnapshot(`
"
        define('foo', [], function() {
            return 1;
        })
    "
`);
});

test('renameModule names one-liner AMD module', () => {
    const src = `define([], function() { return 1; })`;
    const result = renameModule('foo/bar', src);
    expect(result).toMatchInlineSnapshot(
        `"define('foo/bar', [], function() { return 1; })"`,
    );
});

test('renameModule handles modules without a deps array', () => {
    const src = `define(function() {})`;
    const result = renameModule('foo', src);
    expect(result).toMatchInlineSnapshot(`"define('foo', function() {})"`);
});

test('renameModule does not break on lint comments referencing define', () => {
    // Real world breakage in `requirejs/domReady.js` in Magento stores
    const src = `
    /*jslint */
    /*global define: false */

    define(function () {
        return 1;
    });
    `;
    const result = renameModule('foo', src);
    expect(result).toMatchInlineSnapshot(`
"
    /*jslint */
    /*global define: false */

    define('foo', function () {
        return 1;
    });
    "
`);
});

test('renameModule does not rename named modules', () => {
    const src = `define('foo', [], () => {})`;
    const result = renameModule('foo', src);
    expect(result).toBe(undefined);
});

test('renameModule injects an empty define above a non-AMD module without a shim', () => {
    const src = `console.log('not an AMD module')`;
    const result = renameModule('foo', src);
    expect(result).toMatchInlineSnapshot(`
"define('foo', function() {
    // bundlegento-injected stub for non-AMD module (no shim config was found for this module)
});
// Original code for non-AMD module foo
console.log('not an AMD module')
"
`);
});

test('wrapTextModule properly escapes strings', () => {
    const src = `
        <div>
            <span>Hello, world '"</span>
        </div>
    `;
    const result = wrapTextModule('foo', src);
    expect(result).toMatchInlineSnapshot(`
"
define('text!foo', function() {
    return '\\\\n        <div>\\\\n            <span>Hello, world \\\\'\\"</span>\\\\n        </div>\\\\n    ';
});
"
`);
});
