/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

const http = require('http');
const { join } = require('path');
const finalHandler = require('finalhandler');
const serveStatic = require('serve-static');
const { getModulesByGroups } = require('../scraper');

const logger = {
    log() {},
    warn() {},
    error() {},
};

test('Fetches all loaded dependencies on a page', async () => {
    const { url, close } = await createTestServer('basic');
    const { groups } = await getModulesByGroups(
        {
            configVersion: '1.0',
            storeRootURL: url,
            groups: {
                test: {
                    urls: ['/'],
                    includeForLayoutHandles: [],
                    excludeForLayoutHandles: [],
                },
            },
        },
        { logger },
    );
    await close();
    expect(groups).toEqual({
        test: new Set(['b', 'a', 'main']),
    });
});

test('Fetches correct dependencies for multiple pages/groups', async () => {
    // TODO: Faster HTTP server
    jest.setTimeout(10000);
    const { url, close } = await createTestServer('diagram');
    const { groups } = await getModulesByGroups(
        {
            configVersion: '1.0',
            storeRootURL: url,
            groups: {
                cart: {
                    urls: ['/cart'],
                    includeForLayoutHandles: [],
                    excludeForLayoutHandles: [],
                },
                category: {
                    urls: ['/category'],
                    includeForLayoutHandles: [],
                    excludeForLayoutHandles: [],
                },
                cms: {
                    urls: ['/cms'],
                    includeForLayoutHandles: [],
                    excludeForLayoutHandles: [],
                },
                product: {
                    urls: ['/product'],
                    includeForLayoutHandles: [],
                    excludeForLayoutHandles: [],
                },
            },
        },
        { logger },
    );
    await close();
    expect(groups).toEqual({
        cart: new Set([
            'cart',
            'libs/jquery',
            'libs/cart-api',
            'libs/colorpicker',
            'libs/shipping',
            'libs/fancyselect',
        ]),
        category: new Set([
            'category',
            'libs/jquery',
            'libs/tooltip',
            'libs/options',
            'libs/magnifier',
            'libs/grid',
        ]),
        cms: new Set([
            'cms',
            'libs/jquery',
            'libs/tooltip',
            'libs/colorpicker',
            'libs/carousel',
            'libs/calendar',
        ]),
        product: new Set([
            'product',
            'libs/jquery',
            'libs/swatches',
            'libs/colorpicker',
            'libs/magnifier',
            'libs/addtocart',
        ]),
    });
});

function createTestServer(fixtureName) {
    return new Promise((res, rej) => {
        const fixtureDir = join(__dirname, './__fixtures__', fixtureName);
        const serve = serveStatic(fixtureDir);
        const server = http.createServer((req, res) => {
            serve(req, res, finalHandler(req, res));
        });

        server.on('listening', () => {
            const { port } = server.address();
            res({
                url: `http://0.0.0.0:${port}`,
                close: () => new Promise(res => server.close(res)),
            });
        });
        server.on('error', rej);
        server.listen();
    });
}
