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

describe("coon.core.template.javaScript.TplTest", (t) => {
    "use strict";

    let inst ;

    const
        PARENT_CLASS = "coon.core.template.CompiledTpl",
        CLASS_NAME = "coon.core.template.javaScript.Tpl",
        tpl = "This is a ${templated} string ${that.support} JavaScript TemplateStrings",
        data = {templated : "rendered", that : {support : "that supports"}},
        rendered = "This is a rendered string that supports JavaScript TemplateStrings",
        createTplInternal = () => {

            return new Function("{templated, that}", "return `" + tpl + "`" );

        };

    t.beforeEach(() => {

        inst = Ext.create(CLASS_NAME, createTplInternal());

    });


    t.afterEach(() => {
        inst.destroy();
        inst = null;
    });


    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------

    t.it("functionality", (t) => {
        t.isInstanceOf(inst, PARENT_CLASS);
    });

    t.it("constructor exception", (t) => {
        let exc;
        try {
            new coon.core.template.javaScript.Tpl({});
        } catch (e) {
            exc = e;
        }

        t.isInstanceOf(exc, "coon.core.exception.IllegalArgumentException");
    });


    t.it("render()", (t) => {

        t.expect(inst.render(data)).toBe(rendered);

    });


    t.it("render() - exception", (t) => {
        let exc;
        try {
            inst.render();
        } catch (e) {
            exc = e;
        }

        t.isInstanceOf(exc, "coon.core.template.RenderException");

    });


});
