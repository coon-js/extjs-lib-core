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

describe("coon.core.data.request.FormDataTest", function (t) {


    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------

    t.it("Make sure class definition is as expected", function (t) {
        var request = Ext.create("coon.core.data.request.FormData", {});

        // sanitize
        t.expect(request instanceof Ext.data.request.Ajax).toBe(true);
        t.expect(request.alias).toContain("request.cn_core-datarequestformdata");
    });


    t.it("test openRequest() without FormData", function (t) {
        var request = Ext.create("coon.core.data.request.FormData", {
            options : {
                headers : {
                    "Content-Type" : "foo"
                }
            }
        });

        request.async = true;
        t.expect(request.options.headers).toEqual({
            "Content-Type" : "foo"
        });

        var xhr = request.openRequest({}, {data : {"foo" : "bar"}});
        t.expect(request.options.headers).toEqual({"Content-Type" : "foo"});
        t.expect(xhr instanceof XMLHttpRequest).toBe(true);
        t.expect(xhr.upload.onprogress).toBeFalsy();
    });


    t.it("test openRequest() with FormData", function (t) {
        var request = Ext.create("coon.core.data.request.FormData", {
                options : {
                    headers : {
                        "Content-Type" : "foo"
                    }
                }
            }),
            onprogresscount = 0;

        request.async = true;

        request.onProgress = function () {
            onprogresscount++;
        };

        t.expect(request.options.headers).toEqual({
            "Content-Type" : "foo"
        });

        var xhr = request.openRequest({}, {
            data : new FormData
        });

        t.expect(request.options.headers).toEqual({
            "Content-Type" : null
        });

        t.expect(xhr instanceof XMLHttpRequest).toBe(true);

        t.expect(onprogresscount).toBe(0);
        t.expect(xhr.upload.onprogress).toBeTruthy();
        xhr.upload.onprogress();
        t.expect(onprogresscount).toBe(1);
    });


    t.it("test onProgress() undefined", function (t) {
        var request = Ext.create("coon.core.data.request.FormData", {
            options : {
                progressCallback : undefined
            }
        });

        var exc = undefined;

        try {
            request.onProgress({"foo" : "bar"});
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeUndefined();
    });

    t.it("test onProgress() defined", function (t) {
        var progressScope = {},
            request        = Ext.create("coon.core.data.request.FormData", {
                options : {
                    progressCallback : function (evt, options) {
                        this["foo"] = evt;
                        this["bar"] = options;
                    },
                    progressScope : progressScope
                }
            });

        var evt = {"rand" : "om"};

        t.expect(progressScope).toEqual({});

        request.onProgress(evt);

        t.expect(progressScope.foo).toBe(evt);
        t.expect(progressScope.bar).toBe(request.options);

    });

});
