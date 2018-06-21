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

describe('conjoon.cn_core.data.pageMap.IndexLookupTest', function(t) {

    var createPageMap = function() {
            var store;

            store = Ext.create('Ext.data.BufferedStore', {
                autoLoad : true,
                pageSize : 25,
                fields : ['id', 'testProp'],
                proxy : {
                    type : 'rest',
                    url  : 'cn_core/fixtures/PageMapItems',
                    reader : {
                        type         : 'json',
                        rootProperty : 'data'
                    }
                }
            });

            return store.getData();
        },
        prop = function(testProperty) {
            return Ext.create('Ext.data.Model', {
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
        createSorter = function(cfg) {

            var store, conf = {};

            store = Ext.create('Ext.data.BufferedStore', {
                autoLoad : true,
                pageSize : 25,
                fields : ['id', 'testProp'],
                sorters: cfg.sorters,
                proxy : {
                    type : 'rest',
                    url  : 'cn_core/fixtures/PageMapItems',
                    reader : {
                        type         : 'json',
                        rootProperty : 'data'
                    }
                }
            });

            conf = {
                pageMap : store.getData()
            };

            if (cfg.compareFunction) {
                conf.compareFunction = cfg.compareFunction;
            }

            return Ext.create('conjoon.cn_core.data.pageMap.IndexLookup', conf);

        };

t.requireOk('conjoon.cn_core.fixtures.sim.ItemSim', function(){


    t.it("prerequisites", function(t) {

        var ls, exc, e;

        try {Ext.create('conjoon.cn_core.data.pageMap.IndexLookup')} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('is required');

        try {Ext.create('conjoon.cn_core.data.pageMap.IndexLookup', {pageMap : null})} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');

        ls = Ext.create('conjoon.cn_core.data.pageMap.IndexLookup', {
            pageMap : Ext.create('Ext.data.PageMap')
        });

        t.expect(ls instanceof conjoon.cn_core.data.pageMap.IndexLookup).toBe(true);

        try {ls.setPageMap(null);} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('already set');
    });


    t.it("getCompareFunction()", function(t) {

        var sorter = createSorter({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmpFunc = sorter.getCompareFunction();

        t.expect(Ext.isFunction(cmpFunc)).toBe(true);

        t.expect(cmpFunc(0, 0)).toBe(0);
        t.expect(cmpFunc('0', 0)).toBe(1);
        t.expect(cmpFunc(-1, 0)).toBe(-1);


    });


    t.it("applyCompareFunction()", function(t) {

        var exc, e,
            sorter = createSorter({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp = function(val1, val2, field){};

        try{sorter.applyCompareFunction(null)}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('is not a');

        try{sorter.applyCompareFunction(Ext.emptyFn)}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('already set');

        sorter = createSorter({
            sorters         : [{property : 'testPropForIndexLookup', direction : 'DESC'}],
            compareFunction : cmp
        });

        t.expect(sorter.getCompareFunction()).toBe(cmp)

    });


    t.it("scanRangeForIndex() - exceptions", function(t) {

        var sorter = createSorter({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = sorter.getCompareFunction(),
            property  = 'testPropForIndexLookup',
            exc, e;

        t.waitForMs(550, function() {
            sorter.getPageMap().removeAtKey(1)
            t.expect(sorter.getPageMap().map[1]).not.toBeDefined();

            try{sorter.scanRangeForIndex(1, 1, 8000, property, 'DESC', cmp);} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('page not available');
        });
    });


    t.it("scanRangeForIndex() - sort ASC", function(t) {

        var sorter = createSorter({
                sorters : [{property : 'testProp', direction : 'ASC'}]
            }),
            cmp       = sorter.getCompareFunction(),
            property  = 'testPropForIndexLookup',
            pageMap   = sorter.getPageMap() ;

        for (var i = 1; i <= 19; i++) {
            sorter.getPageMap().getStore().loadPage(i);
        }


        t.waitForMs(550, function() {

            t.expect(pageMap.map[9].value[0].get('testProp')).toBe(200);
            t.expect(sorter.scanRangeForIndex(1, 19, 203, property, 'ASC', cmp)).toEqual([9, 2]);

        });
    });


    t.it("scanRangeForIndex() - sort DESC - page 1 (1)", function(t) {

        var sorter = createSorter({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = sorter.getCompareFunction(),
            property  = 'testPropForIndexLookup';

        t.waitForMs(550, function() {
            t.expect(sorter.getPageMap().map[1]).toBeDefined();
            t.expect(sorter.scanRangeForIndex(1, 1, 8000, property, 'DESC', cmp)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(1, 1, 500.5, property, 'DESC', cmp)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(1, 1, 499.5, property, 'DESC', cmp)).toEqual([1, 1]);
            t.expect(sorter.scanRangeForIndex(1, 1, 499, property, 'DESC', cmp)).toEqual([1, 1]);
            t.expect(sorter.scanRangeForIndex(1, 1, 500, property, 'DESC', cmp)).toEqual([1, 0]);
            t.expect(sorter.scanRangeForIndex(1, 1, 498, property, 'DESC', cmp)).toEqual([1, 2]);
            t.expect(sorter.scanRangeForIndex(1, 1, 497, property, 'DESC', cmp)).toEqual([1, 3]);
            t.expect(sorter.scanRangeForIndex(1, 1, 476, property, 'DESC', cmp)).toEqual([1, 24]);

        });
    });


    t.it("scanRangeForIndex() - sort DESC - page 1 (2)", function(t) {

        var sorter = createSorter({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = sorter.getCompareFunction(),
            property  = 'testPropForIndexLookup';

        t.waitForMs(550, function() {

            t.expect(sorter.scanRangeForIndex(1, 1, 476, property, 'DESC', cmp)).toEqual([1, 24]);
            t.expect(sorter.scanRangeForIndex(1, 1, 475, property, 'DESC', cmp)).toBe(1);
            t.expect(sorter.scanRangeForIndex(1, 1, 501, property, 'DESC', cmp)).toBe(-1)

        });
    });


    t.it("scanRangeForIndex() - sort DESC - page 2 - 4", function(t) {

        var sorter = createSorter({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = sorter.getCompareFunction(),
            property  = 'testPropForIndexLookup';

        t.waitForMs(550, function() {

            t.expect(sorter.getPageMap().map[2]).toBeDefined();
            t.expect(sorter.getPageMap().map[3]).toBeDefined();
            t.expect(sorter.getPageMap().map[4]).toBeDefined();
            t.expect(sorter.scanRangeForIndex(2, 4, 476, property, 'DESC', cmp)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(2, 4, 475, property, 'DESC', cmp)).toEqual([2, 0]);
            t.expect(sorter.scanRangeForIndex(2, 4, 426, property, 'DESC', cmp)).toEqual([3, 24]);
            t.expect(sorter.scanRangeForIndex(2, 4, 1, property, 'DESC', cmp)).toBe(1);
            t.expect(sorter.scanRangeForIndex(2, 4, 453, property, 'DESC', cmp)).toEqual([2, 22]);
            t.expect(sorter.scanRangeForIndex(2, 4, 402, property, 'DESC', cmp)).toEqual([4, 23]);

        });
    });


    t.it("scanRangeForIndex() - sort ASC - page 1", function(t) {

        var dir    = 'ASC',
            sorter = createSorter({
                sorters : [{property : 'testPropForIndexLookup', direction : dir}]
            }),
            cmp       = sorter.getCompareFunction(),
            property  = 'testPropForIndexLookup';

        t.waitForMs(550, function() {
            t.expect(sorter.getPageMap().map[1]).toBeDefined();
            t.expect(sorter.scanRangeForIndex(1, 1, -1, property, dir, cmp)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(1, 1, -1.5, property, dir, cmp)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(1, 1, 1.5, property, dir, cmp)).toEqual([1, 1]);
            t.expect(sorter.scanRangeForIndex(1, 1, 2, property, dir, cmp)).toEqual([1, 1]);
            t.expect(sorter.scanRangeForIndex(1, 1, 1, property, dir, cmp)).toEqual([1, 0]);
            t.expect(sorter.scanRangeForIndex(1, 1, 3, property, dir, cmp)).toEqual([1, 2]);
            t.expect(sorter.scanRangeForIndex(1, 1, 4, property, dir, cmp)).toEqual([1, 3]);
            t.expect(sorter.scanRangeForIndex(1, 1, 25, property, dir, cmp)).toEqual([1, 24]);
            t.expect(sorter.scanRangeForIndex(1, 1, 26, property, dir, cmp)).toBe(1);

        });
    });


    t.it("scanRangeForIndex() - sort ASC - page 2 - 4", function(t) {

        var dir    = 'ASC',
            sorter = createSorter({
                sorters : [{property : 'testPropForIndexLookup', direction : dir}]
            }),
            cmp       = sorter.getCompareFunction(),
            property  = 'testPropForIndexLookup';

        t.waitForMs(550, function() {

            t.expect(sorter.getPageMap().map[2]).toBeDefined();
            t.expect(sorter.getPageMap().map[3]).toBeDefined();
            t.expect(sorter.getPageMap().map[4]).toBeDefined();
            t.expect(sorter.scanRangeForIndex(2, 4, 22, property, dir, cmp)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(2, 4, 26, property, dir, cmp)).toEqual([2, 0]);
            t.expect(sorter.scanRangeForIndex(2, 4, 50, property, dir, cmp)).toEqual([2, 24]);
            t.expect(sorter.scanRangeForIndex(2, 4, 180, property, dir, cmp)).toBe(1);
            t.expect(sorter.scanRangeForIndex(2, 4, 48, property, dir, cmp)).toEqual([2, 22]);
            t.expect(sorter.scanRangeForIndex(2, 4, 99, property, dir, cmp)).toEqual([4, 23]);

        });
    });


    t.it("scanRangeForIndex() - sort DESC - page 1 (2)", function(t) {

        var sorter = createSorter({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = sorter.getCompareFunction(),
            property  = 'testPropForIndexLookup';

        t.waitForMs(550, function() {

            t.expect(sorter.scanRangeForIndex(1, 1, 476, property, 'DESC', cmp)).toEqual([1, 24]);
            t.expect(sorter.scanRangeForIndex(1, 1, 475, property, 'DESC', cmp)).toBe(1);
            t.expect(sorter.scanRangeForIndex(1, 1, 501, property, 'DESC', cmp)).toBe(-1)

        });
    });


    t.it("scanRangeForIndex() - sort DESC - page 2 - 4", function(t) {

        var sorter = createSorter({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = sorter.getCompareFunction(),
            property  = 'testPropForIndexLookup';

        t.waitForMs(550, function() {

            t.expect(sorter.getPageMap().map[2]).toBeDefined();
            t.expect(sorter.getPageMap().map[3]).toBeDefined();
            t.expect(sorter.getPageMap().map[4]).toBeDefined();
            t.expect(sorter.scanRangeForIndex(2, 4, 476, property, 'DESC', cmp)).toBe(-1);
            t.expect(sorter.scanRangeForIndex(2, 4, 475, property, 'DESC', cmp)).toEqual([2, 0]);
            t.expect(sorter.scanRangeForIndex(2, 4, 426, property, 'DESC', cmp)).toEqual([3, 24]);
            t.expect(sorter.scanRangeForIndex(2, 4, 1, property, 'DESC', cmp)).toBe(1);
            t.expect(sorter.scanRangeForIndex(2, 4, 453, property, 'DESC', cmp)).toEqual([2, 22]);
            t.expect(sorter.scanRangeForIndex(2, 4, 402, property, 'DESC', cmp)).toEqual([4, 23]);

        });
    });


    t.it("scanRangeForIndex() - ignoreId ASC", function(t) {

        var sorter = createSorter({
                sorters : [{property : 'testPropForIndexLookup', direction : 'ASC'}]
            }),
            cmp       = sorter.getCompareFunction(),
            property  = 'testPropForIndexLookup';

        t.waitForMs(550, function() {

            t.expect(sorter.getPageMap().map[1]).toBeDefined();
            t.expect(sorter.scanRangeForIndex(1, 1, 1, property, 'ASC', cmp, '1')).toEqual([1, 1]);
            t.expect(sorter.scanRangeForIndex(1, 1, 1, property, 'ASC', cmp)).toEqual([1, 0]);
        });
    });


    t.it("scanRangeForIndex() - ignoreId DESC", function(t) {

        var sorter = createSorter({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            cmp       = sorter.getCompareFunction(),
            property  = 'testPropForIndexLookup';

        t.waitForMs(550, function() {

            t.expect(sorter.getPageMap().map[1]).toBeDefined();
            t.expect(sorter.scanRangeForIndex(1, 1, 500, property, 'DESC', cmp, '500')).toEqual([1, 1]);
            t.expect(sorter.scanRangeForIndex(1, 1, 500, property, 'DESC', cmp)).toEqual([1, 0]);
        });
    });

    t.it("findInsertIndex() - exception", function(t) {

        var sorter = createSorter({
                sorters : [
                    {property : 'testPropForIndexLookup', direction : 'DESC'},
                    {property : 'foo', direction : 'DESC'}
                ]
            }),
            pageMap = sorter.getPageMap(),
            exc, e;

        t.waitForMs(550, function() {

            try {sorter.findInsertIndex(prop(476));}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('one sorter');
        });
    });


    t.it("findInsertIndex() - sort DESC -  between page 1 and page 3, page 2 not available", function(t) {

        var sorter = createSorter({
                sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
            }),
            pageMap = sorter.getPageMap();

        t.waitForMs(550, function() {

            pageMap.removeAtKey(2);
            t.expect(sorter.getPageMap().map[1]).toBeDefined();
            t.expect(sorter.getPageMap().map[2]).not.toBeDefined();
            t.expect(sorter.getPageMap().map[3]).toBeDefined();

            t.expect(sorter.findInsertIndex(prop(476))).toEqual([1, 24]);
            t.expect(sorter.findInsertIndex(prop(475))).toBe(0);
            t.expect(sorter.findInsertIndex(prop(450))).toEqual([3, 0]);
            t.expect(sorter.findInsertIndex(prop(451))).toBe(0);

        });
    });


    t.it("findInsertIndex() - sort DESC - last page available", function(t) {

        var sorter = createSorter({
            sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
        });

        t.waitForMs(250, function() {

            sorter.getPageMap().getStore().loadPage(20);

            t.waitForMs(250, function() {
                t.expect(sorter.getPageMap().map[20]).toBeDefined();
                t.expect(sorter.findInsertIndex(prop(0))).toEqual([20, 24]);
            });
        });

    });


    t.it("findInsertIndex() - sort DESC - last page not available", function(t) {

        var sorter = createSorter({
            sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
        });

        t.waitForMs(550, function() {
            t.expect(sorter.getPageMap().map[20]).not.toBeDefined();

            t.expect(sorter.findInsertIndex(prop(0))).toBe(1);

        });

    });


    t.it("findInsertIndex() - sort DESC -  page 1 not available", function(t) {

        var sorter = createSorter({
            sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
        });

        t.waitForMs(550, function() {
            t.expect(sorter.getPageMap().map[1]).toBeDefined();
            sorter.getPageMap().removeAtKey(1);
            t.expect(sorter.getPageMap().map[1]).toBeUndefined();
            t.expect(sorter.getPageMap().map[2]).toBeDefined();

            // next page starts at 475
            t.expect(sorter.findInsertIndex(prop(476))).toBe(-1);

        });

    });



})});
