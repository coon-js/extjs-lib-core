/**
 * coon.js
 * lib-cn_core
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/coon-js/lib-cn_core
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
 * Concrete implementation of a VendorBase in an ExtJS environment.
 *
 * @example
 * // Ext.manifest = {"coon-js" : {"env" : "development"}, "packages" : {"mypackage" : {}}}
 * let vendor = Ext.create("coon.core.env.ext.VendorBase");
 * vendor.get("coon-js.env");
 *
 * vendor.getEnvironment(); // Ext.manifest
 *
 * vendor.getPackage("mypackage"); // Ext.manifest.packages.mypackage
 *
 * // Ext.getResourcePath("KEY") -> "../build/development/resources/KEY"
 * vendor.getPathForResource("KEY"); // "../build/development/resources/KEY"
 *
 */
Ext.define("coon.core.env.ext.VendorBase", {

    extend : "coon.core.env.VendorBase",

    requires : [
        "coon.core.Util",
        "Ext.Package"
    ],


    /**
     * @inheritdoc
     */
    get (key) {
        return coon.core.Util.unchain(key, this.getEnvironment());
    },


    /**
     * @inheritdoc
     */
    getPathForResource (path) {
        return Ext.getResourcePath(path, null, "");
    },


    /**
     * @inheritdoc
     */
    getEnvironment () {
        return Ext;
    },


    /**
     * @inheritdoc
     */
    getManifest (key) {
        return key ? coon.core.Util.unchain(key, Ext.manifest) : Ext.manifest;
    },


    /**
     * @inheritdoc
     */
    getPackage (packageName) {
        return coon.core.Util.unchain("packages." + packageName, this.getManifest());
    },


    /**
     * @inheritdoc
     */
    getPackages () {
        return coon.core.Util.unchain("packages", this.getManifest());
    },


    /**
     *  @inheritdoc
     */
    async loadPackage (packageName) {
        return Ext.Package.load(packageName);
    }

});

