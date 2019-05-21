import vm from 'vm';
import { readFileSync } from 'fs';
import { parse, join } from 'path';

// We're making an (admittedly large) assumption here that Require's
// ID resolving logic hasn't changed between versions used across
// various Magento releases
const requirejs = readFileSync(require.resolve('requirejs/require.js'), 'utf8');

// Piggy back on RequireJS's resolver so we don't have to duplicate that logic.
// Warning: Does not strip plugins i.e. "text!foo/bar"
export type Resolver = (id: string) => string;
// Haven't profiled yet to see how expensive the vm module is,
// but doing cheap caching for now just in case. Cache key is
// by `requireConfig` identity (===)
const cache = new Map<RequireConfig, Resolver>();
export function createResolver(requireConfig: RequireConfig, baseDir: string) {
    if (cache.has(requireConfig)) return cache.get(requireConfig) as Resolver;

    const sandbox = {};
    // RequireJS is targeted at browsers, so it doesn't
    // have a CommonJS version, and just sets a global.
    // This is a quick hack to get what we need off that global
    vm.runInNewContext(requirejs, sandbox);
    // @ts-ignore
    sandbox.require.config({ ...requireConfig, baseUrl: '' });
    // @ts-ignore
    const nameToUrl = sandbox.require.s.contexts._.nameToUrl;

    const resolver = (id: string) => {
        const parts = parse(id);
        const knownExt = parts.ext === '.js' || parts.ext === '.html';
        // Some of the crazyness below is to deal with module names
        // that appear to include extensions, like jquery.mobile.custom
        const rel: string = nameToUrl(
            join(parts.dir, knownExt ? parts.name : parts.base),
            knownExt ? parts.ext : '.js',
        );
        return join(baseDir, rel);
    };

    cache.set(requireConfig, resolver);
    return resolver;
}
