/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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
 * Configured with an instance of {coon.core.env.VendorBase}, this class
 * provides access to the environment information as provided by the VendorBase-API.
 *
 * @example
 * // return values depending on the implementation of the configured VendorBase and
 * // its implementation.
 * // Following examples assume an ExtJS-vendor is configured:
 * // Ext // namespace
 * // Ext.manifest = {"name" : "myapp", "coon-js" : {"env" : "development"}, "packages" : {"mypackage" : {}}}
 * let vendor = Ext.create("coon.core.env.ext.VendorBase");
 * coon.core.Environment.setVendor(vendor);
 * coon.core.Environment.getName(); // "myapp"
 * coon.core.Environment.get("base"); // Ext.base
 * coon.core.Environment.getEnvironment(); // Ext
 * coon.core.Environment.getPackage("mypackage"); // Ext.manifest.packages.mypackage
 * coon.core.Environment.getPackages(); // Ext.manifest.packages
 * coon.core.Environment.getManifest(); // Ext.manifest
 * coon.core.Environment.getManifest("coon-js.env"); // "development"
 *
 * // Ext.getResourcePath("KEY") -> "../build/development/resources/KEY"
 * coon.core.Environment.getPathForResource("KEY"); // "../build/development/resources/KEY"
 *
 */
Ext.define("coon.core.Environment", {

    singleton: true,

    requires: [
        "coon.core.env.VendorBase",
        "coon.core.exception.IllegalArgumentException",
        "coon.core.exception.UnsupportedOperationException",
        "coon.core.exception.MissingPropertyException"
    ],

    config: {
        /**
         * @type {coon.core.env.VendorBase}
         */
        vendorBase: undefined
    },


    /**
     * Applies the VendorBase to this environment.
     *
     * @param {coon.core.env.VendorBase} vendorBase
     *
     * @return {coon.core.env.VendorBase}
     *
     * @throws {coon.core.UnsupportedOperationException} if the VendorBase was already
     * configured, or {coon.core.IllegalArgumentException} if the VendorBase is not
     * an instance of {coon.core.env.VendorBase}
     */
    applyVendorBase (vendorBase) {

        const me = this;

        if (me.getVendorBase() !== undefined) {
            throw new coon.core.UnsupportedOperationException("The \"VendorBase\" has already been configured");
        }

        if (!(vendorBase instanceof coon.core.env.VendorBase)) {
            throw new coon.core.IllegalArgumentException("\"vendorBase\" must be an instance of coon.core.env.VendorBase");
        }

        return vendorBase;
    },


    /**
     * Returns the value for the key/path specified in the Environment.
     *
     * @param {String} key
     *
     * @returns {Mixed} Either the value or undefined if the value is not defined or
     * the environment is not available
     */
    get (key) {
        return this.delegate("get", arguments);
    },


    /**
     * Returns a resource path for the given key. Will prepend any path-segment
     * defined by the used vendor environment to the passed argument.
     * If the related package is specified, the package's name will be considered
     * when computing the resource path.
     *
     * @param {String} path
     * @param {String} pckg optional name of the package the resource belongs to
     *
     * @return {String}
     */
    getPathForResource (path, pckg) {
        return this.delegate("getPathForResource", arguments);
    },


    /**
     * Returns all environment information as specified by the used vendor.
     *
     * @return  {Object}
     */
    getEnvironment () {
        return this.delegate("getEnvironment", arguments);
    },


    /**
     * Returns all manifest information available.
     * If a key is specified, only the value for the key from the manifest will be returned, if available.
     *
     * @return  {Mixed}
     */
    getManifest (key) {
        return this.delegate("getManifest", arguments);
    },


    /**
     * Returns the package information for the specified package-name
     *
     * @param {String} packageName
     *
     * @return {Object}
     */
    getPackage (packageName) {
        return this.delegate("getPackage", arguments);
    },


    /**
     * Returns all package informations available in the current environment.
     *
     * @return {Object} keyed with the package names available, their values providing
     * further information.
     */
    getPackages () {
        return this.delegate("getPackages", arguments);
    },


    /**
     * Attempts to load the package with the specified name into the current
     * environment.
     *
     * @param {String} packageName
     *
     * @returns {Promise<Mixed>}
     */
    async loadPackage (packageName) {

        const
            me = this,
            vendorBase = me.getVendorBase();

        if (!vendorBase) {
            throw new coon.core.MissingPropertyException("no VendorBase configured for the Environment");
        }

        return await vendorBase.loadPackage(packageName);
    },

    privates: {

        /**
         * Delegates to the method from the VendorBase and returns its value.
         *
         * @param {String} fnName
         * @param {Object} arguments The arguments passed to this method from the source calls
         *
         * @return {Mixed}
         *
         * @private
         *
         * @throws {coon.core.MissingPropertyException} if no VendorBase is available.
         */
        delegate (fnName, args) {
            const
                me = this,
                vendorBase = me.getVendorBase();

            if (!vendorBase) {
                throw new coon.core.MissingPropertyException("no VendorBase configured for the Environment");
            }

            return vendorBase[fnName].apply(vendorBase, args);
        }

    }

});

