/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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

/**
 * The PackageControllerMock used in this tests returns falsy when
 * its prelaunchHook() is called for the first time, after this it returns
 * always truthy.
 * This is needed since an Application tries to call launch() the first time
 * it is executed - checking the preLaunchHook of each controller if it returns
 * true, the initiates the main view if that is the case.
 * In most of the test cases we rely on the fact that there is no main view
 * created until we call launch() by hand.
 */
describe("coon.core.app.ApplicationTest_Isolated2", (t) => {

    t.requireOk("coon.core.app.Application", () => {
        let app = null;

        const buildManifest = function () {

            const manifest = {};

            manifest.name = "ApplicationTest";
            manifest["coon-js"] = {env: "dev"};
            manifest.packages = {};
            manifest.resources = {path: "./fixtures", shared: "../bar"};
            return manifest;
        };


        t.beforeEach(function () {
            Ext.manifest = buildManifest();
            coon.core.app.Application.prototype.onProfilesReady = Ext.app.Application.prototype.onProfilesReady;
            Ext.isModern && Ext.viewport.Viewport.setup();
        });


        t.afterEach(function () {

            if (app) {
                app.destroy();
                app = null;
            }

            if (Ext.isModern && Ext.Viewport) {
                Ext.Viewport.destroy();
                Ext.Viewport = null;
            }

        });

        // +----------------------------------------------------------------------------
        // |                    =~. Unit Tests .~=
        // +----------------------------------------------------------------------------


        t.it("Should throw an error when mainView is not loaded", (t) => {
            var exc = undefined;

            try {
                Ext.create("coon.core.app.Application", {
                    name: "test",
                    mainView: "coon.fictionalClass"
                });

            } catch (e) {
                exc = e;
            }

            t.expect(exc).not.toBeNull();
            t.expect(exc.msg).toContain("was not loaded");
        });
    });

});
