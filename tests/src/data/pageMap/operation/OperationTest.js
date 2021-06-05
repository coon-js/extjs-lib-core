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

describe("coon.core.data.pageMap.operation.OperationTest", (t) => {

    var createRequest = function () {

            return Ext.create("coon.core.data.pageMap.operation.Request");

        },
        createResult = function () {

            return Ext.create("coon.core.data.pageMap.operation.Result", {
                success: true,
                reason: -1
            });

        };

    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------


    t.it("prerequisites", (t) => {

        var op, exc, req, res;

        try {Ext.create("coon.core.data.pageMap.operation.Operation");} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("is required");
        t.expect(exc.msg.toLowerCase()).toContain("request");
        exc = undefined;

        try {Ext.create("coon.core.data.pageMap.operation.Operation", {request: null});} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");
        t.expect(exc.msg.toLowerCase()).toContain("request");
        exc = undefined;

        req = createRequest();
        op = Ext.create("coon.core.data.pageMap.operation.Operation", {
            request: req
        });

        t.expect(op instanceof coon.core.data.pageMap.operation.Operation).toBe(true);

        try {op.setRequest(createRequest());} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("already set");
        t.expect(exc.msg.toLowerCase()).toContain("request");
        exc = undefined;

        t.expect(req).toBe(op.getRequest());

        res = createResult();
        op.setResult(res);
        t.expect(op.getResult()).toBe(res);

        try {op.setResult(createResult());} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("already set");
        t.expect(exc.msg.toLowerCase()).toContain("result");
        exc = undefined;

    });


});
