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
 * Aggregate containing various Proxies that help with resolving dependencies and
 * injecting dependencies given the injectors this class is configured with.
 *
 * @private
 */
Ext.define("coon.core.ioc.sencha.SenchaProxy", {


    requires: [
        // @define "l8"
        "l8",
        "Ext.Factory",
        "coon.core.ioc.sencha.resolver.FactoryHandler",
        "coon.core.ioc.sencha.resolver.CreateHandler",
        "coon.core.ioc.sencha.resolver.DependencyResolver",
        "coon.core.ioc.sencha.ConstructorInjector"
    ],

    /**
     * @type {coon.core.ioc.sencha.resolver.FactoryHandler} factoryHandler
     * @private
     */

    /**
     * @type {coon.core.ioc.sencha.resolver.CreateHandler} createHandler
     * @private
     */

    /**
     * @type {coon.core.ioc.sencha.ConstructorInjector} constructorInjector
     * @private
     */


    /**
     * @type {Boolean} booted
     * @private
     */


    /**
     * Constructor.
     *
     * @param {coon.core.ioc.Bindings} bindings
     *
     * @see boot()
     *
     * @throws if bindings is not an instance of coon.core.ioc.Bindings
     */
    constructor (bindings) {
        const me = this;

        if (!(bindings instanceof coon.core.ioc.Bindings)) {
            throw new Error("\"bindings\" must be an instance of coon.core.ioc.Bindings");
        }


        me.boot(bindings);
    },


    /**
     * Callback for the "classresolved" event of the resolvers used with this Proxy.
     * Will delegate to the injectors and register handlers for the target class, if
     * applicable.
     *
     * @param {coon.core.ioc.sencha.resolver.ClassResolver} resolver
     * @param {String} className
     * @param {Ext.Base} cls
     */
    onClassResolved (resolver, className, cls) {
        const
            me = this,
            injector = me.constructorInjector;

        if (injector.shouldApplyHandler(cls)) {
            injector.registerHandler(cls);
        }
    },


    /**
     * @private
     */
    boot (bindings) {
        const me = this;


        if (!me.booted) {
            me.installProxies();
            me.installInjectors(bindings);
            me.registerObservers();
            me.booted = true;
        }

        return me.booted;
    },


    /**
     *  @private
     */
    installProxies () {
        const me = this;

        Ext.Factory = new Proxy(Ext.Factory, me.getFactoryHandler());
        Ext.create = new Proxy(Ext.create, me.getCreateHandler());
    },


    /**
     * @param {coon.core.ioc.Bindings} bindings
     * @private
     */
    installInjectors (bindings) {
        const me = this;

        me.constructorInjector = Ext.create("coon.core.ioc.sencha.ConstructorInjector",
            Ext.create("coon.core.ioc.sencha.resolver.DependencyResolver", bindings)
        );
    },


    /**
     * @return {coon.core.ioc.sencha.resolver.FactoryHandler}
     * @private
     */
    getFactoryHandler () {
        const me = this;

        if (!me.factoryHandler) {
            me.factoryHandler = Ext.create("coon.core.ioc.sencha.resolver.FactoryHandler");
        }
        return me.factoryHandler;
    },


    /**
     * @return {coon.core.ioc.sencha.resolver.CreateHandler}
     * @private
     */
    getCreateHandler () {
        const me = this;

        if (!me.createHandler) {
            me.createHandler = Ext.create("coon.core.ioc.sencha.resolver.CreateHandler");
        }
        return me.createHandler;
    },


    /**
     * @private
     */
    registerObservers () {
        const me = this;

        me.getCreateHandler().on("classresolved", me.onClassResolved, me);
        me.getFactoryHandler().on("classresolved", me.onClassResolved, me);
    }

});
