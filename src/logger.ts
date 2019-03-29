/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

export type Logger = {
    log(...values: any[]): void;
    warn(...values: any[]): void;
    error(...values: any[]): void;
};

export const defaultLogger: Logger = {
    log: console.log,
    warn: console.warn,
    error: console.error,
};
