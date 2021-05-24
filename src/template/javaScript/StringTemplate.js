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
 * Template Class providing support for JavaScript strings.
 *
 */
Ext.define("coon.core.template.javaScript.StringTemplate", {

    extend : "coon.core.template.Template",

    requires : [
        "coon.core.Util",
        "coon.core.template.javaScript.StringCompiler",
        "coon.core.exception.IllegalArgumentException",
        "coon.core.template.TemplateException"
    ],

    /**
     * @var tpl
     * @type {String}
     * @private
     */

    /**
     * Maps pre-compiled templates with the keys of the data object passed to them to
     * cache compiling.
     * @var compiledTpls
     * @type {Array.<coon.core.template.javaScript.Tpl>}
     * @private
     */


    /**
     * @var compiler
     * @type {coon.core.template.javaScript.StringCompiler}
     * @private
     */


    /**
     * Constructor.
     *
     * @param {String} tpl The template string this template represents.
     *
     * @throws {coon.core.exception.IllegalArgumentException} if compiler is no
     * instance of {coon.core.template.Compiler}
     */
    constructor (tpl) {
        "use strict";
        const me = this;

        me.compiler = new coon.core.template.javaScript.StringCompiler();

        me.tpl = tpl;
    },


    /**
     * Renders this templates txt with the specified data.
     *
     * @param {Object} data
     *
     * @throws {coon.core.template.TemplateException} if any error occurs
     */
    render (data) {
        "use strict";
        const me = this;

        let keys   = Object.keys(data),
            cplKey = keys.join(".");

        me.compiledTpls = me.compiledTpls || {};

        if (!me.compiledTpls[cplKey]) {
            try {
                me.compiledTpls[cplKey] = me.compiler.compile(me.tpl, keys);
            } catch (e) {
                throw new coon.core.template.TemplateException("exception thrown during compiling the template", e);
            }
        }

        return me.compiledTpls[cplKey].render(data);
    }


});