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

describe('conjoon.cn_core.data.pageMap.PageMapFeederTest', function(t) {

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
        createFeeder = function() {

            return Ext.create('conjoon.cn_core.data.pageMap.PageMapFeeder', {
                pageMap : createPageMap()
            });
        };

// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------


t.requireOk('conjoon.cn_core.fixtures.sim.ItemSim', function(){


    t.it("prerequisites", function(t) {

        var ls, exc, e;

        try {Ext.create('conjoon.cn_core.data.pageMap.PageMapFeeder')} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('is required');

        try {Ext.create('conjoon.cn_core.data.pageMap.PageMapFeeder', {pageMap : null})} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');

        ls = Ext.create('conjoon.cn_core.data.pageMap.PageMapFeeder', {
            pageMap : Ext.create('Ext.data.PageMap')
        });

        t.expect(ls instanceof conjoon.cn_core.data.pageMap.PageMapFeeder).toBe(true);

        try {ls.setPageMap(null);} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('already set');
    });


    t.it('isFeedMarkedForRecycling()', function(t) {

        var  exc, e,
            feeder = createFeeder();

        t.expect(feeder.isFeedMarkedForRecycling(4)).toBe(false);
        feeder.recycledFeeds = [897, 224, 255, 363623,4];
        t.expect(feeder.isFeedMarkedForRecycling(4)).toBe(true);

        try {feeder.isFeedMarkedForRecycling(0)} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('must be a number');
        exc = undefined;


        try {feeder.isFeedMarkedForRecycling('uioi')} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('must be a number');
        exc = undefined;

    });


    t.it('canUseFeederAt()', function(t) {

        var exc, e,
            feeder = createFeeder();

        t.waitForMs(250, function() {

            t.expect(feeder.canUseFeederAt(4)).toBe(true);
            feeder.recycledFeeds = [897, 224, 255, 363623,4];
            t.expect(feeder.canUseFeederAt(4)).toBe(false);

            try {feeder.canUseFeederAt(0)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be a number');
            exc = undefined;


            try {feeder.canUseFeederAt('uioi')} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be a number');
            exc = undefined;

            feeder.recycledFeeds = [];
            feeder.getPageMap().removeAtKey(4);
            t.expect(feeder.canUseFeederAt(4)).toBe(false);

            feeder.feeder[4] = {};
            t.expect(feeder.canUseFeederAt(4)).toBe(true);

            feeder.recycledFeeds = [4];
            t.expect(feeder.canUseFeederAt(4)).toBe(false);

        });

    });


    t.it('findFeederIndexForRange()', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            PageRange = conjoon.cn_core.data.pageMap.PageRange;

        t.waitForMs(250, function() {

            t.expect(feeder.findFeederIndexForRange(PageRange.create(4, 5))).toBe(12);
            t.expect(feeder.findFeederIndexForRange(PageRange.create(4))).toBe(12);

            feeder.recycledFeeds = [6];
            t.expect(feeder.findFeederIndexForRange(PageRange.create(4, 5, 6))).toBe(12);

            feeder.getPageMap().removeAtKey(5);
            t.expect(feeder.findFeederIndexForRange(PageRange.create(4, 5))).toBe(4);
            t.expect(feeder.findFeederIndexForRange(PageRange.create(4, 5, 6))).toBe(12);

            feeder.feeder[6] = {};
            t.expect(feeder.findFeederIndexForRange(PageRange.create(4, 5))).toBe(4);

            feeder.feeder[5] = {};
            t.expect(feeder.findFeederIndexForRange(PageRange.create(4, 5))).toBe(5);



            try {feeder.findFeederIndexForRange('uioi')} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
            exc = undefined;

        });

    });


})});
