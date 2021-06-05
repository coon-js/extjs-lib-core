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

describe("coon.core.data.pageMap.RecordPositionTest", (t) => {


    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------

    t.it("constructor()", (t) => {

        var exc;

        try {
            Ext.create("coon.core.data.pageMap.RecordPosition");
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("needs both");

        try {
            Ext.create("coon.core.data.pageMap.RecordPosition", {
                page: 2
            });
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("needs both");


        try {
            Ext.create("coon.core.data.pageMap.RecordPosition", {
                index: 2
            });
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("needs both");
    });


    t.it("applyPage()", (t) => {

        var exc;

        try {
            Ext.create("coon.core.data.pageMap.RecordPosition", {
                page: "u",
                index: 1
            });
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("page");
        t.expect(exc.msg.toLowerCase()).toContain("must be a number");


        try {
            Ext.create("coon.core.data.pageMap.RecordPosition", {
                page: 0,
                index: 1
            });
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("page");
        t.expect(exc.msg.toLowerCase()).toContain("must not be less than");


        var position = Ext.create("coon.core.data.pageMap.RecordPosition", {
            page: 2,
            index: 1
        });

        try {
            position.setPage(4);
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("page");
        t.expect(exc.msg.toLowerCase()).toContain("was already defined");

    });


    t.it("applyIndex()", (t) => {

        var exc;

        try {
            Ext.create("coon.core.data.pageMap.RecordPosition", {
                index: "u",
                page: 1
            });
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("index");
        t.expect(exc.msg.toLowerCase()).toContain("must be a number");


        try {
            Ext.create("coon.core.data.pageMap.RecordPosition", {
                page: 1,
                index: -1
            });
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("index");
        t.expect(exc.msg.toLowerCase()).toContain("must not be less than");


        var position = Ext.create("coon.core.data.pageMap.RecordPosition", {
            page: 2,
            index: 1
        });

        try {
            position.setIndex(4);
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("index");
        t.expect(exc.msg.toLowerCase()).toContain("was already defined");

    });


    t.it("getter", (t) => {

        var position = Ext.create("coon.core.data.pageMap.RecordPosition", {
            page: 7879,
            index: 4000
        });

        t.expect(position.getPage()).toBe(7879);
        t.expect(position.getIndex()).toBe(4000);

    });


    t.it("equalTo()", (t) => {

        var posLeft = Ext.create("coon.core.data.pageMap.RecordPosition", {
                page: 3,
                index: 2
            }),
            posRight = Ext.create("coon.core.data.pageMap.RecordPosition", {
                page: 3,
                index: 2
            }),
            posNope_1 = Ext.create("coon.core.data.pageMap.RecordPosition", {
                page: 4,
                index: 2
            }),
            posNope_2 = Ext.create("coon.core.data.pageMap.RecordPosition", {
                page: 3,
                index: 5
            }), exc;


        try {
            posLeft.equalTo([1]);
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");


        t.expect(posLeft.equalTo(posLeft)).toBe(true);
        t.expect(posLeft.equalTo(posRight)).toBe(true);
        t.expect(posRight.equalTo(posLeft)).toBe(true);
        t.expect(posLeft.equalTo(posNope_1)).toBe(false);
        t.expect(posLeft.equalTo(posNope_2)).toBe(false);
        t.expect(posNope_1.equalTo(posNope_2)).toBe(false);

    });

    t.it("coon.core.data.pageMap.RecordPosition.create()", (t) => {

        var RecordPosition = coon.core.data.pageMap.RecordPosition,
            exc, pos,
            tests = [
                [1, 2],
                [4, 9],
                [211, 99],
                [8, 3, 4, 2]
            ], i, len;

        try{RecordPosition.create();}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        exc = undefined;

        try{RecordPosition.create(["foo", null]);}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        exc = undefined;

        try{RecordPosition.create({}, {});}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        exc = undefined;

        try{RecordPosition.create({});}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        exc = undefined;

        try{RecordPosition.create([]);}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        exc = undefined;

        try{RecordPosition.create([1]);}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        exc = undefined;

        try{RecordPosition.create(0, 1);}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        exc = undefined;

        // with array as arg
        for (i = 0, len = tests.length; i < len; i++) {
            pos = RecordPosition.create.call(null, tests[i]);
            t.expect(pos instanceof coon.core.data.pageMap.RecordPosition).toBe(true);
            t.expect(pos.getPage()).toBe(tests[i][0]);
            t.expect(pos.getIndex()).toBe(tests[i][1]);
        }

        // with arguments as args
        for (i = 0, len = tests.length; i < len; i++) {
            pos = RecordPosition.create.apply(null, tests[i]);
            t.expect(pos instanceof coon.core.data.pageMap.RecordPosition).toBe(true);
            t.expect(pos.getPage()).toBe(tests[i][0]);
            t.expect(pos.getIndex()).toBe(tests[i][1]);
        }

    });


    t.it("lessThan()", (t) => {

        var RecordPosition = coon.core.data.pageMap.RecordPosition,
            left, right,
            tests = [{
                left: [1, 2],
                right: [1, 2],
                exp: false
            }, {
                left: [1, 1],
                right: [1, 2],
                exp: true
            }, {
                left: [34, 2],
                right: [3, 2],
                exp: false
            }, {
                left: [1, 9],
                right: [1, 2],
                exp: false
            }, {
                left: [10,32],
                right: [112, 2],
                exp: true
            }],
            exc;

        left = RecordPosition.create(1, 1);

        try{left.lessThan();}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");
        exc = undefined;

        for (var i = 0, len = tests.length; i < len; i++) {
            left  = RecordPosition.create(tests[i].left);
            right = RecordPosition.create(tests[i].right);

            t.expect(left.lessThan(right)).toBe(tests[i].exp);
        }

    });


    t.it("greaterThan()", (t) => {

        var RecordPosition = coon.core.data.pageMap.RecordPosition,
            left, right,
            tests = [{
                left: [1, 2],
                right: [1, 2],
                exp: false
            }, {
                left: [1, 2],
                right: [1, 1],
                exp: true
            }, {
                left: [3, 2],
                right: [34, 2],
                exp: false
            }, {
                left: [1, 2],
                right: [1, 9],
                exp: false
            }, {
                left: [112, 2],
                right: [10,32],
                exp: true
            }],
            exc;

        left = RecordPosition.create(1, 1);

        try{left.greaterThan();}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");
        exc = undefined;

        for (var i = 0, len = tests.length; i < len; i++) {
            left  = RecordPosition.create(tests[i].left);
            right = RecordPosition.create(tests[i].right);

            t.expect(left.greaterThan(right)).toBe(tests[i].exp);
        }

    });


});
