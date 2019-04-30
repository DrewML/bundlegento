/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import vm from 'vm';
import { Logger } from './logger';
import { Config } from './configLocator';
import { readFileSync } from 'fs';

const requirejs = readFileSync(require.resolve('requirejs/require.js'), 'utf8');

// Piggy back on RequireJS's resolver so we don't have to duplicate
// that logic.
// Warning: Does not strip loaders i.e. "text!foo/bar"
export function createResolver(requireConfig: RequireConfig) {
    const sandbox = {};
    // RequireJS is old and designed to work in browsers, so it
    // does not export a global. This lil hack gets us where
    // we need to go
    vm.runInNewContext(requirejs, sandbox);
    // @ts-ignore
    sandbox.require.config({ ...requireConfig, baseUrl: '' });
    // @ts-ignore
    const nameToUrl = sandbox.require.s.contexts._.nameToUrl;

    return (id: string, ext = '.js') => nameToUrl(id, ext);
}

/**
 * 1. Get all languages for theme
 * 2. For each language, run bundling
 * 3. Return data
 */
type Opts = { logger: Logger };
export async function createBundles(config: Config, opts: Opts) {
    //
}
