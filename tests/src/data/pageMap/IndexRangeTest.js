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

describe("coon.core.data.pageMap.IndexRangeTest", function (t) {


    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------

    t.requireOk("coon.core.data.pageMap.RecordPosition", function () {


        t.it("constructor()", function (t) {

            var exc,
                RecordPosition = coon.core.data.pageMap.RecordPosition;

            try {Ext.create("coon.core.data.pageMap.IndexRange");} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be specified");
            exc = undefined;

            try {Ext.create("coon.core.data.pageMap.IndexRange",
                {start : ""});} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be specified");
            exc = undefined;

            try {Ext.create("coon.core.data.pageMap.IndexRange",
                {end : "end"});} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be specified");
            exc = undefined;

            try {Ext.create("coon.core.data.pageMap.IndexRange",
                {start : "foo", end : "bar"});} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            exc = undefined;

            try {Ext.create("coon.core.data.pageMap.IndexRange",
                {start : [2, 1], end : [1, 2]});} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("less than or equal");
            exc = undefined;

            t.expect(
                Ext.create("coon.core.data.pageMap.IndexRange", {start:[1, 1], end : [1, 1]})
                instanceof coon.core.data.pageMap.IndexRange
            ).toBe(true);

            t.expect(
                Ext.create("coon.core.data.pageMap.IndexRange", {start:[1, 1], end : [1, 2]})
                    instanceof coon.core.data.pageMap.IndexRange
            ).toBe(true);

            t.expect(
                Ext.create("coon.core.data.pageMap.IndexRange", {start:RecordPosition.create(1, 1), end : [1, 1]})
                    instanceof coon.core.data.pageMap.IndexRange
            ).toBe(true);

            t.expect(
                Ext.create("coon.core.data.pageMap.IndexRange", {
                    start:RecordPosition.create(1, 1), end : RecordPosition.create(1, 2)})
                    instanceof coon.core.data.pageMap.IndexRange
            ).toBe(true);


        });


        t.it("set*() / get*()", function (t) {

            var exc, range;

            range = Ext.create("coon.core.data.pageMap.IndexRange", {
                start : [1, 9],
                end   : [2, 2]
            });

            try {range.setStart([4, 5]);} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("was already defined");
            exc = undefined;

            try {range.setEnd([4, 5]);} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("was already defined");

            t.expect(range.getStart() instanceof coon.core.data.pageMap.RecordPosition).toBe(true);
            t.expect(range.getStart().getPage()).toBe(1);
            t.expect(range.getStart().getIndex()).toBe(9);

            t.expect(range.getEnd() instanceof coon.core.data.pageMap.RecordPosition).toBe(true);
            t.expect(range.getEnd().getPage()).toBe(2);
            t.expect(range.getEnd().getIndex()).toBe(2);


        });


        t.it("contains()", function (t) {

            var exc, range, test,
                RecordPosition = coon.core.data.pageMap.RecordPosition,
                tests = [{
                    start  : [2, 4],
                    end    : [5, 6],
                    target : [2, 4],
                    exp    : true
                }, {
                    start  : [2, 4],
                    end    : [5, 6],
                    target : [5, 6],
                    exp    : true
                }, {
                    start  : [2, 4],
                    end    : [5, 6],
                    target : [3, 0],
                    exp    : true
                }, {
                    start  : [2, 4],
                    end    : [5, 6],
                    target : [12, 4],
                    exp    : false
                }, {
                    start  : [2, 4],
                    end    : [5, 6],
                    target : [5, 8],
                    exp    : false
                }, {
                    multi  : true,
                    start  : [2, 4],
                    end    : [5, 6],
                    target : [
                        RecordPosition.create(5, 8),
                        RecordPosition.create(1, 1)
                    ],
                    exp : false
                }, {
                    multi  : true,
                    start  : [2, 4],
                    end    : [5, 6],
                    target : [
                        RecordPosition.create(5, 8),
                        RecordPosition.create(1, 1),
                        RecordPosition.create(3, 12)
                    ],
                    exp : true
                }];

            range = Ext.create("coon.core.data.pageMap.IndexRange", {
                start : [1, 9],
                end   : [2, 2]
            });

            try {range.contains([4, 5]);} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("an instance of");
            exc = undefined;

            try {range.contains([RecordPosition.create(4, 5), 5]);} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("an instance of");
            exc = undefined;

            for (var i = 0, len = tests.length; i < len; i++) {
                test = tests[i];

                range = Ext.create("coon.core.data.pageMap.IndexRange", {
                    start : test.start,
                    end   : test.end
                });

                if (test.multi) {
                    t.expect(
                        range.contains(test.target)
                    ).toBe(test.exp);
                } else {
                    t.expect(
                        range.contains(RecordPosition.create(test.target))
                    ).toBe(test.exp);
                }


            }


        });


    });});
