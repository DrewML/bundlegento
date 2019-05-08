/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import jsesc from 'jsesc';

const RE_DEFINE = /define\s*\(/;

// TODO: SourceMap support. Can use Rich Harris' magic-string
// https://github.com/Rich-Harris/magic-string
// Note: It is intentional to not use a full ECMAScript parser here
// for performance reasons (JS grammar is complex and slow to parse).
// We can switch to an actual parser if we have to fix too many edge cases.
export function renameModule(id: string, source: string): string | undefined {
    const match = RE_DEFINE.exec(source);
    if (!match) return wrapNonShimmedAMDModule(id, source);

    const defineIdx = match.index;

    let firstParenIdx = -1;
    let i = defineIdx + 'define'.length;

    while (true) {
        if (source[i] === '(') {
            firstParenIdx = i;
            const [, next = ''] = source.slice(i + 1).match(/\s*(.)/) || [];
            // Named module, bail
            if (/['"`]/.test(next)) return;
            break;
        }

        if (source[i] === ' ') {
            i++;
            continue;
        }

        return;
    }

    const strStart = source.slice(0, firstParenIdx + 1);
    const strEnd = source.slice(firstParenIdx + 1);

    return `${strStart}'${id}', ${strEnd}`;
}

// Non-AMD modules typically expect that they're running
// in the top-most lexical scope. We inject a separate `define`
// to prevent the runtime RequireJS lib from fetching
// a module it thinks hasn't been loaded
function wrapNonShimmedAMDModule(id: string, source: string) {
    return `define('${id}', function() {
    // bundlegento-injected stub for non-AMD module (no shim config was found for this module)
});
// Original code for non-AMD module ${id}
${source}
`;
}

export function wrapShimmedAMDModule(
    id: string,
    source: string,
    shimConfig: RequireShim,
) {
    // For some awful reason, luma (or blank) in core
    // defines a shim for a module that's a valid AMD module
    if (RE_DEFINE.test(source)) return renameModule(id, source);

    const deps = shimConfig.deps || [];
    return `define('${id}', ${JSON.stringify(deps)}, function() {
        // Shimmed by bundlegento
        (function() {
            ${source};
        })();
        return window['${shimConfig.exports}'];
    });`;
}

export function wrapTextModule(id: string, source: string) {
    const escaped = jsesc(source);
    return `
define('${id}', function() {
    return '${escaped}';
});
`;
}
