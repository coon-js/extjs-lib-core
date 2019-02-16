/**
 * coon.js
 * lib-cn_core
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/coon-js/lib-cn_core
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

describe('conjoon.cn_core.data.pageMap.IndexLookupTest', function(t) {

    Ext.define("TespropMock", {
        extend : 'Ext.data.Model',
        fields : [{
            name : 'testPropForIndexLookup',
            type : 'int'
        }]
    });

    var prop = function(testProperty) {
            return Ext.create('TespropMock', {
                testPropForIndexLookup : testProperty
            });
        },
        createTmpMap = function() {

            var pm = Ext.create('Ext.data.PageMap');
            for (var i = 0, len = arguments.length; i < len; i++) {
                pm.map[arguments[i]] = {};
            }

            return pm;
        },
        createFeeder = function(cfg) {

            return Ext.create('conjoon.cn_core.data.pageMap.PageMapFeeder', {
                pageMap : createPageMap(cfg)
            });
        },
        createPageMap = function(cfg) {

            var store, conf = {};

            store = Ext.create('Ext.data.BufferedStore', {
                autoLoad : true,
                pageSize : 25,
                fields : ['id', 'testProp', 'testPropForIndexLookup'],
                sorters: cfg.sorters,
                proxy : {
                    type : 'rest',
                    url  : 'cn_core/fixtures/PageMapItems',
                    extraParams : {
                        empty : cfg.empty
                    },
                    reader : {
                        type         : 'json',
                        rootProperty : 'data'
                    }
                }
            });

            return store.getData();
        },
        createSorter = function(cfg) {
            return Ext.create('conjoon.cn_core.data.pageMap.IndexLookup');
        },
        compareFunction = function (val1, val2) {
            return val1 < val2
                ? -1
                : val1 === val2
                    ? 0
                    : 1;
        };

t.requireOk('conjoon.cn_core.fixtures.sim.ItemSim', function(){


    t.it("prerequisites", function(t) {

        var ls, exc, e;

        let pm = Ext.create('Ext.data.PageMap');
        ls = Ext.create('conjoon.cn_core.data.pageMap.IndexLookup');

        t.expect(ls instanceof conjoon.cn_core.data.pageMap.IndexLookup).toBe(true);

    });


    t.it("scanRangeForIndex() - exceptions", function(t) {

        var sorter = createSorter(),
            feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = Ext.emptyFn,
            property  = 'testPropForIndexLookup',
            exc, e;

        t.waitForMs(250, function() {
            feeder.getPageMap().removeAtKey(1)
            t.expect(feeder.getPageMap().map[1]).not.toBeDefined();

            try{sorter.scanRangeForIndex(1, 1, 8000, property, 'DESC', cmp, undefined, feeder);} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('page not available');
        });
    });


    t.it("scanRangeForIndex() - sort ASC", function(t) {

        var sorter = createSorter(),
            feeder = createFeeder({
                sorters : [{property : 'testProp', direction : 'ASC'}]
            }),
            cmp       = compareFunction,
            property  = 'testPropForIndexLookup',
            pageMap   = feeder.getPageMap() ;

        for (var i = 1; i <= 19; i++) {
            feeder.getPageMap().getStore().loadPage(i);
        }


        t.waitForMs(250, function() {

            t.expect(pageMap.map[9].value[0].get('testProp')).toBe(200);
            t.expect(sorter.scanRangeForIndex(1, 19, 203, property, 'ASC', cmp, undefined, feeder)).toEqual([9, 2]);

        });
    });


    t.it("scanRangeForIndex() - sort DESC - page 1 (1)", function(t) {

        var sorter = createSorter(),
            feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = compareFunction,
            property  = 'testPropForIndexLookup';

        t.waitForMs(250, function() {
            t.expect(feeder.getPageMap().map[1]).toBeDefined();
            t.expect(sorter.scanRangeForIndex(1, 1, 8000, property, 'DESC', cmp, undefined, feeder)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(1, 1, 500.5, property, 'DESC', cmp, undefined, feeder)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(1, 1, 499.5, property, 'DESC', cmp, undefined, feeder)).toEqual([1, 1]);
            t.expect(sorter.scanRangeForIndex(1, 1, 499, property, 'DESC', cmp, undefined, feeder)).toEqual([1, 1]);
            t.expect(sorter.scanRangeForIndex(1, 1, 500, property, 'DESC', cmp, undefined, feeder)).toEqual([1, 0]);
            t.expect(sorter.scanRangeForIndex(1, 1, 498, property, 'DESC', cmp, undefined, feeder)).toEqual([1, 2]);
            t.expect(sorter.scanRangeForIndex(1, 1, 497, property, 'DESC', cmp, undefined, feeder)).toEqual([1, 3]);
            t.expect(sorter.scanRangeForIndex(1, 1, 476, property, 'DESC', cmp, undefined, feeder)).toEqual([1, 24]);

        });
    });


    t.it("scanRangeForIndex() - sort DESC - page 1 (2)", function(t) {

        var sorter = createSorter(),
            feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = compareFunction,
            property  = 'testPropForIndexLookup';

        t.waitForMs(250, function() {

            t.expect(sorter.scanRangeForIndex(1, 1, 476, property, 'DESC', cmp, undefined, feeder)).toEqual([1, 24]);
            t.expect(sorter.scanRangeForIndex(1, 1, 475, property, 'DESC', cmp, undefined, feeder)).toBe(1);
            t.expect(sorter.scanRangeForIndex(1, 1, 501, property, 'DESC', cmp, undefined, feeder)).toBe(-1)

        });
    });


    t.it("scanRangeForIndex() - sort DESC - page 2 - 4", function(t) {

        var sorter = createSorter(),
            feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = compareFunction,
            property  = 'testPropForIndexLookup';

        t.waitForMs(250, function() {

            t.expect(feeder.getPageMap().map[2]).toBeDefined();
            t.expect(feeder.getPageMap().map[3]).toBeDefined();
            t.expect(feeder.getPageMap().map[4]).toBeDefined();
            t.expect(sorter.scanRangeForIndex(2, 4, 476, property, 'DESC', cmp, undefined, feeder)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(2, 4, 475, property, 'DESC', cmp, undefined, feeder)).toEqual([2, 0]);
            t.expect(sorter.scanRangeForIndex(2, 4, 426, property, 'DESC', cmp, undefined, feeder)).toEqual([3, 24]);
            t.expect(sorter.scanRangeForIndex(2, 4, 1, property, 'DESC', cmp, undefined, feeder)).toBe(1);
            t.expect(sorter.scanRangeForIndex(2, 4, 453, property, 'DESC', cmp, undefined, feeder)).toEqual([2, 22]);
            t.expect(sorter.scanRangeForIndex(2, 4, 402, property, 'DESC', cmp, undefined, feeder)).toEqual([4, 23]);

        });
    });


    t.it("scanRangeForIndex() - sort ASC - page 1", function(t) {

        var dir    = 'ASC',
            sorter = createSorter(),
            feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : dir}]
            }),
            cmp       = compareFunction,
            property  = 'testPropForIndexLookup';

        t.waitForMs(250, function() {
            t.expect(feeder.getPageMap().map[1]).toBeDefined();
            t.expect(sorter.scanRangeForIndex(1, 1, -1, property, dir, cmp, undefined, feeder)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(1, 1, -1.5, property, dir, cmp, undefined, feeder)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(1, 1, 1.5, property, dir, cmp, undefined, feeder)).toEqual([1, 1]);
            t.expect(sorter.scanRangeForIndex(1, 1, 2, property, dir, cmp, undefined, feeder)).toEqual([1, 1]);
            t.expect(sorter.scanRangeForIndex(1, 1, 1, property, dir, cmp, undefined, feeder)).toEqual([1, 0]);
            t.expect(sorter.scanRangeForIndex(1, 1, 3, property, dir, cmp, undefined, feeder)).toEqual([1, 2]);
            t.expect(sorter.scanRangeForIndex(1, 1, 4, property, dir, cmp, undefined, feeder)).toEqual([1, 3]);
            t.expect(sorter.scanRangeForIndex(1, 1, 25, property, dir, cmp, undefined, feeder)).toEqual([1, 24]);
            t.expect(sorter.scanRangeForIndex(1, 1, 26, property, dir, cmp, undefined, feeder)).toBe(1);

        });
    });


    t.it("scanRangeForIndex() - sort ASC - page 2 - 4", function(t) {

        var dir    = 'ASC',
            sorter = createSorter(),
            feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : dir}]
            }),
            cmp       = compareFunction,
            property  = 'testPropForIndexLookup';

        t.waitForMs(250, function() {

            t.expect(feeder.getPageMap().map[2]).toBeDefined();
            t.expect(feeder.getPageMap().map[3]).toBeDefined();
            t.expect(feeder.getPageMap().map[4]).toBeDefined();
            t.expect(sorter.scanRangeForIndex(2, 4, 22, property, dir, cmp, undefined, feeder)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(2, 4, 26, property, dir, cmp, undefined, feeder)).toEqual([2, 0]);
            t.expect(sorter.scanRangeForIndex(2, 4, 50, property, dir, cmp, undefined, feeder)).toEqual([2, 24]);
            t.expect(sorter.scanRangeForIndex(2, 4, 180, property, dir, cmp, undefined, feeder)).toBe(1);
            t.expect(sorter.scanRangeForIndex(2, 4, 48, property, dir, cmp, undefined, feeder)).toEqual([2, 22]);
            t.expect(sorter.scanRangeForIndex(2, 4, 99, property, dir, cmp, undefined, feeder)).toEqual([4, 23]);

        });
    });


    t.it("scanRangeForIndex() - sort DESC - page 1 (2)", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = compareFunction,
            property  = 'testPropForIndexLookup';

        t.waitForMs(250, function() {

            t.expect(sorter.scanRangeForIndex(1, 1, 476, property, 'DESC', cmp, undefined, feeder)).toEqual([1, 24]);
            t.expect(sorter.scanRangeForIndex(1, 1, 475, property, 'DESC', cmp, undefined, feeder)).toBe(1);
            t.expect(sorter.scanRangeForIndex(1, 1, 501, property, 'DESC', cmp, undefined, feeder)).toBe(-1)

        });
    });


    t.it("scanRangeForIndex() - sort DESC - page 2 - 4", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = compareFunction,
            property  = 'testPropForIndexLookup';

        t.waitForMs(250, function() {

            t.expect(feeder.getPageMap().map[2]).toBeDefined();
            t.expect(feeder.getPageMap().map[3]).toBeDefined();
            t.expect(feeder.getPageMap().map[4]).toBeDefined();
            t.expect(sorter.scanRangeForIndex(2, 4, 476, property, 'DESC', cmp, undefined, feeder)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(2, 4, 475, property, 'DESC', cmp, undefined, feeder)).toEqual([2, 0]);
            t.expect(sorter.scanRangeForIndex(2, 4, 426, property, 'DESC', cmp, undefined, feeder)).toEqual([3, 24]);
            t.expect(sorter.scanRangeForIndex(2, 4, 1, property, 'DESC', cmp, undefined, feeder)).toBe(1);
            t.expect(sorter.scanRangeForIndex(2, 4, 453, property, 'DESC', cmp, undefined, feeder)).toEqual([2, 22]);
            t.expect(sorter.scanRangeForIndex(2, 4, 402, property, 'DESC', cmp, undefined, feeder)).toEqual([4, 23]);

        });
    });


    t.it("scanRangeForIndex() - ignoreId ASC", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'ASC'}]
            }),
            cmp       = compareFunction,
            property  = 'testPropForIndexLookup';

        t.waitForMs(250, function() {

            t.expect(feeder.getPageMap().map[1]).toBeDefined();
            t.expect(sorter.scanRangeForIndex(1, 1, 1, property, 'ASC', cmp, '1', feeder)).toEqual([1, 1]);
            t.expect(sorter.scanRangeForIndex(1, 1, 1, property, 'ASC', cmp, undefined, feeder)).toEqual([1, 0]);
        });
    });


    t.it("scanRangeForIndex() - ignoreId DESC", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = compareFunction,
            property  = 'testPropForIndexLookup';

        t.waitForMs(250, function() {

            t.expect(feeder.getPageMap().map[1]).toBeDefined();
            t.expect(sorter.scanRangeForIndex(1, 1, 500, property, 'DESC', cmp, '500', feeder)).toEqual([1, 1]);
            t.expect(sorter.scanRangeForIndex(1, 1, 500, property, 'DESC', cmp, undefined, feeder)).toEqual([1, 0]);
        });
    });


    t.it("findInsertIndex() - exception", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters : [
                    {property : 'testPropForIndexLookup', direction : 'DESC'},
                    {property : 'foo', direction : 'DESC'}
                ]
            }),
            pageMap = feeder.getPageMap(),
            exc, e;

        t.waitForMs(250, function() {

            try {sorter.findInsertIndex(prop(476), feeder);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('one sorter');
        });
    });


    t.it("findInsertIndex() - sort DESC -  between page 1 and page 3, page 2 not available", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            pageMap = feeder.getPageMap();

        t.waitForMs(250, function() {

            pageMap.removeAtKey(2);
            t.expect(feeder.getPageMap().map[1]).toBeDefined();
            t.expect(feeder.getPageMap().map[2]).not.toBeDefined();
            t.expect(feeder.getPageMap().map[3]).toBeDefined();

            t.expect(sorter.findInsertIndex(prop(476), feeder)).toEqual([1, 24]);
            t.expect(sorter.findInsertIndex(prop(475), feeder)).toBe(0);
            t.expect(sorter.findInsertIndex(prop(450), feeder)).toEqual([3, 0]);
            t.expect(sorter.findInsertIndex(prop(451), feeder)).toBe(0);

        });
    });


    t.it("findInsertIndex() - sort DESC - last page available", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
            sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
        });

        t.waitForMs(250, function() {

            feeder.getPageMap().getStore().loadPage(20);

            t.waitForMs(250, function() {
                t.expect(feeder.getPageMap().map[20]).toBeDefined();
                t.expect(sorter.findInsertIndex(prop(0), feeder)).toEqual([21, 0]);

                feeder.getPageMap().map[20].value.splice(24, 1);
                t.expect(sorter.findInsertIndex(prop(0), feeder)).toEqual([20, 24]);
            });
        });

    });


    t.it("findInsertIndex() - sort DESC - last page not available", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
            sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
        });

        t.waitForMs(250, function() {
            t.expect(feeder.getPageMap().map[20]).not.toBeDefined();

            t.expect(sorter.findInsertIndex(prop(0), feeder)).toBe(1);

        });

    });


    t.it("findInsertIndex() - sort DESC -  page 1 not available", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
            sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
        });

        t.waitForMs(250, function() {
            t.expect(feeder.getPageMap().map[1]).toBeDefined();
            feeder.getPageMap().removeAtKey(1);
            t.expect(feeder.getPageMap().map[1]).toBeUndefined();
            t.expect(feeder.getPageMap().map[2]).toBeDefined();

            // next page starts at 475
            t.expect(sorter.findInsertIndex(prop(476), feeder)).toBe(-1);

        });

    });


    t.it("scanRangeForIndex() - feed (ASC) - A", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'ASC'}]
            }),
            cmp       = compareFunction,
            pageMap   = feeder.getPageMap(),
            property  = 'testPropForIndexLookup';

        t.waitForMs(250, function() {


            pageMap.removeAtKey(3);
            feeder.createFeedAt(3, 4);
            feeder.getFeedAt(3).fill(
                //21      22        23       24
                [prop(47), prop(48), prop(49), prop(50)]
            );

            let complete = [];

            for (let i = 0; i < 25; i++) {
                complete.push(prop(25 + i));
            }

            t.expect(sorter.scanRangeForIndex(3, 3, 48.5, property, 'ASC', cmp, undefined, feeder)).toEqual([3, 22]);
            t.expect(sorter.scanRangeForIndex(3, 3, 46, property, 'ASC', cmp, undefined, feeder)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(3, 3, 50, property, 'ASC', cmp, undefined, feeder)).toEqual([3,24]);
            t.expect(sorter.scanRangeForIndex(3, 3, 51, property, 'ASC', cmp, undefined, feeder)).toBe(1);

            // 25 26
            feeder.removeFeedAt(3);
            feeder.createFeedAt(3, 4);
            feeder.getFeedAt(3).fill(complete);
            t.expect(sorter.scanRangeForIndex(3, 3, 25.5, property, 'ASC', cmp, undefined, feeder)).toEqual([3, 0]);
            t.expect(sorter.scanRangeForIndex(3, 3, 25, property, 'ASC', cmp, undefined, feeder)).toEqual([3, 0]);
            t.expect(sorter.scanRangeForIndex(3, 3, 26, property, 'ASC', cmp, undefined, feeder)).toEqual([3, 1]);
            t.expect(sorter.scanRangeForIndex(3, 3, 24, property, 'ASC', cmp, undefined, feeder)).toBe(-1);

        });
    });


    t.it("scanRangeForIndex() - feed (ASC)  - B", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'ASC'}]
            }),
            cmp       = compareFunction,
            pageMap   = feeder.getPageMap(),
            property  = 'testPropForIndexLookup';

        t.waitForMs(250, function() {


            pageMap.removeAtKey(3);
            feeder.createFeedAt(3, 2);
            feeder.getFeedAt(3).fill(
                //21      22        23       24
                [prop(25), prop(26), prop(27), prop(28)]
            );

            let complete = [];

            for (let i = 0; i < 25; i++) {
                complete.push(prop(25 + i));
            }

            t.expect(sorter.scanRangeForIndex(3, 3, 24, property, 'ASC', cmp, undefined, feeder)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(3, 3, 24.5, property, 'ASC', cmp, undefined, feeder)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(3, 3, 25, property, 'ASC', cmp, undefined, feeder)).toEqual([3, 0]);
            t.expect(sorter.scanRangeForIndex(3, 3, 28, property, 'ASC', cmp, undefined, feeder)).toEqual([3, 3]);
            t.expect(sorter.scanRangeForIndex(3, 3, 27.5, property, 'ASC', cmp, undefined, feeder)).toEqual([3, 3]);
            t.expect(sorter.scanRangeForIndex(3, 3, 29, property, 'ASC', cmp, undefined, feeder)).toBe(1);

            // 25 26
            feeder.removeFeedAt(3);
            feeder.createFeedAt(3, 2);
            feeder.getFeedAt(3).fill(complete);
            t.expect(sorter.scanRangeForIndex(3, 3, 49, property, 'ASC', cmp, undefined, feeder)).toEqual([3, 24]);
            t.expect(sorter.scanRangeForIndex(3, 3, 50, property, 'ASC', cmp, undefined, feeder)).toBe(1);
        });
    });


    t.it("scanRangeForIndex() - feed (DESC) - C", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = compareFunction,
            pageMap   = feeder.getPageMap(),
            property  = 'testPropForIndexLookup';

        t.waitForMs(250, function() {



            pageMap.removeAtKey(3);
            feeder.createFeedAt(3, 4);
            feeder.getFeedAt(3).fill(
                //   21         22         23         24
                [prop(429), prop(428), prop(427), prop(426)]
            );

            let complete = [];

            for (let i = 0; i < 25; i++) {
                complete.push(prop(450 - i));
            }

            t.expect(sorter.scanRangeForIndex(3, 3, 428.5, property, 'DESC', cmp, undefined, feeder)).toEqual([3, 22]);
            t.expect(sorter.scanRangeForIndex(3, 3, 430, property, 'DESC', cmp, undefined, feeder)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(3, 3, 426, property, 'DESC', cmp, undefined, feeder)).toEqual([3, 24]);
            t.expect(sorter.scanRangeForIndex(3, 3, 427, property, 'DESC', cmp, undefined, feeder)).toEqual([3, 23]);
            t.expect(sorter.scanRangeForIndex(3, 3, 425, property, 'DESC', cmp, undefined, feeder)).toBe(1);

            // 25 26
            feeder.removeFeedAt(3);
            feeder.createFeedAt(3, 4);
            feeder.getFeedAt(3).fill(complete);
            t.expect(sorter.scanRangeForIndex(3, 3, 451, property, 'DESC', cmp, undefined, feeder)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(3, 3, 450, property, 'DESC', cmp, undefined, feeder)).toEqual([3, 0]);
            t.expect(sorter.scanRangeForIndex(3, 3, 449.5, property, 'DESC', cmp, undefined, feeder)).toEqual([3, 1]);
            t.expect(sorter.scanRangeForIndex(3, 3, 415, property, 'DESC', cmp, undefined, feeder)).toBe(1);

        });
    });


    t.it("scanRangeForIndex() - feed (DESC) - D", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = compareFunction,
            pageMap   = feeder.getPageMap(),
            property  = 'testPropForIndexLookup';

        t.waitForMs(250, function() {


            pageMap.removeAtKey(3);
            feeder.createFeedAt(3, 2);
            feeder.getFeedAt(3).fill(
                //   0        1         2         3
                [prop(450), prop(449), prop(448), prop(447)]
            );

            let complete = [];

            for (let i = 0; i < 25; i++) {
                complete.push(prop(450 - i));
            }

            t.expect(sorter.scanRangeForIndex(3, 3, 449, property, 'DESC', cmp, undefined, feeder)).toEqual([3, 1]);
            t.expect(sorter.scanRangeForIndex(3, 3, 430, property, 'DESC', cmp, undefined, feeder)).toBe(1);
            t.expect(sorter.scanRangeForIndex(3, 3, 450, property, 'DESC', cmp, undefined, feeder)).toEqual([3, 0]);
            t.expect(sorter.scanRangeForIndex(3, 3, 451, property, 'DESC', cmp, undefined, feeder)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(3, 3, 446.5, property, 'DESC', cmp, undefined, feeder)).toBe(1);

            // 25 26
            feeder.removeFeedAt(3);
            feeder.createFeedAt(3, 2);
            feeder.getFeedAt(3).fill(complete);
            t.expect(sorter.scanRangeForIndex(3, 3, 451, property, 'DESC', cmp, undefined, feeder)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(3, 3, 450, property, 'DESC', cmp, undefined, feeder)).toEqual([3, 0]);
            t.expect(sorter.scanRangeForIndex(3, 3, 449.5, property, 'DESC', cmp, undefined, feeder)).toEqual([3, 1]);
            t.expect(sorter.scanRangeForIndex(3, 3, 446.5, property, 'DESC', cmp, undefined, feeder)).toEqual([3, 4]);

        });
    });


    t.it("findInsertIndex() - Feeder - A", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            pageMap = feeder.getPageMap();

        t.waitForMs(250, function() {

            pageMap.removeAtKey(2);
            feeder.swapMapToFeed(3, 4);
            t.expect(feeder.getPageMap().map[1]).toBeDefined();
            t.expect(feeder.getPageMap().map[2]).not.toBeDefined();
            t.expect(feeder.getPageMap().map[3]).not.toBeDefined();
            t.expect(feeder.getFeedAt(3)).toBeTruthy();

            t.expect(sorter.findInsertIndex(prop(476), feeder)).toEqual([1, 24]);
            t.expect(sorter.findInsertIndex(prop(475), feeder)).toBe(0);
            t.expect(sorter.findInsertIndex(prop(450), feeder)).toEqual([3, 0]);
            t.expect(sorter.findInsertIndex(prop(451), feeder)).toBe(0);

        });
    });


    t.it("findInsertIndex() - Feeder - B", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            });

        t.waitForMs(250, function() {

            feeder.getPageMap().getStore().loadPage(20);

            t.waitForMs(250, function() {
                feeder.swapMapToFeed(20, 19);
                t.expect(feeder.getPageMap().map[20]).not.toBeDefined();
                t.expect(sorter.findInsertIndex(prop(0), feeder)).toEqual([21, 0]);
            });
        });

    });


    t.it("findInsertIndex() - Feeder - C", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'ASC'}]
            });

        t.waitForMs(250, function() {

            feeder.swapMapToFeed(3, 2);

            feeder.getFeedAt(3).removeAt(24);

            t.expect(feeder.getFeedAt(3).getAt(24)).toBeUndefined();
            t.expect(feeder.getFeedAt(3).getAt(0).get('testPropForIndexLookup')).toBe(51);
            t.expect(feeder.getFeedAt(3).getAt(23).get('testPropForIndexLookup')).toBe(74);

            t.expect(sorter.findInsertIndex(prop(75), feeder)).toBe(0);
            t.expect(sorter.findInsertIndex(prop(74), feeder)).toEqual([3, 23]);

        });
    });


    t.it("findInsertIndex() - Feeder - D", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters: [{property: 'testPropForIndexLookup', direction: 'ASC'}]
            });

        t.waitForMs(250, function () {

            feeder.swapMapToFeed(1, 2);
            t.expect(sorter.findInsertIndex(prop(-1), feeder)).toBe(-1);

        });

    });


    t.it("findInsertIndex() - Feeder - E", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters: [{property: 'testPropForIndexLookup', direction: 'ASC'}]
            });

        t.waitForMs(250, function () {

            feeder.swapMapToFeed(1, 2);
            feeder.getFeedAt(1).removeAt(0);
            feeder.getFeedAt(1).removeAt(0);

            t.expect(sorter.findInsertIndex(prop(-1), feeder)).toBe(-1);

        });

    });


    t.it("findInsertIndex() - Feeder - F (1)", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters: [{property: 'testPropForIndexLookup', direction: 'ASC'}]
            });

        t.waitForMs(250, function() {

            feeder.getPageMap().getStore().loadPage(20);

            t.waitForMs(250, function() {
                feeder.swapMapToFeed(20, 19);
                t.expect(feeder.getPageMap().map[21]).not.toBeDefined();
                let rec = feeder.getPageMap().map[1].value[0];
                rec.set('testPropForIndexLookup', 999990);

                t.expect(sorter.findInsertIndex(rec, feeder)).toBe(1);
            });
        });

    });


    t.it("findInsertIndex() - Feeder - F (2)", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
            sorters: [{property: 'testPropForIndexLookup', direction: 'ASC'}]
        });

        t.waitForMs(250, function() {

            feeder.getPageMap().getStore().loadPage(20);

            t.waitForMs(250, function() {
                feeder.swapMapToFeed(20, 19);
                t.expect(feeder.getPageMap().map[21]).not.toBeDefined();

                t.expect(sorter.findInsertIndex(prop(99990), feeder)).toEqual([21, 0]);
            });
        });

    });



    t.it("findInsertIndex() - Feeder - G (1)", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters: [{property: 'testPropForIndexLookup', direction: 'ASC'}]
            });

        t.waitForMs(250, function() {

            feeder.getPageMap().getStore().loadPage(20);

            t.waitForMs(250, function() {
                feeder.swapMapToFeed(20, 19);
                feeder.getFeedAt(20).removeAt(24);
                t.expect(feeder.getFeedAt(20).getAt(24)).toBeUndefined();

                t.expect(feeder.getPageMap().map[21]).not.toBeDefined();
                t.expect(sorter.findInsertIndex(prop(99990), feeder)).toEqual([20, 24]);
            });
        });

    });


    t.it("findInsertIndex() - Feeder - G (2)", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
            sorters: [{property: 'testPropForIndexLookup', direction: 'ASC'}]
        });

        t.waitForMs(250, function() {

            feeder.getPageMap().getStore().loadPage(20);

            t.waitForMs(250, function() {
                feeder.swapMapToFeed(20, 19);
                feeder.getFeedAt(20).removeAt(24);
                let rec = feeder.getFeedAt(20).getAt(0);

                rec.set('testPropForIndexLookup', 2152155112);

                t.expect(sorter.findInsertIndex(rec, feeder)).toEqual([20, 24]);
            });
        });

    });


    t.it("findInsertIndex() - no sorter", function(t) {

        var sorter = createSorter(), exc, e,
            feeder = createFeeder({empty : true});

        t.waitForMs(250, function() {
            try{sorter.findInsertIndex(prop(1), feeder);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("one sorter");
            exc = undefined;
        });

    });


    t.it("findInsertIndex() - empty store", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                empty   : true,
                sorters : [{property: 'testPropForIndexLookup', direction: 'ASC'}]
            });

        t.waitForMs(250, function() {
            t.expect(feeder.getPageMap().map).toEqual({});
            t.expect(sorter.findInsertIndex(prop(1), feeder)).toBe(1);
        });

    });


    t.it("lib-cn_core#4", function(t) {

        var sorter = createSorter(), feeder = createFeeder({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = compareFunction,
            pageMap   = feeder.getPageMap(),
            pageSize = feeder.getPageMap().getPageSize(),
            property  = 'testPropForIndexLookup';

        t.waitForMs(250, function() {

            let pos = conjoon.cn_core.data.pageMap.RecordPosition.create(1, 4);

            pageMap.map[1].value[1].set('testPropForIndexLookup', 500);
            pageMap.map[1].value[2].set('testPropForIndexLookup', 500);
            pageMap.map[1].value[3].set('testPropForIndexLookup', 500);

            t.expect(sorter.scanRangeForIndex(1, 1, 500, property, 'ASC', cmp, "500", feeder, pos)).toEqual([1, 4]);

            t.expect(sorter.scanRangeForIndex(1, 1, 500, property, 'DESC', cmp, "500", feeder, pos)).toEqual([1, 4]);
        });
    });



})});
