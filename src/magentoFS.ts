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

async function getVendorsRoot(staticContentDir: string) {
    // Note: When a relative path is used, maybe we,
    // should be checking relative to the config file
    // location, instead of process.cwd()?
    const staticDir = isAbsolute(staticContentDir)
        ? staticContentDir
        : join(process.cwd(), staticContentDir);

    // Note: `deployed_version.txt` can exist even when
    // static asset signing is disabled
    const versionFilePath = join(staticDir, 'deployed_version.txt');
    const [, version] = await wrapP(
        fs.readFile(versionFilePath, 'utf8').then(v => v.trim()),
    );
    const [accessErr] = await wrapP(
        fs.access(join(staticDir, version || 'CauseAnErrorOnPurpose')),
    );

    return accessErr
        ? join(staticContentDir, 'frontend')
        : join(staticContentDir, version, 'frontend');
}
