# Why a Custom Tool?

JavaScript module bundling is not a new idea, and Magento is far from the first piece of software to implement it. There are many excellent off-the-shelf tools designed to solve this problem:

-   [Browserify](http://browserify.org/)
-   [webpack](https://webpack.js.org/)
-   [Parcel](https://parceljs.org/)

The problem, though, is that these tools were designed for applications where the entirety of the graph can be discovered just through static analysis of JavaScript source files.

This is not the case for Magento 2. Although Magento does use a proper module system where each module can express its dependencies ([RequireJS](https://requirejs.org/)), it is impossible to statically analyze which entry points will be used for an individual page.

This is because `RequireJS` supports fetching/loading of arbitrary modules at runtime, through the global variables `require` and `define`. Unfortunately, it has become a common practice (and in some places, a documented feature) in Magento to rely on heavily dynamic use of `require`/`define`.

### Sources of Dynamic Module Entries in Magento 2

-   [`x-magento-init`/`mage-init`](https://devdocs.magento.com/guides/v2.3/javascript-dev-guide/javascript/js_init.html)
-   [UI Components](https://devdocs.magento.com/guides/v2.3/ui_comp_guide/bk-ui_comps.html) (`template` property)
-   [Inline calls](https://github.com/magento/magento2/blob/07e57ac249e02b721613172c4c3c8e24a3bdd746/app/code/Magento/Sales/view/adminhtml/templates/order/create/form/address.phtml#L32)
-   [Mixins](https://devdocs.magento.com/guides/v2.3/javascript-dev-guide/javascript/js_mixins.html)
