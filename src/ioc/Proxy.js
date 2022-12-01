/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


/**
 *
 *
 */
Ext.define("coon.core.ioc.Proxy", {


    requires: [
        // @define "l8"
        "l8",
        "Ext.Factory",
        "coon.core.ioc.sencha.FactoryProxy",
        "coon.core.ioc.sencha.CreateProxy"
    ],

    /**
     * @type {coon.core.ioc.sencha.FactoryProxy} FactoryProxy
     * @private
     */

    /**
     * @type {coon.core.ioc.sencha.CreateProxy} CreateProxy
     * @private
     */

    /**
     * @type {Boolean} booted
     * @private
     */


    /**
     *
     * @param {coon.core.ioc.Bindings} bindings
     */
    constructor ({bindings}) {
        const me = this;

        me.boot(bindings || {});
    },


    /**
     * @private
     */
    boot (bindings) {
        const me = this;

        if (!me.booted) {

            me.factoryProxy = Ext.create("coon.core.ioc.sencha.FactoryProxy", {bindings});
            me.createProxy = Ext.create("coon.core.ioc.sencha.CreateProxy", {bindings});

            Ext.Factory = new Proxy(Ext.Factory, me.factoryProxy);
            Ext.create = new Proxy(Ext.create, me.createProxy);
            me.booted = true;
        }
    }

});
