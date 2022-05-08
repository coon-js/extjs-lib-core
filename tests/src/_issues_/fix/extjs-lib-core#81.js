/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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

    t.diag("fix: ApplicationPlugins not loaded when fqn has application's namespace extjs-lib-core#81");

    t.requireOk("coon.core.Environment", () => {

        let applicationUtil = null;

        const setupEnvironment = (environment) => {
                coon.core.Environment.setVendorBase(Ext.create("coon.test.app.mock.VendorMock", environment));
            },
            purgeEnvironment = () => {
                coon.core.Environment._vendorBase = undefined;
            };


        t.beforeEach(() => {
            applicationUtil = Ext.create("coon.core.app.ApplicationUtil");
        });

        t.afterEach(() => {
            purgeEnvironment();
            coon.core.ConfigManager.configs = {};
            applicationUtil.destroy();
            applicationUtil = null;

        });


        // +----------------------------------------------------------------------------
        // |                    =~. Tests .~=
        // +----------------------------------------------------------------------------


        t.it("getFqnForPlugin()", t => {

            setupEnvironment({manifest: {namespace: "acme"}});

            t.expect(
                applicationUtil.getFqnForPlugin("acme.plugin.MyPlugin", {}, "Application")
            ).toBe("acme.plugin.MyPlugin");

        });


    });

});
