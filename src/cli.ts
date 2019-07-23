/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import chalk from 'chalk';
import meow from 'meow';
import { runForProject } from './';
import { writeSampleConfig } from './writeSampleConfig';

/**
 * TODO:
 * 1. Add setup wizard to `--init` with inquirer to set defaults
 */
const { flags } = meow(
    `
    Usage
        $ bundlegento

    Options
        --init, -i Generate a sample configuration file
        --config, -c Specify a path for the config file
        --verbose    Enable verbose logging

    Examples
        $ bundlegento --config /Users/site/storedotcom/.bundlegento
`,
    {
        flags: {
            init: {
                type: 'boolean',
                alias: 'i',
            },
            config: {
                type: 'string',
                alias: 'c',
            },
            verbose: {
                type: 'boolean',
            },
        },
    },
);

if (flags.init) {
    writeSampleConfig()
        .then(configPath => {
            console.log(
                chalk`{green Configuration file written to ${configPath}}`,
            );
        })
        .catch(errorAndExit);
} else {
    const logger = {
        log: log.bind(null, 'log'),
        warn: log.bind(null, 'warn'),
        error: log.bind(null, 'error'),
    };
    runForProject({ configPath: flags.config, logger }).catch(errorAndExit);
}

// TODO: Just switch to an existing lib with log-levels
function log(type: 'log' | 'warn' | 'error', ...values: any[]) {
    if (type === 'log' && flags.verbose) {
        console.log(chalk.cyan('LOG: '), ...values);
    }

    if (type === 'warn') {
        console.warn(chalk.yellow('WARN: '), ...values);
    }

    if (type === 'error') {
        console.error(chalk.red('ERROR: '), ...values);
    }
}

function errorAndExit(e: Error) {
    console.error(chalk.red(e.message));
    console.error(
        (e.stack as string)
            // Pluck message out of top line of stack trace
            .split('\n')
            .slice(1)
            .join('\n'),
    );
}
