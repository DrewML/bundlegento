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
import fromEntries from 'fromentries';

const preloadScript = readFileSync(require.resolve('./preload'), 'utf8');

type Opts = { logger: Logger };
export async function getModulesByGroups(config: Config, { logger }: Opts) {
    const groups = fromEntries(
        Object.keys(config.groups).map(key => {
            const pair = [key, new Set() as Set<string>] as [
                string,
                Set<string>
            ];
            return pair;
        }),
    );

    for (const [group, modules] of Object.entries(groups)) {
        logger.log(`Fetching modules for group ${group}`);
        const { urls } = config.groups[group];
        const modulesInUse = await getModulesForPages(
            urls,
            config.storeRootURL,
            config.headless,
        );
        modulesInUse.forEach(modules.add.bind(modules));
    }

    return groups;
}

export async function getModulesForPages(
    urls: string[],
    rootURL: string,
    headless: boolean = true,
) {
    const browser = await puppeteer.launch({ headless: headless });

    // Parallel browser tabs for now, but _might_ need to change
    // to serial execution for large configs
    const deps = flatten(
        await Promise.all(
            urls.map(url =>
                getModulesForPage(browser, new URL(url, rootURL).toString()),
            ),
        ),
    );

    await browser.close();
    return deps;
}

async function getModulesForPage(browser: Browser, url: string) {
    const page = await browser.newPage();
    // Instrument the page to catch all loaded modules
    await page.evaluateOnNewDocument(preloadScript);

    await page.goto(url, {
        waitUntil: ['load', 'networkidle0'],
    });

    const modules: string[] = await page.evaluate('require.__loaded__');

    await page.close();
    return modules;
}
