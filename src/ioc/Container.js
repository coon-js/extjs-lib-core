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
 * ioc.Container.
 * Can be used to create bindings to dependencies that get injected during runtime.
 * The Container uses Proxies which operate with meta information describing requirements.
 * This meta information marks a class "injectable" for the coon.core.ioc-Package.
 * If requirements are not matched to a given point in time (e.g., when instantiating
 * a class), the Container will try to resolve these requirements and inject them before they
 * are required by the concrete instances of the target classes.
 *
 * The bindings used with this Container are passed as references to associated classes.
 *
 * @see coon.core.ioc.sencha.SenchaProxy
 */
Ext.define("coon.core.ioc.Container", {

    singleton: true,

    requires: [
        // @define l8
        "l8",
        "coon.core.ioc.sencha.SenchaProxy"
    ],

    /**
     * @type {coon.core.ioc.Bindings} bindings
     * @private
     */

    /**
     * @type {coon.core.ioc.sencha.SenchaProxy} proxy
     * @returns {*}
     */


    /**
     * Returns the bindings used with this container.
     * Will create new bindings if none exist yet.
     *
     * @returns {coon.core.ioc.Bindings}
     */
    getBindings () {
        const me = this;

        if (!me.bindings) {
            me.bindings = Ext.create("coon.core.ioc.Bindings", {});
        }

        return me.bindings;
    },


    /**
     * Binds the data object by creating coon.core.ioc.Binding instances for it.
     * If no SenchaProxy is available with this Container, it will be created
     * with these bindings.
     * Changes made to bindings are reflected in all associated classes using the
     * bindings, i.e. if bindings already exist, the new data will be merged with the
     * existing bindings.
     *
     * @param {Object} data
     *
     * @see coon.core.ioc.Bindings.merge()
     *
     * @throws if data is not an object
     */
    bind (data) {

        if (!l8.isObject(data)) {
            throw new Error("\"data\" must be an object describing the bindings for the container");
        }

        const me = this;

        me.getBindings().merge(data);

        if (!me.proxy) {
            me.proxy = Ext.create("coon.core.ioc.sencha.SenchaProxy",  me.bindings);
        }

    }

});
