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
                // IgnoreSide-effect of Magento's mixin feature
                // https://github.com/magento/magento2/blob/6a9860/lib/web/mage/requirejs/mixins.js#L30
                if (map.id.startsWith('mixins!')) return;

                // The domReady plugin in RequireJS is so bizarre, and
                // ends up leaving empty dependencies once the "domReady!"
                // part is stripped. We just replace the plugin + empty dep
                // with the actual plugin dependency, so we ensure it makes
                // it into the bundle
                if (map.id === 'domReady!') {
                    value.__loaded__.push('domReady');
                    return;
                }

                value.__loaded__.push(map.id);
            };
        },
    });
}
