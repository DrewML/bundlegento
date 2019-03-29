const http = require('http');
const { join } = require('path');
const finalHandler = require('finalhandler');
const serveStatic = require('serve-static');
const { defaultLogger } = require('../logger');
const { getModulesByGroups } = require('../scraper');

test('Fetches all loaded dependencies on a page', async () => {
    const { url, close } = await createTestServer('basic');
    const results = await getModulesByGroups(
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
        { logger: defaultLogger },
    );
    await close();
    expect(results).toEqual({
        test: new Set(['b', 'a', 'main']),
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
