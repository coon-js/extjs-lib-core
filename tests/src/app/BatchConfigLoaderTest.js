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

describe("coon.core.app.BatchConfigLoaderTest", (t) => {


    let batchLoader;

    t.beforeEach(function () {

        batchLoader = Ext.create("coon.core.app.BatchConfigLoader", Ext.create("coon.test.app.mock.MockConfigLoader"));

    });


    t.afterEach(function () {

        coon.core.ConfigManager.configs = {};
        batchLoader.destroy();
        batchLoader = null;

    });

    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------

    t.it("defaults", (t) => {

        let exc;
        try {
            Ext.create("coon.core.app.BatchConfigLoader");
        } catch (e) {
            exc = e;
        }
        t.isInstanceOf(exc, "coon.core.exception.IllegalArgumentException");

        t.isInstanceOf(batchLoader, "coon.core.app.BatchConfigLoader");
        t.isInstanceOf(batchLoader.configLoader, "coon.test.app.mock.MockConfigLoader");

        t.expect(batchLoader.domains).toBeUndefined();

    });


    t.it("addDomain()", (t) => {

        t.expect(batchLoader.domains).toBeUndefined();

        t.expect(batchLoader.addDomain("foo", {foo: "bar"})).toBe(true);
        t.expect(batchLoader.addDomain("foo", {some: "other"})).toBe(false);

        t.expect(batchLoader.addDomain("bar", {bar: "foo"})).toBe(true);

        t.expect(batchLoader.domains).toEqual({
            foo: {foo: "bar"},
            bar: {bar: "foo"}
        });
    });


    t.it("loadDomain()", async (t) => {

        let exception, res, expectedResult;

        let reset = () => {
            res = undefined;
            expectedResult = undefined;
            exception = undefined;
        };

        // +-------------------------------------
        // | ParseException
        // +-------------------------------------
        try {
            res = await batchLoader.loadDomain("ParseException", {test: "foobar"});
        } catch (e) {
            exception = e;
        }
        t.expect(res).toBeUndefined();
        t.isInstanceOf(exception, "coon.core.app.ConfigurationException");
        t.isInstanceOf(exception.getCause(), "coon.core.exception.ParseException");
        reset();

        // +-------------------------------------
        // | Ok
        // +-------------------------------------
        expectedResult = {test: "foobar"};
        res = await batchLoader.loadDomain("foo", expectedResult);
        t.expect(res).toEqual({domain: "foo"});
        reset();

        // +-------------------------------------
        // | HttpRequestException
        // +-------------------------------------
        expectedResult = {weshould: "havethisavilable"};
        res = await batchLoader.loadDomain("HttpRequestException", expectedResult);
        t.expect(coon.core.ConfigManager.get("HttpRequestException")).toEqual(expectedResult);
        t.expect(res).toEqual(expectedResult);
        reset();

    });


    t.it("load()", async (t) => {

        let spy, batchResult;

        const tests = [[
            "ParseException", {test: "foobar"}
        ], [
            "foo", {test: "foobar"}
        ], [
            "HttpRequestException", {used: "default"}
        ]];

        tests.forEach((test) => {
            batchLoader.addDomain(test[0], test[1]);
        });

        spy = t.spyOn(batchLoader, "loadDomain").and.callThrough();

        batchResult = await batchLoader.load();

        tests.forEach((test, index) => {
            // pretest the order so we can safely check for deeply for the 2nd argument
            t.expect(spy.calls.all()[index].args[0]).toBe(test[0]);
            t.expect(spy.calls.all()[index].args[1]).toEqual(test[1]);
            t.expect(spy).toHaveBeenCalledWith(test[0], t.any());
        });

        t.isInstanceOf(batchResult.ParseException, "coon.core.app.ConfigurationException");
        t.expect(batchResult.foo).toEqual({domain: "foo"});
        t.expect(batchResult.HttpRequestException).toEqual({used: "default"});
    });


});
