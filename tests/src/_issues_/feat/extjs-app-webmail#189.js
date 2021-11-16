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

    t.requireOk("coon.core.env.VendorBase", "coon.core.FileLoader", "coon.core.Environment", () => {

        const
            RESOURCE_PATH = "./fixtures/";

        let loader;

        const setupVendorBase = (keyFunc) => {
            coon.core.Environment._vendorBase = undefined;

            let vendorBase = Ext.create("coon.core.env.VendorBase");
            vendorBase.getPathForResource = (resource) => RESOURCE_PATH + "/" + resource;
            vendorBase.getManifest = keyFunc;
            coon.core.Environment.setVendorBase(vendorBase);
        };

        t.beforeEach(function () {

            loader = Ext.create(
                "coon.core.app.ConfigLoader",
                coon.core.FileLoader
            );

            setupVendorBase((key) => {
                switch (key) {
                case "coon-js.resourceFolder":
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


        t.it("ConfigLoader.load() - do not register with ConfigManager", async t => {
            const expected = {
                "config": {
                    "foo": "bar"
                }
            };
            t.expect(coon.core.ConfigManager.get("mockDomain")).toBeUndefined();
            let config = await loader.load("mockDomain", undefined, undefined, false);
            t.expect(config).toEqual(expected);
            t.expect(coon.core.ConfigManager.get("mockDomain")).toBeUndefined();
        });


    });

});
