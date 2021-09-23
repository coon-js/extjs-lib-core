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
 * Convenient singleton file loader interface.
 * Uses a coon.core.data.request.file.XmlHttpRequestFileLoader internally.
 *
 * @singleton
 */
Ext.define("coon.core.FileLoader", {

    extend: "coon.core.data.request.file.FileLoader",

    singleton: true,

    requires: [
        // @define l8.request.FileLoader
        "l8.request.FileLoader",
        "coon.core.data.request.file.XmlHttpRequestFileLoader"

    ],

    /**
     * The FileLoader used.
     * @var fileLoader
     * @type coon.core.data.request.file.XmlHttpRequestFileLoader
     * @private
     */


    /**
     * @constructor
     */
    constructor () {
        this.fileLoader = new l8.request.FileLoader();
    },


    /**
     * @inheritdoc
     */
    async load (url) {
        return await this.fileLoader.load(url);
    }

});
