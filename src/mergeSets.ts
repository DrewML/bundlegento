/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

export function mergeSets<T>(sets: Set<T>[]) {
    return sets.reduce((all: Set<T>, set: Set<T>) => {
        return new Set([...all, ...set]);
    }, new Set());
}
