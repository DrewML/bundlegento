/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import { promises as fs } from 'fs';
import { isAbsolute, join } from 'path';
import { wrapP } from './wrapP';

type Theme = {
    name: string;
    vendor: string;
};
export async function themeExists(staticFolderPath: string, theme: Theme) {
    const vendorsRoot = await getVendorsRoot(staticFolderPath);
    const themePath = join(vendorsRoot, theme.vendor, theme.name);
    const [err] = await wrapP(fs.access(themePath));

    return !err;
}

export async function getAllLanguages(staticContentDir: string, theme: Theme) {
    const vendorsRoot = await getVendorsRoot(staticContentDir);
    const themeDir = join(vendorsRoot, theme.vendor, theme.name);
    const themes = await fs.readdir(themeDir);
    const reLang = /^[a-z]{2}(?:_[a-z]{2})?$/i;
    // filter out any extra files/folders that aren't locales
    return themes.filter(t => reLang.test(t));
}

const cache = new Map();
async function getVendorsRoot(staticContentDir: string) {
    if (cache.has(staticContentDir)) return cache.get(staticContentDir);

    // Note: When a relative path is used, maybe we,
    // should be checking relative to the config file
    // location, instead of process.cwd()?
    const staticDir = isAbsolute(staticContentDir)
        ? staticContentDir
        : join(process.cwd(), staticContentDir);

    // Warning: `deployed_version` exists (most of the time)
    // even when static asset signing is disabled
    const [, version] = await wrapP(
        fs
            .readFile(join(staticDir, 'deployed_version.txt'), 'utf8')
            .then(v => v.trim()),
    );
    const [accessErr] = await wrapP(
        fs.access(join(staticDir, version || 'CauseAnErrorOnPurpose')),
    );

    const root = accessErr
        ? join(staticContentDir, 'frontend')
        : join(staticContentDir, version, 'frontend');
    cache.set(staticContentDir, root);
    return root;
}
