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
 * Base class for vendor environments.
 */
Ext.define("coon.core.env.VendorBase", {

    /**
     * Returns a resource path for the given key. Will prepend any path-segment
     * defined by the used vendor environment to the passed argument.
     *
     * @param {String} path
     *
     * @return {String}
     */
    getPathForResource : Ext.emptyFn,


    /**
     * Returns the value for the key/path specified in Ext.manifest.
     *
     * @param {String} key
     *
     * @returns {Mixed} Either the value or undefined if the value is not defined or
     * the environment is not available
     */
    get : Ext.emptyFn,


    /**
     * Returns all environment information as specified by the used vendor.
     *
     * @return  {Object}
     */
    getEnvironment : Ext.emptyFn,


    /**
     * Returns the package information for the specified package-name
     *
     * @param {String} packageName
     *
     * @return {Object}
     */
    getPackage : Ext.emptyFn

});

