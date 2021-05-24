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

describe("coon.core.template.javaScript.StringTemplateTest", (t) => {
    "use strict";

    let inst ;

    const
        PARENT_CLASS = "coon.core.template.Template",
        CLASS_NAME = "coon.core.template.javaScript.StringTemplate",
        tpl = "This is a ${templated} string ${that.support} JavaScript TemplateStrings",
        data = {templated : "rendered", that : {support : "that supports"}},
        dataAlt = {templated : "rendered Alt", that : {support : "that supports Alt"}},
        dataAdd = {templatedAdd : "rendered", that : {support : "that supports"}};

    t.beforeEach(() => {

        inst = Ext.create(CLASS_NAME, tpl);

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

        t.isInstanceOf(inst.compiler, "coon.core.template.javaScript.StringCompiler");
        t.expect(inst.tpl).toBe(tpl);
        t.expect(inst.compiledTpl).toBeUndefined();

    });

    t.it("render()", (t) => {

        const
            MOCKED_RESULT = "some text",
            RENDER_MOCK = {render :  () => MOCKED_RESULT},
            cacheKey = Object.keys(data).join("."),
            spies = {
                compilerSpy : t.spyOn(inst.compiler, "compile").and.callFake(() => RENDER_MOCK),
                renderMockSpy : t.spyOn(RENDER_MOCK, "render")
            },
            {compilerSpy, renderMockSpy} = spies;

        const res = inst.render(data);
        t.expect(res).toBe(MOCKED_RESULT);

        // StringCompiler.compile
        t.expect(compilerSpy.calls.mostRecent().args[0]).toBe(inst.tpl);
        t.expect(compilerSpy.calls.mostRecent().args[1]).toEqual(Object.keys(data));

        // Tpl - render
        t.expect(compilerSpy.calls.mostRecent().returnValue).toBe(RENDER_MOCK);
        t.expect(renderMockSpy).toHaveBeenCalledWith(data);

        // cache
        t.expect(inst.compiledTpls[cacheKey]).toBe(compilerSpy.calls.mostRecent().returnValue);
        t.expect(compilerSpy).toHaveBeenCalled(1);

        // add cache key
        inst.render(dataAdd);
        t.expect(inst.compiledTpls[Object.keys(dataAdd).join(".")]).toBe(compilerSpy.calls.mostRecent().returnValue);
        t.expect(compilerSpy).toHaveBeenCalled(2);
        inst.render(dataAdd);
        t.expect(compilerSpy).toHaveBeenCalled(2);

        const resAlt = inst.render(dataAlt);
        t.expect(renderMockSpy).toHaveBeenCalledWith(dataAlt);
        t.expect(resAlt).toBe(MOCKED_RESULT);

        Object.values(spies).forEach(spy => spy.remove());
    });


    t.it("render() - exception", (t) => {

        const CAUSE_MOCK = "ERROR";

        let exc;

        let spy = t.spyOn(inst.compiler, "compile").and.throwError(CAUSE_MOCK);

        try {
            inst.render(data);
        } catch (e) {
            exc = e;
        }

        t.isInstanceOf(exc, "coon.core.template.TemplateException");
        t.expect(exc.getCause().message).toBe(CAUSE_MOCK);

        spy.remove();
    });


});
