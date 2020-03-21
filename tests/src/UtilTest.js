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

describe("coon.core.UtilTest", function (t) {


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------

    t.requireOk("coon.core.Util", function (){

        t.it("unchain()", function (t) {


            var testMe = {1:{2:{3:{4:{5:"foo"}}}}};

            t.expect(coon.core.Util.unchain("1.2.3.4.5", testMe)).toBe("foo");
            t.expect(coon.core.Util.unchain("1.2.9.4.5", testMe)).toBeUndefined();

            t.expect(coon.core.Util.unchain("1.2.3.4.5")).toBeUndefined();

        });


        t.it("listNeighbours()", function (t) {

            t.expect(coon.core.Util.listNeighbours(["4", 5, "5", "1", "3", 6, "8"], 5)).toEqual([3, 4, 5, 6]);
            t.expect(coon.core.Util.listNeighbours([1, 2, 3], 2)).toEqual([1, 2, 3]);

            t.expect(coon.core.Util.listNeighbours([3, 2, 1, 2], 1)).toEqual([1, 2, 3]);

            t.expect(coon.core.Util.listNeighbours(["4", 0, -1, 23, 1, 18, 5, "1", "3", 6, "8", "17"], 17)).toEqual([17, 18]);
        });


        t.it("groupIndices()", function (t) {

            var tests = [{
                    value    : ["4", 5, "1", "3", 6, "8"],
                    expected : [[1], [3, 4, 5, 6], [8]]
                }, {
                    value     : ["1", 2, "3"],
                    expected  : [[1, 2, 3]]
                }, {
                    value     : [3, 4, 5, 4, 5],
                    expected  : [[3, 4, 5]]
                }, {
                    value     : ["1", 2, "3", 3, 16, 99, 4, 5, 6, 9, 10 , 11, "7", 15],
                    expected  : [[1, 2, 3, 4, 5, 6, 7], [9 ,10, 11], [15, 16], [99]]
                }], test, exc;

            try{coon.core.Util.groupIndices("foo");}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();


            for (var i = 0, len = tests.length; i < len; i++) {
                test = tests[i];

                t.expect(coon.core.Util.groupIndices(test.value)).not.toBe(test.value);
                t.expect(coon.core.Util.groupIndices(test.value)).toEqual(test.expected);
            }
        });


        t.it("createRange()", function (t) {

            var Util = coon.core.Util,
                exc,
                tests = [{
                    value    : ["1", 3],
                    expected : [1, 2, 3]
                }, {
                    value     : [1, 2],
                    expected  : [1, 2]
                }, {
                    value     : [1, "5"],
                    expected  : [1, 2, 3, 4, 5]
                }, {
                    value     : [9, 12],
                    expected  : [9, 10, 11, 12]
                }, {
                    value     : [0, 2],
                    expected  : [0, 1, 2]
                }, {
                    value     : [-4, -3],
                    expected  : [-4, -3]
                }], test;


            try{Util.createRange("foo");}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be a number");
            t.expect(exc.msg.toLowerCase()).toContain("start");
            t.expect(exc.msg.toLowerCase()).not.toContain("end");

            try{Util.createRange(1, "bar");}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be a number");
            t.expect(exc.msg.toLowerCase()).toContain("end");

            try{Util.createRange(1, -9);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("greater than");
            t.expect(exc.msg.toLowerCase()).toContain("end");


            for (var i = 0, len = tests.length; i < len; i++) {
                test = tests[i];

                t.expect(Util.createRange.apply(null, test.value)).toEqual(test.expected);
            }
        });


    });});
