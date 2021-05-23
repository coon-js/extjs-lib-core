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

describe("coon.core.data.request.file.XmlHttpRequestFileLoaderTest", function (t) {


    const
        TIMEOUT = 250;

    let loader;

    t.beforeEach(function () {

        loader = Ext.create("coon.core.data.request.file.XmlHttpRequestFileLoader");


    });

    t.afterEach(function () {

        loader.destroy();
        loader = null;

    });

    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------

    t.it("defaults", (t) => {

        t.isInstanceOf(loader, "coon.core.data.request.file.FileLoader");

    });


    t.it("load() - 404 (thenable)", (t) => {

        let exc, CALLED;

        loader.load("someurl")
            .then((json) => CALLED = true, (e) => {exc = e;});

        t.waitForMs(TIMEOUT, () => {
            t.expect(CALLED).toBeUndefined();
            t.isInstanceOf(exc, "coon.core.data.request.HttpRequestException");
            t.expect(exc.getMessage()).toContain("404");
        });

    });


    t.it("load() - 404 (async/await)", async (t) => {

        let exc;

        try {
            await loader.load("someurl");
        } catch (e) {
            exc = e;
        }

        t.isInstanceOf(exc, "coon.core.data.request.HttpRequestException");
        t.expect(exc.getMessage()).toContain("404");
    });


    t.it("load() - success (thenable)", (t) => {

        let exc, responseText;

        loader.load("./fixtures/coon-js/mockdomain.conf.json")
            .then((txt) => responseText = txt, (e) => exc = true);

        t.waitForMs(TIMEOUT, () => {

            t.expect(exc).toBeUndefined();
            t.expect(typeof responseText).toBe("string");
            t.expect(JSON.parse(responseText)).toEqual({
                "config" : {
                    "foo" : "bar"
                }
            });
        });

    });


    t.it("load() - success (await async)", async (t) => {

        let responseText;

        responseText = await loader.load("./fixtures/coon-js/mockdomain.conf.json");

        t.expect(typeof responseText).toBe("string");
        t.expect(JSON.parse(responseText)).toEqual({
            "config" : {
                "foo" : "bar"
            }
        });
    });
    
});
