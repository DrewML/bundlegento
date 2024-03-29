/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import { access, readdir, readFile } from 'fs';
import { isAbsolute, join } from 'path';
// TODO: Switch from promisify to fs promises when not experimental in node
import { promisify as p } from 'util';
import { wrapP } from './wrapP';

type Theme = {
    name: string;
    vendor: string;
};
export async function themeExists(staticFolderPath: string, theme: Theme) {
    const vendorsRoot = await getVendorsRoot(staticFolderPath);
    const themePath = join(vendorsRoot, theme.vendor, theme.name);
    const [err] = await wrapP(p(access)(themePath));

    return !err;
}

/**
 * @summary Find all _deployed_ languages for a single theme
 */
export async function getAllLanguages(staticContentDir: string, theme: Theme) {
    const vendorsRoot = await getVendorsRoot(staticContentDir);
    const themeDir = join(vendorsRoot, theme.vendor, theme.name);
    const themes = await p(readdir)(themeDir);
    // filter out any extra files/folders that aren't locales
    const reLang = /^[a-z]{2}(?:_[a-z]{2})?$/i;
    return themes.filter(t => reLang.test(t));
}

/**
 * @summary Find the dir with all vendors in pub/static
 */
async function getVendorsRoot(staticContentDir: string) {
    // Note: When a relative path is used, maybe we
    // should be looking relative to the config file
    // location, instead of process.cwd()?
    const staticDir = isAbsolute(staticContentDir)
        ? staticContentDir
        : join(process.cwd(), staticContentDir);

    // Note: `deployed_version.txt` can exist even when
    // static asset signing is disabled
    const versionFilePath = join(staticDir, 'deployed_version.txt');
    const [, version] = await wrapP(
        p(readFile)(versionFilePath, 'utf8').then(v => v.trim()),
    );
    const [accessErr] = await wrapP(
        p(access)(join(staticDir, version || 'CauseAnErrorOnPurpose')),
    );

    return accessErr
        ? join(staticContentDir, 'frontend')
        : join(staticContentDir, version, 'frontend');
}
