/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * lib-cn_core
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

describe('conjoon.cn_core.data.pageMap.PageRangeTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('conjoon.cn_core.data.pageMap.PageRange', function() {



    t.it('constructor()', function(t) {

        var exc, e;

        try {Ext.create('conjoon.cn_core.data.pageMap.PageRange');} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('must be specified');

        t.expect(
            Ext.create('conjoon.cn_core.data.pageMap.PageRange', {pages:[1]})
            instanceof conjoon.cn_core.data.pageMap.PageRange
        ).toBe(true);


    });

    t.it('applyPages()', function(t) {

        var exc, e;

        try {
            Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
                pages : [1, 2, 5]
            });
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('not an ordered list');


        try {
            Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
                pages : [0, 1, 2]
            });
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('must not be less than 1');


        try {
            Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
                pages : 'somestuff'
            });
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('must be an array');


        var range = Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
            pages : [1, 2, 3]
        });

        try {
            range.setPages([4, 5, 6]);
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('was already defined');

    });


    t.it('getter', function(t) {

        var range = Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
              pages : [3, 4, 5]
        });

        t.expect(range.getPages()).toEqual([3, 4, 5]);
        t.expect(range.getFirst()).toBe(3);
        t.expect(range.getLast()).toBe(5);
        t.expect(range.getLength()).toBe(3);
    });


    t.it('equalTo()', function(t) {

        var rangeLeft = Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
                pages : [3, 4, 5]
            }),
            rangeRight = Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
                pages : [3, 4, 5]
            }),
            rangeNope_1 = Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
                pages : [1]
            }),
            rangeNope_2 = Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
                pages : [4, 5, 6]
            }), exc, e;


        try {
            rangeLeft.equalTo([1]);
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');


        t.expect(rangeLeft.equalTo(rangeLeft)).toBe(true);
        t.expect(rangeLeft.equalTo(rangeRight)).toBe(true);
        t.expect(rangeRight.equalTo(rangeLeft)).toBe(true);
        t.expect(rangeLeft.equalTo(rangeNope_1)).toBe(false);
        t.expect(rangeLeft.equalTo(rangeNope_2)).toBe(false);
        t.expect(rangeNope_1.equalTo(rangeNope_2)).toBe(false);

    });


    t.it('equalTo() - (2)', function(t) {

        var rangeLeft = Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
                pages : [3]
            }),
            rangeRight = Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
                pages : [3]
            }),
            rangeNope_1 = Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
                pages : [5]
            }),
            rangeNope_2 = Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
                pages : [6]
            }), exc, e;


        t.expect(rangeLeft.equalTo(rangeLeft)).toBe(true);
        t.expect(rangeLeft.equalTo(rangeRight)).toBe(true);
        t.expect(rangeRight.equalTo(rangeLeft)).toBe(true);
        t.expect(rangeLeft.equalTo(rangeNope_1)).toBe(false);
        t.expect(rangeLeft.equalTo(rangeNope_2)).toBe(false);
        t.expect(rangeNope_1.equalTo(rangeNope_2)).toBe(false);

    });


    t.it('toArray()', function(t) {

        var range = Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
                pages : [3, 4, 5]
            }),
            arr;

        arr = range.toArray();
        t.expect(arr).toEqual([3, 4, 5]);

        // mae sure no reference to the original page array is returned
        arr[0] = 8;
        t.expect(range.getFirst()).toBe(3);


        range = Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
            pages : [3]
        });

        arr = range.toArray();
        t.expect(arr).toEqual([3]);

        // mae sure no reference to the original page array is returned
        arr[0] = 3;
        t.expect(range.getFirst()).toBe(3);
        t.expect(range.getLast()).toBe(3);

    });



    t.it('conjoon.cn_core.data.pageMap.PageRange.create()', function(t) {

        var PageRange = conjoon.cn_core.data.pageMap.PageRange,
            exc, e, range,
            tests = [
                [4],
                [1, 2],
                [4, 5],
                [211, 212],
                [8, 9, 10, 11]
            ];

        try{PageRange.create();}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        exc = undefined;

        try{PageRange.create(['foo']);}catch(e){exc = e;}
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
        for (var i = 0, len = tests.length; i < len; i++) {
            range = PageRange.create.call(null, tests[i]);
            t.expect(range instanceof conjoon.cn_core.data.pageMap.PageRange).toBe(true);
            t.expect(range.toArray()).toEqual(tests[i]);
        }

        // with arguments as args
        for (var i = 0, len = tests.length; i < len; i++) {
            range = PageRange.create.apply(null, tests[i]);
            t.expect(range instanceof conjoon.cn_core.data.pageMap.PageRange).toBe(true);
            t.expect(range.toArray()).toEqual(tests[i]);
        }

    });


    t.it('conjoon.cn_core.data.pageMap.PageRange.createFor()', function(t) {

        t.isCalledNTimes('createRange', conjoon.cn_core.Util, 2);

        var PageRange = conjoon.cn_core.data.pageMap.PageRange,
            exc, e, range,
            tests = [
                [1, 2],
                [4, 5]
            ];


        // with arguments as args
        for (var i = 0, len = tests.length; i < len; i++) {
            range = PageRange.createFor.apply(null, tests[i]);
            t.expect(range instanceof conjoon.cn_core.data.pageMap.PageRange).toBe(true);
        }

    });

})});
