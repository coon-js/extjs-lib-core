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

StartTest((t) => {
    "use strict";


    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------

    t.requireOk("coon.core.FileLoader", () => {

        t.it("functionality", async (t) => {

            t.isInstanceOf(coon.core.FileLoader, "coon.core.data.request.file.FileLoader");

            t.isInstanceOf(coon.core.FileLoader.fileLoader, "l8.request.FileLoader");

            const
                RETURNMOCK = {},
                url = "./fixtures/coon-js/mockdomain.conf.json",
                spy = t.spyOn(coon.core.FileLoader.fileLoader, "load").and.callFake(async () => {return RETURNMOCK;}),
                res = await coon.core.FileLoader.load(url);

            t.expect(spy.calls.mostRecent().args[0]).toBe(url);

            t.expect(res).toBe(RETURNMOCK);

            spy.remove();
           
        });
    });
});