/**
 * coon.js
 * lib-cn_core
 * Copyright (C) 2017-2020 Thorsten Suckow-Homberg https://github.com/coon-js/lib-cn_core
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
 * Tests for issue
 * https://www.sencha.com/forum/showthread.php?339006-Sencha-6-2-GPL-Commercial-auto-generated-id-of-App-Controller-is-NOT-FQN-of-class&p=1178063#post1178063
 */
describe("coon.core.overrides.core.app.PackageControllerTest", function (t) {

    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------


    t.it("Should compute the id of the PackageController erroneously", function (t) {

        Ext.define("Test.subname.controller.ControllerName", {
            extend : "coon.core.app.PackageController",
            namespace : ["Test.subname"]
        }, function () {

            var controller = Ext.create("Test.subname.controller.ControllerName");

            t.expect(controller.getId()).toBe("ControllerName");
        });

        Ext.define("Test.subname.app.controller.ControllerName", {
            extend : "coon.core.app.PackageController",
            namespace : ["Test.subname"]
        }, function () {

            var controller = Ext.create("Test.subname.app.controller.ControllerName");

            t.expect(controller.getId()).toBe("Test.subname.app.controller.ControllerName");
        });

        // prevent "Adding assertions after the test has finished"
        t.waitForMs(250, () => {});

    });


    t.requireOk("coon.core.overrides.core.app.PackageController", function () {

        t.it("Should compute the id properly with override", function (t) {

            Ext.define("Test.subname.controller.ControllerName", {
                extend : "coon.core.app.PackageController",
                namespace : ["Test.subname"]
            }, function () {

                var controller = Ext.create("Test.subname.controller.ControllerName");

                t.expect(controller.getId()).toBe("Test.subname.controller.ControllerName");
            });

            Ext.define("Test.subname.app.controller.ControllerName", {
                extend : "coon.core.app.PackageController",
                namespace : ["Test.subname"]
            }, function () {

                var controller = Ext.create("Test.subname.app.controller.ControllerName");

                t.expect(controller.getId()).toBe("Test.subname.app.controller.ControllerName");
            });

            // prevent "Adding assertions after the test has finished"
            t.waitForMs(250, () => {});

        });

    });


});
