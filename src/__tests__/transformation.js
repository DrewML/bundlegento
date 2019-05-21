const {
    wrapTextModule,
    isAMDWithDefine,
    wrapNonShimmedModule,
    wrapShimmedModule,
} = require('../transformation');

test('wrapTextModule transforms HTML to module w/ escaping and sourcemaps', () => {
    const result = wrapTextModule('bar', `<span>Hello World ''"</span>`);
    expect(result.toString()).toMatchInlineSnapshot(`
"define('text!bar', function() {
    return '<span>Hello World \\\\'\\\\'\\"</span>';
});"
`);
    expect(
        result.generateMap({
            source: 'bar.html',
            file: 'bar.html',
            includeContent: true,
        }),
    ).toMatchInlineSnapshot(`
SourceMap {
  "file": "bar.html",
  "mappings": ";YAAA",
  "names": Array [],
  "sources": Array [
    "bar.html",
  ],
  "sourcesContent": Array [
    "<span>Hello World ''\\"</span>",
  ],
  "version": 3,
}
`);
});

test('wrapNonShimmedModule wraps module w/ sourcemaps', () => {
    const result = wrapNonShimmedModule('bar', 'console.log("Hello World");');
    expect(result.toString()).toMatchInlineSnapshot(`
"define('bar', function() {
    // bundlegento-injected stub for non-AMD module (no shim config was found for this module)
});
// Original code for non-AMD module bar
console.log(\\"Hello World\\");"
`);
    expect(
        result.generateMap({
            source: 'bar.js',
            file: 'bar.js',
            includeContent: true,
        }),
    ).toMatchInlineSnapshot(`
SourceMap {
  "file": "bar.js",
  "mappings": ";;;;AAAA",
  "names": Array [],
  "sources": Array [
    "bar.js",
  ],
  "sourcesContent": Array [
    "console.log(\\"Hello World\\");",
  ],
  "version": 3,
}
`);
});

test('wrapShimmedModule injects body into define body with deps + sourcemaps', () => {
    const result = wrapShimmedModule('bar', 'log("hello world");', {
        deps: ['log'],
    });
    expect(result.toString()).toMatchInlineSnapshot(`
"define('bar', [\\"log\\"], function() {
        // Shimmed by bundlegento
        (function() {
            log(\\"hello world\\");;
        })();
        return window['undefined'];
    });"
`);
    expect(
        result.generateMap({
            source: 'bar.js',
            file: 'bar.js',
            includeContent: true,
        }),
    ).toMatchInlineSnapshot(`
SourceMap {
  "file": "bar.js",
  "mappings": ";;;YAAA",
  "names": Array [],
  "sources": Array [
    "bar.js",
  ],
  "sourcesContent": Array [
    "log(\\"hello world\\");",
  ],
  "version": 3,
}
`);
});

test('isAMDWithDefine is true for module with define', () => {
    expect(isAMDWithDefine('define([], function() {});')).toBe(true);
});

test('isAMDWithDefine is true for module with define and missing deps', () => {
    expect(isAMDWithDefine('define(function() {});')).toBe(true);
});

test('isAMDWithDefine is true for module with define and empty deps', () => {
    expect(isAMDWithDefine('define([], function() {});')).toBe(true);
});

test('isAMDWithDefine is true for module with define and some deps', () => {
    expect(isAMDWithDefine('define(["foo", "bar"], function() {});')).toBe(
        true,
    );
});

test('isAMDWithDefine is false for module without define', () => {
    expect(isAMDWithDefine('console.log("heh");')).toBe(false);
});
