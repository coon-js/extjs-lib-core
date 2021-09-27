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

StartTest((t) => {


    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------

    t.requireOk("coon.core.data.pageMap.PageRange", () => {


        t.it("constructor()", (t) => {

            var exc;

            try {Ext.create("coon.core.data.pageMap.PageRange");} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be specified");

            t.expect(
                Ext.create("coon.core.data.pageMap.PageRange", {pages: [1]})
            instanceof coon.core.data.pageMap.PageRange
            ).toBe(true);


        });

        t.it("applyPages()", (t) => {

            var exc;

            try {
                Ext.create("coon.core.data.pageMap.PageRange", {
                    pages: [1, 2, 5]
                });
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("not an ordered list");


            try {
                Ext.create("coon.core.data.pageMap.PageRange", {
                    pages: [0, 1, 2]
                });
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must not be less than 1");


            try {
                Ext.create("coon.core.data.pageMap.PageRange", {
                    pages: "somestuff"
                });
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be an array");


            var range = Ext.create("coon.core.data.pageMap.PageRange", {
                pages: [1, 2, 3]
            });

            try {
                range.setPages([4, 5, 6]);
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("was already defined");

        });


        t.it("getter", (t) => {

            var range = Ext.create("coon.core.data.pageMap.PageRange", {
                pages: [3, 4, 5]
            });

            t.expect(range.getPages()).toEqual([3, 4, 5]);
            t.expect(range.getFirst()).toBe(3);
            t.expect(range.getLast()).toBe(5);
            t.expect(range.getLength()).toBe(3);
        });


        t.it("equalTo()", (t) => {

            var rangeLeft = Ext.create("coon.core.data.pageMap.PageRange", {
                    pages: [3, 4, 5]
                }),
                rangeRight = Ext.create("coon.core.data.pageMap.PageRange", {
                    pages: [3, 4, 5]
                }),
                rangeNope_1 = Ext.create("coon.core.data.pageMap.PageRange", {
                    pages: [1]
                }),
                rangeNope_2 = Ext.create("coon.core.data.pageMap.PageRange", {
                    pages: [4, 5, 6]
                }), exc;


            try {
                rangeLeft.equalTo([1]);
            } catch (e) {
                exc = e;
            }

            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");


            t.expect(rangeLeft.equalTo(rangeLeft)).toBe(true);
            t.expect(rangeLeft.equalTo(rangeRight)).toBe(true);
            t.expect(rangeRight.equalTo(rangeLeft)).toBe(true);
            t.expect(rangeLeft.equalTo(rangeNope_1)).toBe(false);
            t.expect(rangeLeft.equalTo(rangeNope_2)).toBe(false);
            t.expect(rangeNope_1.equalTo(rangeNope_2)).toBe(false);

        });


        t.it("equalTo() - (2)", (t) => {

            var rangeLeft = Ext.create("coon.core.data.pageMap.PageRange", {
                    pages: [3]
                }),
                rangeRight = Ext.create("coon.core.data.pageMap.PageRange", {
                    pages: [3]
                }),
                rangeNope_1 = Ext.create("coon.core.data.pageMap.PageRange", {
                    pages: [5]
                }),
                rangeNope_2 = Ext.create("coon.core.data.pageMap.PageRange", {
                    pages: [6]
                });


            t.expect(rangeLeft.equalTo(rangeLeft)).toBe(true);
            t.expect(rangeLeft.equalTo(rangeRight)).toBe(true);
            t.expect(rangeRight.equalTo(rangeLeft)).toBe(true);
            t.expect(rangeLeft.equalTo(rangeNope_1)).toBe(false);
            t.expect(rangeLeft.equalTo(rangeNope_2)).toBe(false);
            t.expect(rangeNope_1.equalTo(rangeNope_2)).toBe(false);

        });


        t.it("toArray()", (t) => {

            var range = Ext.create("coon.core.data.pageMap.PageRange", {
                    pages: [3, 4, 5]
                }),
                arr;

            arr = range.toArray();
            t.expect(arr).toEqual([3, 4, 5]);

            // mae sure no reference to the original page array is returned
            arr[0] = 8;
            t.expect(range.getFirst()).toBe(3);


            range = Ext.create("coon.core.data.pageMap.PageRange", {
                pages: [3]
            });

            arr = range.toArray();
            t.expect(arr).toEqual([3]);

            // mae sure no reference to the original page array is returned
            arr[0] = 3;
            t.expect(range.getFirst()).toBe(3);
            t.expect(range.getLast()).toBe(3);

        });


        t.it("coon.core.data.pageMap.PageRange.create()", (t) => {

            var PageRange = coon.core.data.pageMap.PageRange,
                exc, range,
                tests = [
                    [4],
                    [1, 2],
                    [4, 5],
                    [211, 212],
                    [8, 9, 10, 11]
                ], i ,len;

            try{PageRange.create();}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            exc = undefined;

            try{PageRange.create(["foo"]);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            exc = undefined;

            try{PageRange.create({}, {});}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            exc = undefined;

            try{PageRange.create({});}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            exc = undefined;

            try{PageRange.create([]);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            exc = undefined;

            try{PageRange.create([1], 0);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            exc = undefined;

            try{PageRange.create(0, 1);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            exc = undefined;

            // with array as arg
            for (i = 0, len = tests.length; i < len; i++) {
                range = PageRange.create.call(null, tests[i]);
                t.expect(range instanceof coon.core.data.pageMap.PageRange).toBe(true);
                t.expect(range.toArray()).toEqual(tests[i]);
            }

            // with arguments as args
            for (i = 0, len = tests.length; i < len; i++) {
                range = PageRange.create.apply(null, tests[i]);
                t.expect(range instanceof coon.core.data.pageMap.PageRange).toBe(true);
                t.expect(range.toArray()).toEqual(tests[i]);
            }

        });


        t.it("coon.core.data.pageMap.PageRange.createFor()", (t) => {

            var PageRange = coon.core.data.pageMap.PageRange,
                range,
                tests = [
                    [1, 2],
                    [4, 5]
                ];


            // with arguments as args
            for (var i = 0, len = tests.length; i < len; i++) {
                range = PageRange.createFor.apply(null, tests[i]);
                t.expect(range instanceof coon.core.data.pageMap.PageRange).toBe(true);
                t.expect(range.getPages()).toEqual(tests[i]);
            }
        });


        t.it("contains()", (t) => {


            var PageRange      = coon.core.data.pageMap.PageRange,
                RecordPosition = coon.core.data.pageMap.RecordPosition,
                range, pos,
                tests = [
                    {range: [1, 2],  pos: [1, 19], exp: true},
                    {range: [1, 2],  pos: [2, 22], exp: true},
                    {range: [5, 12], pos: [1, 3], exp: false},
                    {range: [4, 9],  pos: [6, 5], exp: true}
                ];


            // with arguments as args
            for (var i = 0, len = tests.length; i < len; i++) {
                range = PageRange.createFor.apply(null, tests[i].range);
                pos   = RecordPosition.create(tests[i].pos);
                t.expect(range.contains(pos)).toBe(tests[i].exp);
            }

        });

    });});
