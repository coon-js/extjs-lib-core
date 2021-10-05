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

    t.requireOk("coon.core.env.VendorBase", "coon.core.FileLoader", "coon.core.Environment", () => {

        const
            DOMAIN = "mymockdomain",
            RESOURCE_PATH = "./fixtures/";

        let loader;

        const setupVendorBase = (keyfunc) => {
            coon.core.Environment._vendorBase = undefined;

            let vendorBase = Ext.create("coon.core.env.VendorBase");
            vendorBase.getPathForResource = (resource) => RESOURCE_PATH + "/" + resource;
            vendorBase.getManifest = keyfunc;
            coon.core.Environment.setVendorBase(vendorBase);
        };

        t.beforeEach(function () {

            loader = Ext.create(
                "coon.core.app.ConfigLoader",
                coon.core.FileLoader
            );

            setupVendorBase((key) => {
                switch (key) {
                case "coon-js.resources":
                    return "coon-js";
                case "coon-js.env":
                    return "testing";
                }
            });
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
            t.expect(loader.getFileNameForDomain("mymockdomain")).toEqual({
                "default": "mymockdomain.conf.json",
                "environment": "mymockdomain.testing.conf.json"
            });
        });


        t.it("getPathForDomain()", (t) => {

            let spy = t.spyOn(loader, "getFileNameForDomain");

            const pathInfo = loader.getFileNameForDomain(DOMAIN);

            t.expect(loader.getPathForDomain(DOMAIN)).toEqual({
                default: coon.core.Environment.getPathForResource(
                    coon.core.Environment.getManifest("coon-js.resources") + "/" + pathInfo.default
                ),
                environment: coon.core.Environment.getPathForResource(
                    coon.core.Environment.getManifest("coon-js.resources") + "/" + pathInfo.environment
                )
            });

            t.expect(spy.calls.mostRecent().args[0]).toBe(DOMAIN);

            setupVendorBase((key) => {
                switch (key) {
                case "coon-js.resources":
                    return "coon-js";
                case "coon-js.env":
                    return undefined;
                }
            });

            t.expect(loader.getPathForDomain(DOMAIN).environment).toBeUndefined();
            t.expect(loader.getPathForDomain(DOMAIN).default).toBeDefined();
        });


        t.it("load() - falls back to getPathForDomain() if url not specified", async t => {

            let spy = t.spyOn(loader, "getPathForDomain");

            await loader.load("mockdomain");

            t.expect(spy).toHaveBeenCalledWith("mockdomain");
        });


        t.it("load() - does not call getPathForDomain() if url specified", async t => {

            let mockdomainPath = loader.getPathForDomain("mockdomain").default,
                spy = t.spyOn(loader, "getPathForDomain");

            await loader.load("mockdomain", mockdomainPath);

            t.expect(spy).not.toHaveBeenCalled();
        });


        t.it("load() - undefined", async (t) => {
            t.expect(await loader.load("notexistingurl")).toBeUndefined();
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
                "config": {
                    "foo": "bar"
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
                "foo": "bar"
                //}
            };

            t.expect(coon.core.ConfigManager.get("mockdomain")).toBeUndefined();

            let config = await loader.load("mockdomain", undefined, "config");
            t.isDeeply(config, expected);
            t.isDeeply(coon.core.ConfigManager.get("mockdomain"), expected);
        });

    });

});
