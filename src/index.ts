/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import { configLocator } from './configLocator';
import { getModulesByGroups } from './scraper';
import { computeBundles } from './computeBundles';
import { createBundles } from './bundler';
// TODO: Switch from promisify to fs promises when not experimental in node
import { promisify as p } from 'util';
import { writeFile } from 'fs';
import { join } from 'path';
import { serialize } from './serialize';
import { Logger, defaultLogger } from './logger';
import { themeExists } from './magentoFS';

type Opts = { configPath?: string; logger?: Logger };
export async function runForProject({
    configPath,
    logger = defaultLogger,
}: Opts) {
    const config = await configLocator({ configPath, logger });
    const exists = await themeExists(config.staticFolderPath, config.theme);
    if (!exists) {
        throw new Error(
            `Could not find theme "${config.theme.vendor}/${
                config.theme.name
            }"`,
        );
    }
    const { groups, requireConfig } = await getModulesByGroups(config, {
        logger,
    });
    // TODO: Cache results here, and add a `--lastRun` option to bundle
    // based on the previously-fetched data
    const bundleSpec = computeBundles(groups);

    await p(writeFile)(join(__dirname, '../output.txt'), serialize(bundleSpec));
    await createBundles({ config, bundleSpec, requireConfig, logger });
}
