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

describe("coon.core.app.ConfigLoaderTest", function (t) {

    t.requireOk("coon.core.Environment", function () {

        const
            DOMAIN = "mymockdomain",
            RESOURCE_PATH = "./fixtures/";

        let loader;

        t.beforeEach(function () {

            loader = Ext.create("coon.core.app.ConfigLoader", Ext.create("coon.core.data.request.file.FileLoader"));

            let vendorBase = Ext.create("coon.core.env.VendorBase");
            vendorBase.getPathForResource = (resource) => RESOURCE_PATH + "/" + resource;
            vendorBase.getManifest = (key) => {if (key === "coon-js.resources") {return "coon-js";}};
            coon.core.Environment.setVendorBase(vendorBase);
        });


        t.afterEach(function () {

            loader.destroy();
            loader = null;

            coon.core.ConfigManager.configs = {};
            coon.core.Environment._vendorBase = undefined;

        });

        // +----------------------------------------------------------------------------
        // |                    =~. Tests .~=
        // +----------------------------------------------------------------------------

        t.it("defaults", (t) => {

            t.isInstanceOf(loader, "coon.core.app.ConfigLoader");
            t.isInstanceOf(loader.fileLoader, "coon.core.data.request.file.FileLoader");

            let exc;

            try {
                Ext.create("coon.core.app.ConfigLoader");
            } catch (e) {
                exc = e;
            }

            t.isInstanceOf(exc, "coon.core.exception.IllegalArgumentException");

        });


        t.it("getFileNameForDomain", (t) => {
            t.expect(loader.getFileNameForDomain("mymockdomain")).toBe("mymockdomain.conf.json");
        });


        t.it("getPathForDomain()", (t) => {

            let spy = t.spyOn(loader, "getFileNameForDomain");

            t.expect(loader.getPathForDomain(DOMAIN)).toBe(
                coon.core.Environment.getPathForResource(
                    coon.core.Environment.getManifest("coon-js.resources") + "/" + loader.getFileNameForDomain(DOMAIN)
                )
            );
            t.expect(spy.calls.mostRecent().args[0]).toBe(DOMAIN);
        });


        t.it("load() - falls back to getPathForDomain() if url not specified", async t => {

            let spy = t.spyOn(loader, "getPathForDomain");

            await loader.load("mockdomain");

            t.expect(spy).toHaveBeenCalledWith("mockdomain");
        });


        t.it("load() - does not call getPathForDomain() if url specified", async t => {

            let mockdomainPath = loader.getPathForDomain("mockdomain"),
                spy = t.spyOn(loader, "getPathForDomain");

            await loader.load("mockdomain", mockdomainPath);

            t.expect(spy).not.toHaveBeenCalled();
        });


        t.it("load() - 404", async (t) => {

            let exc;

            try {
                await loader.load("notexistingurl");
            } catch (e) {
                exc = e;
            }

            t.isInstanceOf(exc, "coon.core.app.ConfigurationException");
            t.expect(exc.getMessage()).toContain("404");
        });


        t.it("load() - invalid json", async (t) => {

            let exc;

            try {
                await loader.load("mockdomain_invalid");
            } catch (e) {
                exc = e;
            }

            t.isInstanceOf(exc.getCause(), "coon.core.exception.ParseException");
        });


        t.it("load() - valid json", async (t) => {

            const expected = {
                "config" : {
                    "foo" : "bar"
                }
            };

            t.expect(coon.core.ConfigManager.get("mockdomain")).toBeUndefined();


            let config = await loader.load("mockdomain");

            t.expect(config).toEqual(expected);
            t.expect(coon.core.ConfigManager.get("mockdomain")).toEqual(expected);


        });


        t.it("load() - valid json, path does not exist", async (t) => {

            const expected = {};

            t.expect(coon.core.ConfigManager.get("mockdomain")).toBeUndefined();

            let config = await loader.load("mockdomain", undefined, "foo");
            t.isDeeply(config, expected);
            t.isDeeply(coon.core.ConfigManager.get("mockdomain"), expected);
        });

        t.it("load() - valid json, path does exist", async (t) => {

            const expected = {
                //"config" : {
                "foo" : "bar"
                //}
            };

            t.expect(coon.core.ConfigManager.get("mockdomain")).toBeUndefined();

            let config = await loader.load("mockdomain", undefined, "config");
            t.isDeeply(config, expected);
            t.isDeeply(coon.core.ConfigManager.get("mockdomain"), expected);
        });

    });

});
