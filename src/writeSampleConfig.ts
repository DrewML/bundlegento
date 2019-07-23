/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import { copyFile } from 'fs';
// TODO: Switch from promisify to fs promises when not experimental in node
import { promisify as p } from 'util';
import { join } from 'path';

const sampleConfigPath = require.resolve('../samples/.bundlegentorc');

/**
 * @summary Copy the sample config file into the user's cwd
 */
export async function writeSampleConfig() {
    const dest = join(process.cwd(), '.bundlegentorc.yml');
    await p(copyFile)(sampleConfigPath, dest);
    return dest;
}
