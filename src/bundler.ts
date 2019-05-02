/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import vm from 'vm';
import { join } from 'path';
import { Logger } from './logger';
import { Config } from './configLocator';
import { readFileSync, promises as fs } from 'fs';
import { BundleSpec } from './computeBundles';
import { themeExists, getAllLanguages } from './magentoFS';

type Opts = {
    config: Config;
    bundleSpec: BundleSpec;
    requireConfig: RequireConfig;
    logger: Logger;
};
export async function createBundles(opts: Opts) {
    const { theme, staticFolderPath } = opts.config;
    const { groups, sharedGroups } = opts.bundleSpec;

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

    const firstLang = langs[0];
    const baseDir = join(
        staticFolderPath,
        'frontend',
        theme.vendor,
        theme.name,
        firstLang,
    );

    type CacheEntry = {
        source: string;
        mod: ReturnType<typeof parseModuleID>;
    };
    const cache = new Map<string, CacheEntry>();
    const resolve = createResolver(opts.requireConfig);

    for (const [name, group] of groups) {
        for (const moduleID of group.modules) {
            const mod = parseModuleID(moduleID);
            const path = resolve(baseDir, mod.id, mod.isText);
            console.log(path);
        }
    }
}

const requirejs = readFileSync(require.resolve('requirejs/require.js'), 'utf8');
// Piggy back on RequireJS's resolver so we don't have to duplicate that logic.
// Warning: Does not strip loaders i.e. "text!foo/bar"
function createResolver(requireConfig: RequireConfig) {
    const sandbox = {};
    // RequireJS targeted at browsers, so it doesn't
    // have a CommonJS version, and just sets a global.
    // This is a quick hack to get what we need off that global
    vm.runInNewContext(requirejs, sandbox);
    // @ts-ignore
    sandbox.require.config({ ...requireConfig, baseUrl: '' });
    // @ts-ignore
    const nameToUrl = sandbox.require.s.contexts._.nameToUrl;

    return (baseDir: string, id: string, isText: boolean) => {
        const rel: string = nameToUrl(id, isText ? '.html' : '.js');
        return join(baseDir, rel);
    };
}

function parseModuleID(id: string) {
    const parts = id.split('!');
    return {
        id: parts[parts.length - 1],
        isText: parts.includes('text'),
    };
}
