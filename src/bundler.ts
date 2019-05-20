/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import vm from 'vm';
import { wrapP } from './wrapP';
import { join, parse } from 'path';
import { Logger } from './logger';
import { Config } from './configLocator';
// TODO: Switch from promisify to fs promises when not experimental in node
import { promisify as p } from 'util';
import { readFileSync, readFile, writeFile, mkdir } from 'fs';
import { computeBundles } from './computeBundles';
import {
    renameModule,
    wrapShimmedAMDModule,
    wrapTextModule,
} from './bundleHelpers';
import { themeExists, getAllLanguages } from './magentoFS';
import MagicString, { Bundle as MagicBundle } from 'magic-string';

type Opts = {
    config: Config;
    bundleSpec: ReturnType<typeof computeBundles>;
    requireConfig: RequireConfig;
    logger: Logger;
};
export async function createBundles(opts: Opts) {
    const { theme, staticFolderPath, outDir } = opts.config;
    const { bundleSpec } = opts;

    const exists = await themeExists(staticFolderPath, theme);
    if (!exists) {
        // TODO: Should check this _wayyy_ earlier in the app lifecycle
        // before ever fetching data from the store
        throw new Error(`Could not locate theme "${theme.name}"`);
    }

    const langs = await getAllLanguages(staticFolderPath, theme);
    opts.logger.log(
        `Found ${langs.length} languages for theme ${theme.name}: ${langs.join(
            ', ',
        )}`,
    );

    // TODO: Do we actually need to handle multilang for JS?
    // If so, should probably do it :)
    const firstLang = langs[0];
    const baseDir = join(
        staticFolderPath,
        'frontend',
        theme.vendor,
        theme.name,
        firstLang,
    );

    const resolve = createResolver(opts.requireConfig, baseDir);
    opts.logger.log(`Created RequireJS resolver with baseDir: ${baseDir}`);

    await p(mkdir)(outDir, { recursive: true });

    for (const [name, group] of bundleSpec) {
        const bundle = await generateBundleFile(
            [...group.modules],
            resolve,
            opts.requireConfig.shim,
        );
        const filePath = join(outDir, `${name}.js`);
        const mapPath = join(outDir, `${name}.js.map`);
        bundle.append(`//# sourceMappingURL=${name}.js.map`);
        await p(writeFile)(filePath, bundle);
        await p(writeFile)(
            mapPath,
            bundle.generateMap({
                file: `${name}.js`,
                includeContent: true,
            }),
        );
    }

    console.log('Wrote bundles');
}

const cache = new Map<string, string>();
async function generateBundleFile(
    modules: string[],
    resolver: ReturnType<typeof createResolver>,
    shim: RequireShim = {},
) {
    const shimmedModules = new Set(Object.keys(shim));
    const results = await Promise.all(
        modules.map(async id => {
            if (cache.has(id)) {
                return [id, cache.get(id) as string] as [string, string];
            }

            const mod = parseModuleID(id);
            const path = resolver(mod.id);
            let [err, source] = await wrapP(p(readFile)(path, 'utf8'));
            if (err) {
                throw new Error(`Failed reading module ${id} in ${path}`);
            }

            if (mod.plugins.includes('text')) {
                source = wrapTextModule(mod.id, source);
            } else {
                source = shimmedModules.has(mod.id)
                    ? wrapShimmedAMDModule(
                          mod.id,
                          source,
                          // @ts-ignore
                          shim[mod.id],
                      )
                    : renameModule(mod.id, source) || source;
            }

            cache.set(id, source);
            return [id, source] as [string, string];
        }),
    );

    return concatModules(new Map(results));
}

// We're making an (admittedly large) assumption here that Require's
// ID resolving logic hasn't changed between versions used across
// various Magento releases
const requirejs = readFileSync(require.resolve('requirejs/require.js'), 'utf8');
// Piggy back on RequireJS's resolver so we don't have to duplicate that logic.
// Warning: Does not strip plugins i.e. "text!foo/bar"
function createResolver(requireConfig: RequireConfig, baseDir: string) {
    const sandbox = {};
    // RequireJS is targeted at browsers, so it doesn't
    // have a CommonJS version, and just sets a global.
    // This is a quick hack to get what we need off that global
    vm.runInNewContext(requirejs, sandbox);
    // @ts-ignore
    sandbox.require.config({ ...requireConfig, baseUrl: '' });
    // @ts-ignore
    const nameToUrl = sandbox.require.s.contexts._.nameToUrl;

    return (id: string) => {
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
}

function parseModuleID(id: string) {
    const parts = id.split('!');
    return {
        id: parts[parts.length - 1],
        plugins: parts.slice(0, parts.length - 1),
    };
}

function concatModules(modules: Map<string, string>) {
    const bundle = new MagicBundle();
    bundle.prepend(
        `/* This file was generated by Bundlegento - ${Date()}  */\n\n`,
    );
    for (const [id, source] of modules) {
        bundle.addSource({
            filename: `../${id}.js`,
            content: new MagicString(source),
        });
    }
    return bundle;
}
