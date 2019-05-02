const { renameModule } = require('../renameModule');

test('Names simple AMD module', () => {
    const src = `
        define([], function() {
            return 1;
        })
    `;
    const result = renameModule('foo', src);
    expect(result).toEqual(`
        define('foo', [], function() {
            return 1;
        })
    `);
});

test('Names one-liner AMD module', () => {
    const src = `define([], function() return 1; })`;
    const result = renameModule('foo/bar', src);
    expect(result).toEqual(`define('foo/bar', [], function() return 1; })`);
});
