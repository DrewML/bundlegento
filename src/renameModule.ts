// TODO: SourceMap support. Can use Rich Harris' magic-string
// https://github.com/Rich-Harris/magic-string
// Note: It is intentional to not use a full ECMAScript parser here
// for performance reasons (JS grammar is complex and slow to parse)
export function renameModule(id: string, source: string) {
    const defineIdx = source.indexOf('define');
    if (defineIdx === -1) {
        throw new Error(`Could not find define call for module ${id}`);
    }

    let firstParenIdx = -1;
    let i = defineIdx + 'define'.length;

    while (true) {
        if (source[i] === '(') {
            firstParenIdx = i;
            break;
        }
        if (source[i] === ' ') {
            i++;
            continue;
        }

        throw new Error(
            `Unexpected character ${
                source[i]
            } found after define call in ${id}`,
        );
    }

    const strStart = source.slice(0, firstParenIdx + 1);
    const strEnd = source.slice(firstParenIdx + 1);

    return `${strStart}'${id}', ${strEnd}`;
}
