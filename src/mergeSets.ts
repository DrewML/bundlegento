/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

/**
 * @summary Merge n sets into a new Set, without mutating the original
 */
export function mergeSets<T>(sets: Set<T>[]) {
    return sets.reduce((all: Set<T>, set: Set<T>) => {
        return new Set([...all, ...set]);
    }, new Set<T>());
}
