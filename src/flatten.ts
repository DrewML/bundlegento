/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

export function flatten<T>(array: T[][]): T[] {
    return Array.prototype.concat.apply([], array);
}
