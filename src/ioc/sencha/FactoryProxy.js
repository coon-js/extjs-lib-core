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
 * Handler for proxying Ext.Factory["proxy", "store", "controller", ...]
 *
 * @example
 *
 *   // ioc-bindings available with "bindings"
 *   Ext.Factory = new Proxy(
 *       Ext.Factory, Ext.create("coon.core.ioc.sencha.FactoryProxy", bindings)
 *    );
 *
 */
Ext.define("coon.core.ioc.sencha.FactoryProxy", {

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
     * Apply handler for proxying calls to Ext.Factory["proxy", "store", "controller", ...]
     * factory methods are usually invoked with aliases instead of class names which are
     * then resolved by Ext JS' underlying class system. The handler will utilize this
     * functionality and assume the alias is available with the key "type" in argumentsList[0],
     * inspect the "requireProperty" available with the resolved class and then
     * resolve dependencies with the help of resolveDependencies(),
     * if the object found in argumentsList[0] does not already contain
     * configurations for these dependencies.
     * The target is the Factory this handler operates on. The "aliasPrefix" of this argument
     * will be used to determine the prefix used in conjunction with the "type" to resolve
     * the proper class.
     *
     * @example
     *   // acme.Request.require = {requestor: "acme.RequestConfigurator"}
     *   // alias: "acme-request"
     *   proxy.apply({}, {}, [{type: "acme-request"}, {}];
     *   // config has no "requestor" configured with arguments, will resolve
     *   // dependencies using available bindings by calling resolveDependencies()
     *
     *   proxy.apply({}, {}, [{type: "acme-request"}, {requestor: {}];
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

        let cfg = argumentsList[0] || {};

        // cfg : "alias", {type: "alias"}
        const type = cfg.type ? cfg.type : (l8.isString(cfg) ? cfg : undefined);

        if (type && target.instance?.aliasPrefix) {
            const
                cls = Ext.ClassManager.getByAlias(`${target.instance.aliasPrefix}${type}`),
                requireCfg = cls?.[me.requireProperty];

            if (requireCfg) {
                cfg = Object.assign(
                    cfg,
                    me.resolveDependencies(Ext.ClassManager.getName(cls), requireCfg)
                );
                cfg.type = cfg.type || type;
                argumentsList[0] = cfg;
            }
        }

        return Reflect.apply(target, thisArg, argumentsList);
    },


    /**
     * Will proxy the property with *this* as the handler if the property
     * represents a method.
     *
     * @param target
     * @param prop
     * @param receiver
     * @returns {any}
     */
    get (target, prop, receiver) {

        if (l8.isFunction(target[prop])) {
            return new Proxy(target[prop], this.handler());
        }

        return Reflect.get(...arguments);
    },


    /**
     * @private
     */
    handler () {
        return this;
    }
});
