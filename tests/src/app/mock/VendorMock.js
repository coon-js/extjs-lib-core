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
 * Mock class for vendor environments.
 */
Ext.define("coon.test.app.mock.VendorMock", {

    extend : "coon.core.env.VendorBase",

    requires : [
        "coon.core.Util"
    ],

    /**
     * @var mockedEnvironment
     * @type {Object}
     * @private
     */

    constructor (cfg) {
        this.mockedEnvironment = cfg;
    },

    getPathForResource : (resource) => {
        return `fixtures/${resource}`;
    },

    get (key) {
        return coon.core.Util.unchain(key, this.mockedEnvironment);
    },

    getManifest (key) {
        return key ? coon.core.Util.unchain(key, this.mockedEnvironment.manifest) : this.mockedEnvironment.manifest;
    },

    getEnvironment () {
        return this.mockedEnvironment || {};
    },

    getPackage (pack) {
        return coon.core.Util.unchain(pack, this.mockedEnvironment.manifest.packages);
    },

    getPackages () {
        return this.mockedEnvironment.manifest.packages;
    }

});

