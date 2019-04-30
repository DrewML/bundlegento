/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import { promises as fs } from 'fs';
import { isAbsolute, join } from 'path';
import { wrapP } from './wrapP';
import { flatten } from './flatten';

export async function getAllThemes(staticContentDir: string) {
    const vendorsRoot = await getVendorsRoot(staticContentDir);
    const vendors = (await fs.readdir(vendorsRoot)).filter(
        // Ignore dot files
        theme => !theme.startsWith('.'),
    );
    const pendingThemes = vendors.map(async vendor => {
        const themes = await fs.readdir(join(vendorsRoot, vendor));
        return themes
            .filter(theme => theme !== 'base')
            .map(theme => join(vendorsRoot, vendor, theme));
    });
    const themes = flatten(await Promise.all(pendingThemes));
    return themes;
}

export async function getVendorsRoot(staticContentDir: string) {
    const staticDir = isAbsolute(staticContentDir)
        ? staticContentDir
        : // Note: Maybe this should be relative to the config file path,
          // rather than process.cwd()?
          join(process.cwd(), staticContentDir);
    const [, version] = await wrapP(
        // Warning: `deployed_version_ exists (most of the time)
        // even when static asset signing is disabled
        fs
            .readFile(join(staticDir, 'deployed_version.txt'), 'utf8')
            .then(v => v.trim()),
    );
    const [accessErr] = await wrapP(
        fs.access(join(staticDir, version || 'notfound')),
    );

    return accessErr
        ? join(staticContentDir, 'frontend')
        : join(staticContentDir, version, 'frontend');
}
