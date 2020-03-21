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

describe("coon.core.data.SessionTest", function (t) {


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------


    t.it("Sanitize the Session class", function (t) {
        var c = Ext.create("coon.core.data.Session");

        t.expect(c instanceof Ext.data.Session).toBe(true);
        t.expect(c.batchVisitorClassName).toBe("Ext.data.session.BatchVisitor");
    });


    t.it("Test createVisitor() with batchVisitorClassName not loaded yet.", function (t) {
        var c = Ext.create("coon.core.data.Session", {
            batchVisitorClassName : "foo"
        });

        var exc = undefined;
        try {
            c.createVisitor();
        } catch(e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg).toContain("requires batchVisitorClassName to be loaded");

    });


    t.it("Test createVisitor() with batchVisitorClassName being the wrong type.", function (t) {
        var c = Ext.create("coon.core.data.Session", {
            batchVisitorClassName : "Ext.Panel"
        });

        var exc = undefined;
        try {
            c.createVisitor();
        } catch(e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg).toContain("needs to inherit from Ext.data.session.BatchVisitor");

    });


    t.it("Test getSaveBatch()", function (t) {

        Ext.define("MockBatchVisitor", {
            extend : "Ext.data.session.BatchVisitor",

            getBatch : function () {
                return "foo";
            }
        }, function () {

            var c = Ext.create("coon.core.data.Session", {
                batchVisitorClassName : "MockBatchVisitor"
            });

            t.expect(c.getSaveBatch()).toBe("foo");

        });


    });


    t.it("createVisitor() not returning same instance", function (t) {

        Ext.define("MockBatchVisitor", {
            extend : "Ext.data.session.BatchVisitor",

            getBatch : function () {
                return "foo";
            }
        }, function () {

            var c = Ext.create("coon.core.data.Session", {
                batchVisitorClassName : "MockBatchVisitor"
            });

            t.expect(c.createVisitor()).not.toBe(c.createVisitor());

        });


    });


});
