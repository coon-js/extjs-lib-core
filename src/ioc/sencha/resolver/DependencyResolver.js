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
 * DependencyResolver.
 */
Ext.define("coon.core.ioc.sencha.resolver.DependencyResolver", {

    requires: [
        // @define "l8"
        "l8",
        "coon.core.ioc.Bindings"
    ],

    /**
     * Keeps track of already processed classes.
     * @type {Array} processed
     * @private
     */


    /**
     * @type {coon.core.ioc.Bindings} bindings
     * @private
     */


    /**
     * Constructor.
     *
     * @param {coon.core.ioc.Bindings} bindings
     *
     * @throws if bindings is not an instance of coon.core.ioc.Bindings
     */
    constructor (bindings) {
        if (!(bindings instanceof coon.core.ioc.Bindings)) {
            throw new Error("\"bindings\" must be an instance of coon.core.ioc.Bindings");
        }
        this.bindings = bindings;
    },


    /**
     * Tries to find a binding configuration for "targetClass" by matching it against
     * a list of available namespaces. If an entry is found, the entry must be configured
     * as {[requiredType]: [specific]}. If such an entry exists, "specific" will be
     * returned. If no entry is found, "requiredType" is returned.
     *
     * @example
     *
     *    // available bindings
     *    //  {
     *    //   "com.acme.data": {
     *    //       "org.project.impl.IClass": "org.project.impl.Specific"
     *    // }
     *    proxy.resolveToSpecific("com.acme.data.message.Editor", "org.project.impl.IClass");
     *    // returns "org.project.impl.IClass"
     *
     * @param {String} targetClass
     * @param requiredType
     *
     * @returns {String}
     *
     * @private
     */
    resolveToSpecific (targetClass, requiredType) {

        const
            me = this,
            targets = Object.entries(me.bindings.getData());

        let cfg = targets.filter(([target]) => target.toLowerCase() === targetClass.toLowerCase());

        if (!cfg.length) {
            cfg = targets.filter(([target]) => targetClass.toLowerCase().indexOf(target.toLowerCase()) === 0);
            if (!cfg.length) {
                return requiredType;
            }
        }

        const availableClasses = Object.entries(cfg[0][1]);
        let specific;

        availableClasses.some(([cfgClassName, specInst]) => {

            if (cfgClassName.toLowerCase() === requiredType.toLowerCase()) {
                specific = specInst;
                return true;
            }

        });

        return specific || requiredType;
    },


    /**
     * Will resolve dependencies available with "requires" for "targetClass".
     * "requires" must be an object where the keys are property-names defined by "targetClass", and the values
     * are type hints in form of class names.
     *
     *  @example
     *      // "com.acme.BaseProxy" has a dependency to "coon.core.data.request.Configurator",
     *      // with its "requestConfigurator" property
     *      // const requires = {"requestConfigurator": "coon.core.data.request.Configurator"};
     *      const resolved = resolveDependencies("com.acme.BaseProxy", requires);
     *      // resolveDependencies will delegate to "resolveToSpecific()" to see if a more specific type was bound
     *      // to com.acme.BaseProxy`s "requestConfigurator" property, otherwise, it will return an instance of
     *      // "coon.core.data.request.Configurator"
     *      console.log(resolved); // {"requestConfigurator": INSTANCE_OF[coon.core.data.request.Configurator]}
     *
     * @param {String} targetClass The class name for which the dependencies get resolved
     * @param {Object} requires Definitions of the dependencies required by forClass.
     *
     * @returns {{}}
     *
     * @see  resolveToSpecific
     *
     * @throws if a resolved class name cannot be instantiated
     */
    resolveDependencies ( targetClass, requires) {

        const
            me = this,
            dependencies = Object.entries(requires),
            deps = {},
            scope = me.getScope();

        dependencies.forEach(([prop, requiredType]) => {
            if (!deps[prop]) {
                const specific = me.resolveToSpecific(targetClass, requiredType);

                if (!l8.unchain(specific, scope)) {
                    throw new Error(`${specific} bound to ${targetClass}.${prop}, but was not found in the scope available`);
                }

                deps[prop] = Ext.create(specific);
            }
        });

        return deps;
    },


    /**
     * Scope where the defined classes should be defined.
     * Defaults to the "window"-object.
     * @private
     */
    getScope () {
        return window;
    }

});
