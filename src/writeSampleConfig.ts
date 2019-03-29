/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import { promises as fs } from 'fs';
import { join } from 'path';

const sampleConfigPath = require.resolve('../samples/.bundlegentorc');

export async function writeSampleConfig() {
    const dest = join(process.cwd(), '.bundlegentorc.yml');
    await fs.copyFile(sampleConfigPath, dest);
    return dest;
}
