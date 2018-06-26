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
        },
        testOp = function(op, expected, t) {

            var Operation = conjoon.cn_core.data.pageMap.operation;
            t.expect(op instanceof Operation.Operation).toBe(true);
            t.expect(op.getRequest() instanceof Operation.RemoveRequest).toBe(true);
            t.expect(op.getResult() instanceof Operation.Result).toBe(true);

            t.expect(op.getResult().getSuccess()).toBe(expected.success);

            if (expected.reason) {
                t.expect(op.getResult().getReason()).toBe(expected.reason);
            }


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

        t.waitForMs(250, function() {
            t.expect(feeder.isFeedMarkedForRecycling(4)).toBe(false);
            feeder.recycledFeeds = [897, 224, 255, 363623,4];

            try {feeder.isFeedMarkedForRecycling(4)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('is marked for recycling, but');
            exc = undefined;

            feeder.getPageMap().removeAtKey(4);
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

    });


    t.it('canUseFeederAt()', function(t) {

        var exc, e,
            feeder = createFeeder();

        t.waitForMs(250, function() {

            feeder.feeder[4] =  {};
            try {feeder.canUseFeederAt(4)}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('a feeder for');
            exc = undefined;

            feeder.feeder =  {};

            t.expect(feeder.canUseFeederAt(4)).toBe(true);
            feeder.recycledFeeds = [897, 224, 255, 363623,4];

            try {feeder.canUseFeederAt(4)}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('is marked for recycling');
            exc = undefined;

            feeder.getPageMap().removeAtKey(4);
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


    t.it('findFeederIndexForPage() - up', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            PageRange = conjoon.cn_core.data.pageMap.PageRange;

        t.waitForMs(250, function() {

            t.expect(feeder.findFeederIndexForPage(5, 1)).toBe(12);
            t.expect(feeder.findFeederIndexForPage(4, 1)).toBe(12);

            feeder.getPageMap().removeAtKey(6);
            feeder.recycledFeeds = [6];
            t.expect(feeder.findFeederIndexForPage(6, 1)).toBe(-1);

            feeder.getPageMap().removeAtKey(5);
            t.expect(feeder.findFeederIndexForPage(5, 1)).toBe(-1);
            t.expect(feeder.findFeederIndexForPage(7, 1)).toBe(12);

            feeder.feeder[6] = {};
            t.expect(feeder.findFeederIndexForPage(4, 1)).toBe(-1);

            feeder.feeder[5] = {};
            t.expect(feeder.findFeederIndexForPage(5, 1)).toBe(-1);

            feeder.getPageMap().removeAtKey(1);
            t.expect(feeder.findFeederIndexForPage(1, 1)).toBe(-1);

            try {feeder.findFeederIndexForPage('uioi')} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be a number');
            t.expect(exc.msg.toLowerCase()).toContain('page');
            exc = undefined;

            try {feeder.findFeederIndexForPage(5)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be -1 or 1');
            t.expect(exc.msg.toLowerCase()).toContain('direction');
            exc = undefined;

        });

    });


    t.it('findFeederIndexForPage() - down', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            PageRange = conjoon.cn_core.data.pageMap.PageRange;

        t.waitForMs(250, function() {

            feeder.getPageMap().removeAtKey(1);

            t.expect(feeder.findFeederIndexForPage(5, -1)).toBe(2);
            t.expect(feeder.findFeederIndexForPage(4, -1)).toBe(2);

            feeder.recycledFeeds = [6];
            t.expect(feeder.findFeederIndexForPage(6, -1)).toBe(2);

            feeder.getPageMap().removeAtKey(5);
            t.expect(feeder.findFeederIndexForPage(5, -1)).toBe(-1);

            // exception - 5 is not in page map anymore
            // 6 is crecycled but still pan PageMap
            try {t.expect(feeder.findFeederIndexForPage(6, -1));} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            exc = undefined;

            feeder.feeder[3] = {};
            t.expect(feeder.findFeederIndexForPage(4, -1)).toBe(2);

            feeder.feeder[5] = {};
            t.expect(feeder.findFeederIndexForPage(5, -1)).toBe(-1);

            feeder.getPageMap().removeAtKey(1);
            t.expect(feeder.findFeederIndexForPage(1, -1)).toBe(-1);

            try {feeder.findFeederIndexForPage('uioi')} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be a number');
            t.expect(exc.msg.toLowerCase()).toContain('page');
            exc = undefined;

            try {feeder.findFeederIndexForPage(5)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be -1 or 1');
            t.expect(exc.msg.toLowerCase()).toContain('direction');
            exc = undefined;

        });

    });


    t.it('findFeederIndexForPage() - up', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            PageRange = conjoon.cn_core.data.pageMap.PageRange;

        t.waitForMs(250, function() {
            feeder.feeder[5] = {};
            // ignores feeder at 5, since we start looking for possible feeder at the end.
            t.expect(feeder.findFeederIndexForPage(4, 1)).toBe(12);

        });

    });


    t.it('findFeederIndexForPage() - up (removed page, existing feeder)', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            PageRange = conjoon.cn_core.data.pageMap.PageRange;

        t.waitForMs(250, function() {

            feeder.getPageMap().removeAtKey(12);
            feeder.feeder[12] = {};
            // ignores feeder at 5, since we start looking for possible feeder at the end.
            t.expect(feeder.findFeederIndexForPage(4, 1)).toBe(12);

        });

    });


    t.it('findFeederIndexForPage() - up (removed page, recycled feeder)', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            PageRange = conjoon.cn_core.data.pageMap.PageRange;

        t.waitForMs(250, function() {

            feeder.getPageMap().removeAtKey(12);
            feeder.recycledFeeds = [12];
            // ignores feeder at 5, since we start looking for possible feeder at the end.
            t.expect(feeder.findFeederIndexForPage(4, 1)).toBe(11);

        });

    });


    t.it('findFeederIndexForPage() - down (removed page, existing feeder)', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            PageRange = conjoon.cn_core.data.pageMap.PageRange;

        t.waitForMs(250, function() {

            feeder.getPageMap().removeAtKey(1);
            feeder.feeder[1] = {};
            // ignores feeder at 5, since we start looking for possible feeder at the end.
            t.expect(feeder.findFeederIndexForPage(4, -1)).toBe(1);

            feeder.getPageMap().removeAtKey(3);
            feeder.feeder[3] = {};
            // ignores feeder at 5, since we start looking for possible feeder at the end.
            t.expect(feeder.findFeederIndexForPage(4, -1)).toBe(3);

        });

    });


    t.it('findFeederIndexForPage() - no siblings', function(t) {
        var exc, e,
            feeder    = createFeeder(),
            pageMap   = feeder.getPageMap();

        t.waitForMs(250, function() {
            pageMap.removeAtKey(4);
            pageMap.removeAtKey(6)

            t.expect(feeder.findFeederIndexForPage(5, 1)).toBe(-1);
            t.expect(feeder.findFeederIndexForPage(5, -1)).toBe(-1);
        });
    });


    t.it('findFeederIndexForPage() - no siblings (2)', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            pageMap   = feeder.getPageMap();

        t.waitForMs(250, function() {

            pageMap.removeAtKey(4);
            pageMap.removeAtKey(7)

            t.expect(pageMap.map[5]).toBeDefined();
            t.expect(pageMap.map[6]).toBeDefined();

            t.expect(feeder.findFeederIndexForPage(6, 1)).toBe(-1);
            t.expect(feeder.findFeederIndexForPage(6, -1)).toBe(5); // -
            t.expect(feeder.findFeederIndexForPage(5, -1)).toBe(-1);
            t.expect(feeder.findFeederIndexForPage(5, 1)).toBe(6); // -

        });
    });


    t.it('findFeederIndexForPage() - no siblings (3)', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            pageMap   = feeder.getPageMap();

        t.waitForMs(250, function() {

            feeder.feeder[7] = {};

            pageMap.removeAtKey(4);
            pageMap.removeAtKey(7)

            t.expect(pageMap.map[5]).toBeDefined();
            t.expect(pageMap.map[6]).toBeDefined();

            t.expect(feeder.findFeederIndexForPage(6, 1)).toBe(7);
        });
    });




    t.it('swapMapToFeeder() - exceptions', function(t) {

        var exc, e,
            feeder = createFeeder();

        t.waitForMs(250, function() {

            try {feeder.swapMapToFeeder('uioi')} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be a number');
            t.expect(exc.msg.toLowerCase()).toContain('page');
            exc = undefined;


            feeder.recycledFeeds = [4];
            try {feeder.swapMapToFeeder(4)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('already marked for');
            t.expect(exc.msg.toLowerCase()).toContain('page');
            exc = undefined;

            feeder.getPageMap().removeAtKey(5);
            try {feeder.swapMapToFeeder(5)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('does not exist');
            t.expect(exc.msg.toLowerCase()).toContain('page');
            exc = undefined;


            feeder.getPageMap().removeAtKey(5);
            try {feeder.swapMapToFeeder(5)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('does not exist');
            t.expect(exc.msg.toLowerCase()).toContain('page');
            exc = undefined;

            feeder.feeder[8] = {};
            try {feeder.swapMapToFeeder(8)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('already exists');
            t.expect(exc.msg.toLowerCase()).toContain('feeder');
            exc = undefined;

        });

    });


    t.it('swapMapToFeeder()', function(t) {

        var exc, e, page,
            feeder    = createFeeder(),
            pageMap   = feeder.getPageMap(),
            mapValues = [],
            collect   = function(data) {
                for (var i = 0, len = data.length; i<  len; i++) {
                    mapValues.push(data[i].clone());
                }
            };

        t.waitForMs(250, function() {

            page = 5;

            t.expect(feeder.feeder[page]).toBeUndefined();
            t.expect(feeder.recycledFeeds.indexOf(page)).toBe(-1);
            t.expect(feeder.getPageMap().map[page]).toBeTruthy();

            collect(pageMap.map[page].value);
            feeder.swapMapToFeeder(page);

            t.expect(feeder.getPageMap().map[page]).toBeFalsy();
            t.expect(feeder.feeder[page]).toBeDefined();
            t.expect(feeder.getPageMap().getPageSize()).toBeGreaterThan(0);
            t.expect(mapValues.length).toBe(feeder.getPageMap().getPageSize());
            t.expect(feeder.feeder[page].length).toBe(mapValues.length);

            for (var i = 0, len = feeder.getPageMap().getPageSize(); i < len; i++) {
                t.expect(feeder.feeder[page][i] instanceof Ext.data.Model).toBe(true);
                t.expect(feeder.feeder[page][i].data).toEqual(mapValues[i].data);
            }


        });

    });


    t.it('clear()', function(t) {

        var exc, e,
            feeder    = createFeeder();

        t.waitForMs(250, function() {

            feeder.feeder        = {0  : []};
            feeder.recycledFeeds = [8];

            feeder.clear();

            t.expect(feeder.feeder).toEqual({});
            t.expect(feeder.recycledFeeds).toEqual([]);
        });

    });


    t.it('recycleFeeder() - exceptions', function(t) {

        var exc, e,
            feeder = createFeeder();

        t.waitForMs(250, function() {

            try {feeder.recycleFeeder('uioi')} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be a number');
            t.expect(exc.msg.toLowerCase()).toContain('page');
            exc = undefined;

            try {feeder.recycleFeeder(4)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('does not exist');
            t.expect(exc.msg.toLowerCase()).toContain('page');
            exc = undefined;

            feeder.feeder[4] = [1];
            try {feeder.recycleFeeder(4)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('is not empty');
            t.expect(exc.msg.toLowerCase()).toContain('page');
            exc = undefined;

            feeder.feeder[4] = [];
            feeder.recycledFeeds = [4];
            try {feeder.recycleFeeder(4)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('is already marked');
            t.expect(exc.msg.toLowerCase()).toContain('page');
            exc = undefined;

        });

    });


    t.it('recycleFeeder()', function(t) {

        var exc, e,
            feeder = createFeeder();

        t.waitForMs(250, function() {

            feeder.feeder[4] = [];
            t.expect(feeder.recycledFeeds).toEqual([]);

            feeder.recycleFeeder(4);

            t.expect(feeder.feeder[4]).toBeUndefined();
            t.expect(feeder.recycledFeeds).toEqual([4]);

        });

    });


    t.it('createFeeder() - exceptions', function(t) {

        var exc, e,
            feeder = createFeeder();

        t.waitForMs(250, function() {

            try {feeder.createFeeder('uioi')} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be a number');
            t.expect(exc.msg.toLowerCase()).toContain('page');
            exc = undefined;

            try {feeder.createFeeder(4)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be -1 or 1');
            t.expect(exc.msg.toLowerCase()).toContain('direction');
            exc = undefined;


        });

    });


    t.it('createFeeder() - -1', function(t) {

        var exc, e,
            feeder = createFeeder();

        t.waitForMs(250, function() {

            t.expect(feeder.createFeeder(13, 1)).toBe(-1);


        });

    });


    t.it('createFeeder() - n', function(t) {

        var exc, e,
            feeder = createFeeder();

        t.waitForMs(250, function() {

            t.expect(feeder.feeder[12]).toBeUndefined();
            t.expect(feeder.createFeeder(4, 1)).toBe(12);
            t.expect(feeder.feeder[12]).toBeDefined();

        });

    });


    t.it('feedPage() - exceptions', function(t) {

        var exc, e,
            feeder  = createFeeder(),
            pageMap = feeder.getPageMap();

        t.waitForMs(250, function() {

            try {feeder.feedPage('uioi')} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be a number');
            t.expect(exc.msg.toLowerCase()).toContain('page');
            exc = undefined;

            try {feeder.feedPage(4)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be -1 or 1');
            t.expect(exc.msg.toLowerCase()).toContain('direction');
            exc = undefined;


            try {feeder.feedPage(14, 1)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('does not exist');
            t.expect(exc.msg.toLowerCase()).toContain('page');
            exc = undefined;


        });

    });



    t.it('feedPage() - down', function(t) {

        var exc, e,
            feeder  = createFeeder(),
            pageMap = feeder.getPageMap(),
            removePage = 5, targetPage = 2,
            itemCount = 3,
            pageSize = pageMap.getPageSize();

        t.waitForMs(250, function() {

            pageMap.removeAtKey(removePage);

            for (var i = 0, len = itemCount; i < len; i++) {
                pageMap.map[targetPage].value.pop();
            }

            t.expect(pageMap.map[targetPage].value.length).toBe(pageSize - itemCount);

            feeder.feedPage(targetPage, 1);


            var tmp = targetPage;
            while (tmp < removePage - 1) {
                t.expect(pageMap.map[tmp].value.length).toBe(pageSize);
                tmp++;
            }

            t.expect(feeder.feeder[removePage - 1]).toBeDefined();
            t.expect(feeder.feeder[removePage - 1].length).toBe(pageSize - itemCount);

        });

    });

    t.it('feedPage() - down (2)', function(t) {

        var exc, e,
            feeder  = createFeeder(),
            pageMap = feeder.getPageMap(),
            removePage = 5, targetPage = 2,
            itemCount = 25,
            pageSize = pageMap.getPageSize();

        t.waitForMs(250, function() {

            pageMap.removeAtKey(removePage);

            t.expect(feeder.createFeeder(targetPage, 1)).toBe(4);

            t.expect(feeder.feeder[4]).toBeDefined();
            feeder.feeder[4].pop();
            feeder.feeder[4].pop();
            feeder.feeder[4].pop();
            t.expect(feeder.feeder[4].length).toBe(pageSize - 3);

            for (var i = 0, len = itemCount; i < len; i++) {
                pageMap.map[targetPage].value.pop();
            }

            t.expect(pageMap.map[targetPage].value.length).toBe(pageSize - itemCount);

            feeder.feedPage(targetPage, 1);

            t.expect(pageMap.map[3]).toBeUndefined();
            t.expect(pageMap.map[4]).toBeUndefined();
            t.expect(feeder.feeder[4]).toBeUndefined();
            t.expect(feeder.feeder[3]).toBeDefined();
            t.expect(feeder.feeder[3].length).toBe(22);

            t.expect(pageMap.map[2].value.length).toBe(pageSize);

            t.expect(feeder.recycledFeeds).toEqual([4]);

        });

    });


    t.it('feedPage() - up', function(t) {

        var exc, e,
            feeder  = createFeeder(),
            pageMap = feeder.getPageMap(),
            removePage = 1, targetPage = 5,
            itemCount = 3,
            pageSize = pageMap.getPageSize();

        t.waitForMs(250, function() {

            pageMap.removeAtKey(removePage);

            for (var i = 0, len = itemCount; i < len; i++) {
                pageMap.map[targetPage].value.shift();
            }

            t.expect(pageMap.map[targetPage].value.length).toBe(pageSize - itemCount);

            feeder.feedPage(targetPage, -1);

            var tmp = removePage + 2;
            while (tmp < targetPage + 1) {
                t.expect(pageMap.map[tmp].value.length).toBe(pageSize);
                tmp++;
            }

            t.expect(feeder.feeder[removePage + 1]).toBeDefined();
            t.expect(feeder.feeder[removePage + 1].length).toBe(pageSize - itemCount);

        });

    });


    t.it('feedPage() - up (2)', function(t) {

        var exc, e,
            feeder      = createFeeder(),
            pageMap     = feeder.getPageMap(),
            removePage  = 1, targetPage = 5,
            itemCount   = 25,
            PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
            pageSize    = pageMap.getPageSize(),
            indizes     = [] ;

        t.waitForMs(250, function() {

            t.isCalled('maintainIndexMap', PageMapUtil);

            pageMap.removeAtKey(removePage);

            feeder.createFeeder(targetPage, -1);

            t.expect(feeder.feeder[2]).toBeDefined();

            // remove in feeder and make sure indexMap is updated
            delete pageMap.indexMap[feeder.feeder[2].pop().internalId];
            delete pageMap.indexMap[feeder.feeder[2].pop().internalId];
            delete pageMap.indexMap[feeder.feeder[2].pop().internalId];


            // remove in targetpage
            for (var i = 0, len = itemCount; i < len; i++) {
                delete pageMap.indexMap[
                    pageMap.map[targetPage].value.shift().internalId];
            }

            t.expect(pageMap.map[targetPage].value.length).toBe(pageSize - itemCount);

            feeder.feedPage(targetPage, -1);


            t.expect(feeder.feeder[2]).toBeUndefined();
            t.expect(feeder.feeder[3]).toBeDefined();
            t.expect(feeder.feeder[3].length).toBe(22);
            t.expect(pageMap.map[3]).toBeUndefined();
            t.expect(pageMap.map[4]).toBeDefined()
            t.expect(pageMap.map[4].value.length).toBe(pageSize);

            for (var i in pageMap.map) {
                for (var a = 0, lena = pageMap.map[i].value.length; a < lena; a++) {
                    indizes.push(pageMap.indexMap[pageMap.map[i].value[a].internalId]);
                }
            }

            for (var i = 0, len = indizes.length; i < len; i++) {
                if (!indizes[i]) {
                    t.fail("unexpected undefined index in indexMap: "  + i + '; ' + indizes[i]);
                }
                if (indizes.indexOf(indizes[i], i + 1) !== -1) {
                    t.fail("unexpected duplicate index in indexMap: " + i + '; ' + indizes[i]);
                }
            }


        });

    });



    t.it('removeRecord() - exceptions', function(t) {

        var exc, e,
            feeder  = createFeeder(),
            pageMap  = feeder.getPageMap();

        t.waitForMs(250, function() {

            try {feeder.removeRecord('uioi')} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
            t.expect(exc.msg.toLowerCase()).toContain('record');
            exc = undefined;


        });

    });


    t.it('removeRecord() - not found', function(t) {

        var exc, e,
            feeder  = createFeeder(),
            pageMap  = feeder.getPageMap();

        t.waitForMs(250, function() {

            var op = feeder.removeRecord(prop(10000000000), 1);


            testOp(op, {
                success : false,
                reason  : conjoon.cn_core.data.pageMap.operation.ResultReason.RECORD_NOT_FOUND
            }, t);
        });

    });


    t.it('removeRecord() - found', function(t) {

        var exc, e, rec, op,
            feeder   = createFeeder(),
            pageMap  = feeder.getPageMap(),
            pageSize = pageMap.getPageSize();

        t.waitForMs(250, function() {

            rec = pageMap.map[3].value[5];

            t.expect(pageMap.map[3].value.length).toBe(25);
            op = feeder.removeRecord(rec, 1);
            t.expect(pageMap.map[3].value.length).toBe(25);

            testOp(op, {
                success : true,
                reason  : conjoon.cn_core.data.pageMap.operation.ResultReason.OK
            }, t);

        });

    });


})});
