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
 * ConstructorInjector.
 * Allows for registering a constructor()-Proxy-handler for target classes.
 *
 * @example
 *    if (injector.shouldRegisterHandler(targetCls)) {
 *        injector.registerHandler(cls);
 *    }
 *
 */
Ext.define("coon.core.ioc.sencha.ConstructorInjector", {

    requires: [
        // @define "l8"
        "l8",
        "coon.core.ioc.sencha.resolver.DependencyResolver"
    ],

    /**
     * Keeps track of already processed classes.
     * @type {Array} processed
     * @private
     */


    /**
     * @type {coon.core.ioc.sencha.resolver.DependencyResolver} dependencyResolver
     * @private
     */


    /**
     * meta property with a class that provides information about
     * dependencies. Defaults to "required".
     * @type {String} requireProperty
     * @private
     */
    requireProperty: "required",


    /**
     * Constructor.
     *
     * @param {coon.core.ioc.sencha.resolver.DependencyResolver} dependencyResolver
     *
     * @throws if dependencyResolver is not an instance of coon.core.ioc.sencha.resolver.DependencyResolver
     */
    constructor (dependencyResolver) {
        if (!(dependencyResolver instanceof coon.core.ioc.sencha.resolver.DependencyResolver)) {
            throw new Error("\"dependencyResolver\" must be an instance of coon.core.ioc.sencha.resolver.DependencyResolver");
        }
        this.dependencyResolver = dependencyResolver;
    },


    /**
     * Returns a constructor-Proxy-Handler constructor.
     * The returned handler will inject dependencies as object properties with arguments
     * to the constructor() of the target-class.
     * Dependencies are computed based on the meta-information exposed by the
     * target class.
     *
     * @returns {*}
     *
     * @see coon.core.ioc.sencha.resolver.DependencyResolver
     */
    handler () {
        const me = this;

        return {
            construct (target, argumentsList, newTarget) {

                let cls = target, cArgs, requireCfg;

                cArgs = argumentsList[0] || {};

                const skipProps = Object.keys(cArgs);

                requireCfg = cls[me.requireProperty];
                if (l8.isObject(requireCfg)) {
                    cArgs = Object.assign(
                        cArgs,
                        me.dependencyResolver.resolveDependencies(
                            Ext.ClassManager.getName(cls),
                            requireCfg,
                            skipProps
                        )
                    );

                    argumentsList[0] = cArgs;
                }

                return Reflect.construct(target, argumentsList, newTarget);
            }
        };
    },


    /**
     * Returns true if the target defines injectable dependencies and those can be injected
     * with the constructor, otherwise false.
     * Returns also false if the target class was already processed by this injector.
     *
     * @param {Ext.Base} cls
     *
     * @return {Boolean}
     *
     * @see handler()
     */
    shouldApplyHandler (cls) {
        const
            me = this,
            className = Ext.ClassManager.getName(cls);

        if (me.processed && me.processed.includes(className)) {
            return false;
        }

        let requireCfg = cls[me.requireProperty];

        if (l8.isObject(requireCfg)) {
            return true;
        }

        return false;
    },


    /**
     * Creates handlers for the target.
     * API should call isConstructorInjectable() first to check whether
     * this injector should handle the target class.
     * Returns the proxied instance.
     *
     * @param {Ext.Base} cls
     *
     * @return {Ext.Base}
     *
     * @protected
     */
    registerHandler (cls) {
        const
            me = this,
            className = Ext.ClassManager.getName(cls);

        cls = new Proxy(cls, me.handler());
        Ext.ClassManager.set(className, cls);

        if (!me.processed) {
            me.processed = [];
        }

        !me.processed.includes(className) && me.processed.push(className);

        return cls;
    }


});
