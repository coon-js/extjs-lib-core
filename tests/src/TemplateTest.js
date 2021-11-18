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

StartTest(t => {
    "use strict";


    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------

    t.requireOk("coon.core.Template", () => {

        t.it("functionality", async t => {

            const LOAD_RETURN_MOCK = "text";

            t.expect(coon.core.Template.templateClass).toBe(l8.template.esix.StringTemplate);

            const loadSpy = t.spyOn(coon.core.FileLoader, "load").and.callFake(() => LOAD_RETURN_MOCK);

            t.expect(coon.core.Template.cache).toBeUndefined();

            // writes per default into cache
            let res = await coon.core.Template.load("someurl");
            t.isInstanceOf(res, coon.core.Template.templateClass);
            t.expect(res.tpl).toBe(loadSpy.calls.mostRecent().returnValue);

            // write into cache
            t.expect(coon.core.Template.cache["someurl"]).toBe(res);

            let res2nd = await coon.core.Template.load("someurl");
            t.expect(res2nd).toBe(res);
            t.expect(loadSpy).toHaveBeenCalled(1);
            let res3rd = await coon.core.Template.load("someurl", false);
            t.expect(res2nd).not.toBe(res3rd);

            t.expect(loadSpy).toHaveBeenCalled(2);

            loadSpy.remove();

        });
    });
});
