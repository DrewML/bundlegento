/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import cosmiconfig from 'cosmiconfig';
import { Logger } from './logger';

type GroupConfig = {
    urls: string[];
    includeForLayoutHandles: string[];
    excludeForLayoutHandles: string[];
};

export type Config = {
    configVersion: '1.0';
    headless?: boolean;
    storeRootURL: string;
    theme: {
        name: string;
        vendor: string;
    };
    staticFolderPath: string;
    outDir: string;
    groups: Record<string, GroupConfig>;
};

type Opts = { configPath?: string; logger: Logger };

/**
 * @summary Find the closest .bundlegentorc config file
 * @todo JSON schema + validation
 */
export async function configLocator({
    configPath,
    logger,
}: Opts): Promise<Config> {
    const configExplorer = cosmiconfig('bundlegento');
    logger.log(configPath ? 'Reading config file' : 'Looking for config file');
    const config = configPath
        ? await configExplorer.load(configPath)
        : await configExplorer.search(process.cwd());

    if (!config) {
        throw new Error('Failed to find bundlegento configuration file');
    }
    logger.log(`Found configuration at ${config.filepath}`);
    return (config.config as unknown) as Config;
}
