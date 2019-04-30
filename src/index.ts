/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import { configLocator } from './configLocator';
import { getModulesByGroups } from './scraper';
import { computeBundles } from './computeBundles';
import { promises as fs } from 'fs';
import { join } from 'path';
import { serialize } from './serialize';
import { Logger, defaultLogger } from './logger';

type Opts = { configPath?: string; logger?: Logger };
export async function runForProject({
    configPath,
    logger = defaultLogger,
}: Opts) {
    const config = await configLocator({ configPath, logger });
    const modulesByGroups = await getModulesByGroups(config, { logger });
    // TODO: Cache results here, and add a `--lastRun` option to bundle
    // based on the previously-fetched data
    const bundleSpec = computeBundles(modulesByGroups, { logger });

    await fs.writeFile(join(__dirname, '../output.txt'), serialize(bundleSpec));
}
