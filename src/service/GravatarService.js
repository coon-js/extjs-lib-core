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
 * ImageService utilizing Gravatar-services.
 */
Ext.define("coon.core.service.GravatarService", {

    extend: "coon.core.service.UserImageService",

    requires: [
        // l8
        "l8"
    ],

    /**
     * Returns the src-URL or the base64-encoded data-string to be used with the src attribute of
     * an img-tag.
     * Format of the ident-parameter is arbitrary and should be defined by implementing APIs; it should, however,
     * represent the id of the user for which the image gets looked up.
     *
     * @param {*} ident
     * @param {Object} options Additional options to use in the request
     *
     */
    getImageSrc (ident, options) {
        return `https://www.gravatar.com/avatar/${l8.md5(ident)}?d=blank`;
    }

});