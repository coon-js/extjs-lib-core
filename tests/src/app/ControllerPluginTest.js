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

describe("coon.core.app.ControllerPluginTest", function (t) {

    var plugin;

    t.beforeEach(function () {
        plugin = Ext.create("coon.core.app.ControllerPlugin");
    });

    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------

    t.it("Should create an instance of coon.core.app.ControllerPlugin", function (t) {
        t.isInstanceOf(plugin, "coon.core.app.ControllerPlugin");
    });


    t.it("run()", function (t) {
        t.expect(plugin.run).toBe(Ext.emptyFn);
    });


    t.it("getId()", (t) => {
        let plugin = Ext.create("coon.core.app.ControllerPlugin");
        t.expect(plugin.getId()).toBe("coon.core.app.ControllerPlugin");

        plugin = Ext.create("coon.core.app.ControllerPlugin", {id : "myId"});
        t.expect(plugin.getId()).toBe("myId");
    });


});
