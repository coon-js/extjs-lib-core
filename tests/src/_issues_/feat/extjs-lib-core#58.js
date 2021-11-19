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

    t.requireOk(
        "coon.core.env.VendorBase",
        "coon.core.FileLoader",
        "coon.core.Environment", () => {

            const
                RESOURCE_PATH = "./fixtures";

            const setupVendorBase = (keyFunc) => {
                coon.core.Environment._vendorBase = undefined;

                let vendorBase = Ext.create("coon.core.env.VendorBase");
                vendorBase.getPathForResource = (resource, pkg) => `${RESOURCE_PATH}/${pkg ? pkg + "/" : ""}${resource}`;
                vendorBase.getManifest = keyFunc;
                coon.core.Environment.setVendorBase(vendorBase);
            };

            let loader, batchLoader;

            t.beforeEach(function () {

                loader = Ext.create(
                    "coon.core.app.ConfigLoader",
                    coon.core.FileLoader
                );

                batchLoader = Ext.create("coon.core.app.BatchConfigLoader", loader);

                setupVendorBase((key) => {
                    switch (key) {
                    case "coon-js":
                        return {
                            "resourcePath": "coon-js"
                        };
                    case "coon-js.resourcePath":
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


            t.it("BatchConfigLoader.resolveFileLocation()", async t => {


                t.expect(
                    batchLoader.resolveFileLocation("filename", "external_package")
                ).toBe("./fixtures/external_package/filename");

                t.expect(
                    batchLoader.resolveFileLocation("${package.resourcePath}/filename", "external_package")
                ).toBe("./fixtures/external_package/filename");

                t.expect(
                    batchLoader.resolveFileLocation("${coon-js.resourcePath}/filename", "external_package")
                ).toBe("./fixtures/coon-js/filename");

            });


            t.it("ApplicationUtil.loadPackages()", async t => {
                const
                    loadSpy = t.spyOn(batchLoader.configLoader, "load").and.callFake(() => ({})),
                    resolveSpy = t.spyOn(batchLoader, "resolveFileLocation").and.callFake(() => "resolved");

                await batchLoader.loadDomain("domain", {fileName: "configFile"});

                t.expect(resolveSpy.calls.mostRecent().args).toEqual([
                    "configFile", "domain"
                ]);

                t.expect(loadSpy.calls.mostRecent().args[1]).toBe("resolved");

                loadSpy.remove();
            });
        });

});
