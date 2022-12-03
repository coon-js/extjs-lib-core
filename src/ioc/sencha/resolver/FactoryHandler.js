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
 * Resolves to the in-memory class definition the alias represents.
 */
Ext.define("coon.core.ioc.sencha.resolver.FactoryHandler", {

    extend: "coon.core.ioc.sencha.resolver.ClassResolver",

    requires: [
        // @define "l8"
        "l8"
    ],


    /**
     * Apply-handler for proxying calls to Ext.Factory["proxy", "store", "controller", ...]
     * Factory methods are usually invoked with aliases instead of class names which are
     * then resolved by Ext JS' underlying class system. The handler will utilize this
     * functionality and assume the alias is available with the key "type" in argumentsList[0],
     * resolve to the in-memory class definition and then fire the classresolved-event
     * on success, if the beforeclassresolved-event did not cancel the event.
     *
     * @param target
     * @param thisArg
     * @param argumentsList
     * @returns {*}
     */
    apply (target, thisArg, argumentsList) {

        const me = this;

        let cls, cfg = argumentsList[0] || {};

        // cfg : "alias", {type: "alias"}
        const  type = cfg.type ? cfg.type : (l8.isString(cfg) ? cfg : undefined);

        if (type && target.instance?.aliasPrefix) {
            cls = Ext.ClassManager.getByAlias(`${target.instance.aliasPrefix}${type}`);
        }

        if (cls) {
            const className = Ext.ClassManager.getName(cls);

            if (me.fireEvent("beforeclassresolved", me, className, cls) !== false) {
                me.fireEvent("classresolved", me, className, cls);
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
