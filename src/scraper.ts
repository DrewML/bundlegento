/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import puppeteer, { Browser } from 'puppeteer';
import { readFileSync } from 'fs';
import { Config } from './configLocator';
import { URL } from 'url';
import { flatten } from './flatten';
import { Logger } from './logger';

const preloadScript = readFileSync(require.resolve('./preload'), 'utf8');
const IGNORE = new Set([
    'module', // not a real module, special case handled by RequireJS
    'require', // not a real module, special case handled by RequireJS
    'mixins', // included by Magento in separate file
]);

type Opts = { logger: Logger };
/**
 * @summary Scrapes the provided URLs for a Magento store, returning
 *          module usage data per-page, along with the require configuration
 */
export async function getModulesByGroups(config: Config, { logger }: Opts) {
    const groups = new Map(
        Object.keys(config.groups).map(
            key => [key, new Set<string>()] as [string, Set<string>],
        ),
    );

    const browser = await puppeteer.launch({ headless: config.headless });
    const [firstURL] = Object.values(config.groups)[0].urls;
    const requireConfig = await getRequireConfig(
        browser,
        new URL(firstURL, config.storeRootURL).toString(),
    );

    for (const [group, modules] of groups) {
        logger.log(`Fetching modules for group ${group}`);
        const { urls } = config.groups[group];
        const modulesInUse = await getModulesForPages(
            browser,
            urls,
            config.storeRootURL,
        );
        modulesInUse.forEach(modules.add.bind(modules));
    }

    await browser.close();

    return { groups, requireConfig };
}

export async function getModulesForPages(
    browser: Browser,
    urls: string[],
    rootURL: string,
) {
    return flatten(
        await Promise.all(
            urls.map(url =>
                getModulesForPage(browser, new URL(url, rootURL).toString()),
            ),
        ),
    );
}

async function getModulesForPage(browser: Browser, url: string) {
    const page = await browser.newPage();
    // Instrument the page to catch all loaded modules
    await page.evaluateOnNewDocument(preloadScript);

    await page.goto(url, {
        waitUntil: ['networkidle0', 'load'],
    });

    const modules: string[] = await page.evaluate('require.__loaded__');

    await page.close();
    return modules.filter(m => !IGNORE.has(m));
}

// This makes a second request to a page that has already
// been visited by `getModulesForPage`. But, the extra request
// isn't expensive, and the body of that method stays cleaner
async function getRequireConfig(browser: Browser, url: string) {
    const page = await browser.newPage();
    await page.goto(url, {
        waitUntil: ['load', 'networkidle0'],
    });
    return page.evaluate('require.s.contexts._.config') as Promise<
        RequireConfig
    >;
}
