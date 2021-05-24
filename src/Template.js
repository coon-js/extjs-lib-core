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
 * Template Engine singleton. Provides convenient access to template methods and allows
 * for loading templates from files.
 * Uses {coon.core.template.javaScript.Template} for template processing.
 *
 * @example
 *  let tpl = await coon.core.Template.load("index.html.tpl");
 *  tpl.render({some : {arbitrary : {"data"}}});
 *
 *
 *
 * @singleton
 */
Ext.define("coon.core.Template", {

    singleton : true,

    requires : [
        "coon.core.Util",
        "coon.core.FileLoader",
        "coon.core.template.TemplateException",
        "coon.core.template.javaScript.StringTemplate"
    ],

    /**
     * @var {String} templateClass
     * @private
     */

    /**
     * Caches loaded template files with their associated template class.
     * @var {Object} cache
     * @private
     */

    /**
     * Constructor.
     *
     * @private
     */
    constructor () {
        "use strict";
        const me = this;

        me.templateClass = coon.core.Util.unchain("coon.core.template.javaScript.StringTemplate");
    },


    /**
     * Returns the template representation of the contents found in the file at
     * the specified url.
     *
     * @param {String} url The url to the template that should be loaded.
     * @param {Boolean=true} cache True to cache the resulting load operation and to prevent further
     * loading of the same file
     *
     * @return {Promise.<coon.core.template.javaScript.Template>}
     *
     * @throws {coon.core.template.TemplateException} if any exception occurs
     */
    async load (url, cache) {
        "use strict";

        const
            me = this;

        cache = cache !== false;

        me.cache = me.cache || {};

        let txt, inst;

        if (cache && me.cache[url]) {
            return me.cache[url];
        }

        try {
            txt = await coon.core.FileLoader.load(url);
            inst = new me.templateClass(txt);
            if (cache) {
                me.cache[url] = inst;
            }
            return inst;
        } catch (e) {
            throw new coon.core.template.TemplateException(
                `An error occured while trying to load the template from ${url}`, e
            );
        }
    }

});