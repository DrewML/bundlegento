/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import { join } from 'path';
import { Logger } from './logger';
import { Config } from './configLocator';
// TODO: Switch from promisify to fs promises when not experimental in node
import { promisify as p } from 'util';
import { readFile, writeFile, mkdir } from 'fs';
import { computeBundles } from './computeBundles';
import { getAllLanguages } from './magentoFS';
import { createResolver, Resolver } from './resolver';
import {
    wrapTextModule,
    wrapNonShimmedModule,
    isAMDWithDefine,
    isNamedAMD,
    wrapShimmedModule,
    renameModule,
} from './transformation';
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
                hires: true,
            }),
        );
    }

    console.log('Wrote bundles');
}

type ModuleDetails = {
    source: string;
    id: string;
    plugins: string[];
};
const moduleDetailsCache = new Map<string, ModuleDetails>();
async function getModuleDetails(id: string, resolver: Resolver) {
    if (moduleDetailsCache.has(id)) {
        return moduleDetailsCache.get(id) as ModuleDetails;
    }

    const mod = parseModuleID(id);
    const path = resolver(mod.id);
    try {
        const source = await p(readFile)(path, 'utf8');
        const result = { source, ...mod };
        moduleDetailsCache.set(id, result);
        return result;
    } catch (err) {
        err.message = `Failed reading module "${id}" in ${path}`;
        throw err;
    }
}

const cache = new Map<string, MagicString>();
async function generateBundleFile(
    modules: string[],
    resolver: Resolver,
    shim:{ [key: string]: RequireShim | string[] } = {},
) {
    const shimmedModules = new Set(Object.keys(shim));
    const pendingModules = modules.map(async rawID => {
        if (cache.has(rawID)) {
            return [rawID, cache.get(rawID) as MagicString] as [
                string,
                MagicString
            ];
        }

        let { source, id, plugins } = await getModuleDetails(rawID, resolver);

        let transformed;
        const needsShim = shimmedModules.has(id);
        const isAMD = isAMDWithDefine(source);

        // Example: Magento_Theme/templates/breadcrumbs.html
        if (plugins.includes('text')) {
            transformed = wrapTextModule(id, source);
        }

        // Example: underscore
        if (isNamedAMD(source)) {
            transformed = new MagicString(source);
        }

        // Example: matchMedia
        if (needsShim && !isAMD) {
            transformed = wrapShimmedModule(id, source, shim);
        }

        // Example: Magento_Swatches/js/catalog-add-to-cart
        if (!needsShim && !isAMD && !transformed) {
            transformed = wrapNonShimmedModule(id, source);
        }

        // Example: Magento_Review/js/error-placement
        if (!transformed && isAMD) {
            transformed = renameModule(id, source);
        }

        if (!transformed) {
            throw new Error(`Unsure how to bundle module "${id}"`);
        }

        cache.set(rawID, transformed);
        return [rawID, transformed] as [string, MagicString];
    });
    const results = await Promise.all(pendingModules);

    return concatModules(new Map(results));
}

function parseModuleID(id: string) {
    const parts = id.split('!');
    return {
        id: parts[parts.length - 1],
        plugins: parts.slice(0, parts.length - 1),
    };
}

function concatModules(modules: Map<string, MagicString>) {
    const bundle = new MagicBundle();
    bundle.prepend(`/* Generated by Bundlegento - ${Date()}  */\n\n`);
    for (const [id, source] of modules) {
        bundle.addSource({
            filename: `../${id}.js`,
            content: source,
        });
    }
    return bundle;
}
