import jsesc from 'jsesc';
import MagicString, { Bundle } from 'magic-string';

// Tip: Can verify source-mappings are working correctly
// using http://evanw.github.io/source-map-visualization/

export function wrapTextModule(id: string, source: string) {
    const [before, after] = `define('text!${id}', function() {
    return 'SPLIT';
});`.split('SPLIT');

    const escaped = jsesc(source);
    const str = new MagicString(source);
    const startPiece = escaped.slice(0, escaped.length);

    // Have I mentioned I hate working with source-maps?
    return str
        .overwrite(0, source.length, startPiece)
        .append(escaped.slice(source.length + 1))
        .append(after)
        .prepend(before);
}

const RE_DEFINE = /define\s*\(/;
export function isAMDWithDefine(source: string) {
    return RE_DEFINE.test(source);
}

// Non-AMD modules typically expect that they're running
// in the top-most lexical scope. We inject a separate `define`
// to prevent the runtime RequireJS lib from fetching
// a module it thinks hasn't been loaded, but we keep
// the module code itself in the top-most scope
export function wrapNonShimmedAMDModule(id: string, source: string) {
    const str = new MagicString(source);
    return str.prepend(`define('${id}', function() {
    // bundlegento-injected stub for non-AMD module (no shim config was found for this module)
});
// Original code for non-AMD module ${id}\n`);
}

export function wrapShimmedAMDModule(
    id: string,
    source: string,
    shimConfig: RequireShim,
) {
    const deps = shimConfig.deps || [];
    const [before, after] = `define('${id}', ${JSON.stringify(
        deps,
    )}, function() {
        // Shimmed by bundlegento
        (function() {
            SPLIT;
        })();
        return window['${shimConfig.exports}'];
    });`.split('SPLIT');

    return new MagicString(source).prepend(before).append(after);
}
