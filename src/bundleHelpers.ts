/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import jsesc from 'jsesc';

// TODO: SourceMap support. Can use Rich Harris' magic-string
// https://github.com/Rich-Harris/magic-string
// Note: It is intentional to not use a full ECMAScript parser here
// for performance reasons (JS grammar is complex and slow to parse).
// We can switch to an actual parser if we have to fix too many edge cases.
export function renameModule(id: string, source: string): string | undefined {
    const match = /define\s*\(/.exec(source);
    if (!match) return;

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

export function wrapTextModule(id: string, source: string) {
    const escaped = jsesc(source);
    return `
define('${id}', function() {
    return '${escaped}';
});
`;
}
