/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

if (!window.requirejs) {
    let value;
    Object.defineProperty(window, 'requirejs', {
        get() {
            return value;
        },
        set(newValue) {
            value = newValue;
            if (value.__loaded__) return;

            value.__loaded__ = [];
            value.onResourceLoad = (_, map) => {
                value.__loaded__.push(map.id);
            };
        },
    });
}
