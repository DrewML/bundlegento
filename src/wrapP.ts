/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

/**
 * @summary Wrap a promise, and return a promise that will
 *          resolve to an [error, T] tuple
 */
export async function wrapP<T>(promise: Promise<T>) {
    try {
        const result = await promise;
        return [null, result];
    } catch (err) {
        return [err];
    }
}
