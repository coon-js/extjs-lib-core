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
 * Handler for proxying Ext.create.
 *
 * @example
 *
 *   // ioc-bindings available with "bindings"
 *   Ext.create = new Proxy(
 *       Ext.create, Ext.create("coon.core.ioc.sencha.CreateProxy", bindings)
*    );
 *
 */
Ext.define("coon.core.ioc.sencha.CreateProxy", {

    extend: "coon.core.ioc.sencha.AbstractProxy",

    requires: [
        // @define "l8"
        "l8"
    ],

    /**
     * meta property with a class that provides information about
     * dependencies. Defaults to "require".
     * @type {String} reqioreProperty
     * @private
     */
    requireProperty: "require",

    /**
     * Apply handler for proxying calls to Ext.create().
     * Checks if the class name available with argumentsList[0] is defined
     * and will then resolve dependencies with the help of resolveDependencies(),
     * if the arguments found in argumentsList[1] do not already contain
     * configurations for these dependencies.
     *
     * @example
     *   // acme.Request.require = {requestor: "acme.RequestConfigurator"}
     *   proxy.apply({}, {}, ["acme.Request", {}];
     *   // config has no "requestor" configured with arguments, will resolve
     *   // dependencies using available bindings by calling resolveDependencies()
     *
     *   proxy.apply({}, {}, ["acme.Request", {requestor: {}];
     *   // config has "requestor" configured with arguments, will not resolve
     *   // dependencies
     *
     * @param target
     * @param thisArg
     * @param argumentsList
     * @returns {*}
     */
    apply (target, thisArg, argumentsList) {

        const me = this;

        let [className, cfg] = argumentsList;

        if (l8.isString(className)) {
            const cls = Ext.ClassManager.get(className);
            if (cls) {
                const requireCfg = cls[me.requireProperty];
                if (l8.isObject(requireCfg)) {
                    cfg = Object.assign(
                        cfg || {},
                        me.resolveDependencies(Ext.ClassManager.getName(cls), requireCfg)
                    );
                }
            }
        }

        argumentsList[1] = cfg;

        return Reflect.apply(target, thisArg, argumentsList);
    }

});
