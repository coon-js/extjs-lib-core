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
        var store;

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

        return Ext.create('conjoon.cn_core.data.pageMap.IndexLookup', {
            pageMap : store.getData()
        });

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


    t.it("findInsertIndex() - sort DESC -  page 1", function(t) {

        var sorter = createSorter({
            sorters : [{property : 'testPropForIndexLookup', direction : 'DESC'}]
        });

        t.waitForMs(550, function() {
            t.expect(sorter.getPageMap().map[1]).toBeDefined();
            t.expect(sorter.findInsertIndex(prop(8000))).toEqual([1, 0]);
            t.expect(sorter.findInsertIndex(prop(500.5))).toEqual([1, 0]);
            t.expect(sorter.findInsertIndex(prop(499.5))).toEqual([1, 1]);
            t.expect(sorter.findInsertIndex(prop(499))).toEqual([1, 1]);
            t.expect(sorter.findInsertIndex(prop(500))).toEqual([1, 0]);
            t.expect(sorter.findInsertIndex(prop(498))).toEqual([1, 2]);
            t.expect(sorter.findInsertIndex(prop(497))).toEqual([1, 3]);
            t.expect(sorter.findInsertIndex(prop(476))).toEqual([1, 24]);

        });
    });




})});
