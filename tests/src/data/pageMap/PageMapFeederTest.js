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
        createFeed = function(cfg) {
            return Ext.create('conjoon.cn_core.data.pageMap.Feed', cfg);
        },
        createFeedFilled = function(cfg, full) {

            let feed = createFeed(cfg);

            for (var i = 0, len = cfg.size; i < len; i++) {
                if (full || (i % 2 === 0)) {
                    feed.data.push(prop());
                }
            }

            return feed;
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


        },
        expectFeedData = function(feeder, page, index, t) {

            var feed     = feeder.feeder[page],
                pageSize = feeder.getPageMap().getPageSize();

            t.expect(feed).toBeDefined();

            for (var i = index[0]; i <= index[1]; i++) {
                t.expect(feed[i]).toBeDefined();
            }

            // check undefined data
            for (var i = 0; i < index[0]; i++) {
                t.expect(feed[i]).toBeUndefined();
            }
            for (var i = index[1] + 1; i < pageSize; i++) {
                t.expect(feed[i]).toBeUndefined();
            }


        };

// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------


t.requireOk('conjoon.cn_core.fixtures.sim.ItemSim', function(){
t.requireOk('conjoon.cn_core.data.pageMap.PageMapFeeder', function(){
t.requireOk('conjoon.cn_core.data.pageMap.Feed', function(){

    const Feed = conjoon.cn_core.data.pageMap.Feed;
    const PageMapFeeder = conjoon.cn_core.data.pageMap.PageMapFeeder;

    t.it("prerequisites", function(t) {

        var ls, exc, e;

        t.expect(PageMapFeeder.ACTION_ADD).toBeDefined();
        t.expect(PageMapFeeder.ACTION_REMOVE).toBeDefined();
        t.expect(PageMapFeeder.ACTION_REMOVE).not.toBe(PageMapFeeder.ACTION_ADD);

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

        t.expect(ls.mixins).toBeDefined()
        t.expect(ls.mixins['conjoon.cn_core.data.pageMap.ArgumentFilter']).toBeDefined();

        try {ls.setPageMap(null);} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('already set');
    });


    /**
     * getFeedAt
     */
    t.it('getFeedAt()', function(t) {

        let exc, e, feed = createFeed({
                size     : 25,
                previous : 7
            }),
            feeder = createFeeder();

        t.isCalled('filterPageValue', feeder);

        feeder.feed[8] = feed;

        t.expect(feeder.getFeedAt(8)).toBe(feed);
        t.expect(feeder.feed[1]).toBeUndefined();
        t.expect(feeder.getFeedAt(1)).toBe(null);
    });


    /**
     * isPageCandidate
     */
    t.it('isPageCandidate()', function(t) {
        let exc, e, candidate = createFeedFilled({
                size     : 25,
                previous : 7
            }, true),
            nocandidate = createFeedFilled({
                size : 25,
                next : 2
            }, false)
        feeder = createFeeder();

        t.isCalled('filterPageValue', feeder);

        feeder.feed[8] = candidate;
        feeder.feed[1] = nocandidate;

        t.expect(feeder.isPageCandidate(1)).toBe(false);
        t.expect(feeder.isPageCandidate(8)).toBe(true);
    });


    /**
     * createFeedAt
     */
    t.it('createFeedAt()', function(t) {

        let exc, e, ret, feed,
            feeder   = createFeeder(),
            pageMap  = feeder.getPageMap(),
            pageSize = pageMap.getPageSize();

        t.isCalled('filterPageValue', feeder);

        pageMap.map[1] = {};
        try{feeder.createFeedAt(1)}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("unexpected page at");
        exc = undefined;

        pageMap.map[3] = {};
        try{feeder.createFeedAt(2)}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must not have two neighbour pages");
        exc = undefined;


        delete pageMap.map[1];
        delete pageMap.map[3];
        try{feeder.createFeedAt(2, 1)}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("at least one neighbour page");
        exc = undefined;

        delete pageMap.map[1];
        delete pageMap.map[2];
        delete pageMap.map[3];
        feeder.feed = {};
        feeder.feed[2] = Ext.create(Feed, {size : pageSize, previous : 1});
        pageMap.map[3] = {};
        try{feeder.createFeedAt(2)}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("the computed");
        exc = undefined;

        delete pageMap.map[1];
        delete pageMap.map[2];
        delete pageMap.map[3];
        feeder.feed = {};
        feeder.feed[3] = Ext.create(Feed, {size : pageSize, next : 4});
        pageMap.map[2] = {};
        try{feeder.createFeedAt(3)}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("the computed");
        exc = undefined;

        delete pageMap.map[1];
        delete pageMap.map[2];
        delete pageMap.map[3];
        feeder.feed = {};
        pageMap.map[2] = {};

        t.expect(feeder.createFeedAt(3).getPrevious()).toBe(2);
        t.expect(feeder.createFeedAt(1).getNext()).toBe(2);

        delete pageMap.map[1];
        delete pageMap.map[2];
        delete pageMap.map[3];
        feeder.feed = {}
        pageMap.map[3] = {};

        ret = feeder.createFeedAt(2);
        t.expect(ret instanceof Feed).toBe(true);

        t.expect(feeder.createFeedAt(2)).toBe(ret);

        t.expect(feeder.createFeedAt(2)).toBe(feeder.getFeedAt(2));
    });


    t.it("fillFeed() - exception", function(t){

        let exc, e,
            feeder  = createFeeder(),
            pageMap = feeder.getPageMap(),
            pageSize = pageMap.getPageSize();

        t.isCalledNTimes('filterPageValue', feeder, 1);

        try{feeder.fillFeed(1, prop());}catch (e) {exc = e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("does not exist");
        t.expect(exc.msg.toLowerCase()).toContain("feed");
        exc = undefined;
    });


    t.it("fillFeed()", function(t){

        var exc, e, feed, p, p1, p2,
            feeder  = createFeeder(),
            pageMap = feeder.getPageMap();


        delete pageMap.map[1];
        pageMap.map[2] = {};

        feeder.createFeedAt(1);


        p  = prop();
        p1 = prop();
        p2 = prop();
        t.expect(feeder.fillFeed(1, p)).toEqual([]);

        t.expect(feeder.getFeedAt(1).getAt(pageMap.getPageSize() - 1).getId()).toBe(p.getId());

        t.expect(feeder.fillFeed(1, [p1, p2])).toEqual([]);

        t.expect(feeder.getFeedAt(1).getAt(pageMap.getPageSize() - 1).getId()).toBe(p2.getId());
        t.expect(feeder.getFeedAt(1).getAt(pageMap.getPageSize() - 2).getId()).toBe(p1.getId());
        t.expect(feeder.getFeedAt(1).getAt(pageMap.getPageSize() - 3).getId()).toBe(p.getId());

    });


    t.it('findFeedIndexesForActionAtPage() - exception' , function(t) {

        let exc, e,
            feeder    = createFeeder(),
            PageRange = conjoon.cn_core.data.pageMap.PageRange,
            ADD       = PageMapFeeder.ACTION_ADD,
            REMOVE    = PageMapFeeder.ACTION_REMOVE;

        try{feeder.findFeedIndexesForActionAtPage(1, 'foo');}catch (e) {exc = e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be any of");
        t.expect(exc.msg.toLowerCase()).toContain("action");
        exc = undefined;

    });


    t.it('hasPreviousFeed()', function(t) {
        var exc, e,
            feeder    = createFeeder(),
            pageMap   = feeder.getPageMap();

        t.waitForMs(250, function() {
            t.expect(feeder.hasPreviousFeed(5)).toBe(false);

            pageMap.removeAtKey(4);
            pageMap.removeAtKey(3);

            feeder.createFeedAt(4);

            t.expect(feeder.hasPreviousFeed(5)).toBe(true);
        });
    });


    t.it('hasNextFeed()', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            pageMap   = feeder.getPageMap();

        t.waitForMs(250, function() {
            t.expect(feeder.hasNextFeed(5)).toBe(false);

            pageMap.removeAtKey(6);
            pageMap.removeAtKey(7);

            feeder.createFeedAt(6);

            t.expect(feeder.hasNextFeed(5)).toBe(true);
        });
    });


    t.it('findFeedIndexesForActionAtPage()', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            PageRange = conjoon.cn_core.data.pageMap.PageRange,
            ADD       = PageMapFeeder.ACTION_ADD,
            REMOVE    = PageMapFeeder.ACTION_REMOVE;

        t.waitForMs(250, function() {

            t.expect(feeder.findFeedIndexesForActionAtPage(5, ADD)).toEqual([[13]]);
            t.expect(feeder.findFeedIndexesForActionAtPage(4, ADD)).toEqual([[13]]);

            t.expect(feeder.findFeedIndexesForActionAtPage(5, REMOVE)).toEqual([[12]]);
            t.expect(feeder.findFeedIndexesForActionAtPage(4, REMOVE)).toEqual([[12]]);

            //[1, 2, 3, 4, 5] [7, 8, 9, 10, 11, 12]
            feeder.getPageMap().removeAtKey(6);
            t.expect(feeder.findFeedIndexesForActionAtPage(6, ADD)).toBe(null);
            t.expect(feeder.findFeedIndexesForActionAtPage(6, REMOVE)).toBe(null);
            t.expect(feeder.findFeedIndexesForActionAtPage(5, ADD)).toEqual([[6], [7, 13]]);
            t.expect(feeder.findFeedIndexesForActionAtPage(5, REMOVE)).toBe(null);
            t.expect(feeder.findFeedIndexesForActionAtPage(7, REMOVE)).toEqual([[12]]);
            t.expect(feeder.findFeedIndexesForActionAtPage(7, ADD)).toEqual([[13]]);
            t.expect(feeder.findFeedIndexesForActionAtPage(1, ADD)).toEqual([[6], [7, 13]]);

            // [1, 2], [4, 5], [7, 8, 9, 10, 11, 12]
            // 1, ADD:    [1, 2] (3) (4) [5] (6) (7)[8, 9, 10, 11, 12] (13)
            // 5, REMOVE: -1
            feeder.getPageMap().removeAtKey(3);
            t.expect(feeder.findFeedIndexesForActionAtPage(1, ADD)).toEqual([[3], [4, 6], [7, 13]]);
            t.expect(feeder.findFeedIndexesForActionAtPage(5, REMOVE)).toBe(null);
            t.expect(feeder.findFeedIndexesForActionAtPage(7, REMOVE)).toEqual([[12]]);
            t.expect(feeder.findFeedIndexesForActionAtPage(7, ADD)).toEqual([[13]]);

            // [1, 2] [5] [8, 9, 10, 11, 12]
            feeder.getPageMap().removeAtKey(3);
            feeder.getPageMap().removeAtKey(4);
            feeder.getPageMap().removeAtKey(6);
            feeder.getPageMap().removeAtKey(7);
            console.log(feeder.getPageMap().map);
            t.expect(feeder.findFeedIndexesForActionAtPage(5, REMOVE)).toBe(null);
            t.expect(feeder.findFeedIndexesForActionAtPage(5, ADD)).toEqual([[6], [8, 13]]);

            feeder.feed[3] = [prop()];
            try {feeder.findFeedIndexesForActionAtPage(3, ADD)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('cannot be determined');
            exc = undefined;

            // [1, 2] [5] [8, 9], [11, 12]
            feeder.getPageMap().removeAtKey(3);
            feeder.getPageMap().removeAtKey(4);
            feeder.getPageMap().removeAtKey(6);
            feeder.getPageMap().removeAtKey(7);
            feeder.getPageMap().removeAtKey(10);

            t.expect(feeder.findFeedIndexesForActionAtPage(1, ADD)).toEqual([[3], [8, 10], [11, 13]]);
            t.expect(feeder.findFeedIndexesForActionAtPage(1, REMOVE)).toEqual([[2], [7, 9], [10, 12]]);
            t.expect(feeder.findFeedIndexesForActionAtPage(5, REMOVE)).toBe(null);

            // [1, 2] [5] [8, 9], [11, 12] (13)
            // WITH FEED FOR ACTION REMOVE
            feeder.getPageMap().removeAtKey(3);
            feeder.getPageMap().removeAtKey(4);
            feeder.getPageMap().removeAtKey(6);
            feeder.getPageMap().removeAtKey(7);
            feeder.getPageMap().removeAtKey(10);
            feeder.createFeedAt(13);
            t.expect(feeder.getFeedAt(13).getPrevious()).toBe(12);

            t.expect(feeder.findFeedIndexesForActionAtPage(1, ADD)).toEqual([[3], [8, 10], [11, 13]]);
            t.expect(feeder.findFeedIndexesForActionAtPage(1, REMOVE)).toEqual([[2], [7, 9], [10, 13]]);
            t.expect(feeder.findFeedIndexesForActionAtPage(12, REMOVE)).toEqual([[13]]);


            // [1, 2] [5] (7) [8, 9], [11, 12] (13)
            // WITH FEED FOR ACTION ADD
            feeder.getPageMap().removeAtKey(3);
            feeder.getPageMap().removeAtKey(4);
            feeder.getPageMap().removeAtKey(6);
            feeder.getPageMap().removeAtKey(7);
            feeder.getPageMap().removeAtKey(10);
            delete feeder.feed[13];
            t.expect(feeder.getFeedAt(13)).toBe(null);
            feeder.createFeedAt(7);
            t.expect(feeder.getFeedAt(7).getNext()).toBe(8);

            t.expect(feeder.findFeedIndexesForActionAtPage(1, ADD)).toEqual([[3], [7, 10], [11, 13]]);
            t.expect(feeder.findFeedIndexesForActionAtPage(1, REMOVE)).toEqual([[2], [7, 9], [10, 12]]);


            // [1, 2] [5] [8, 9], [11, 12] (13)
            feeder.getPageMap().removeAtKey(3);
            feeder.getPageMap().removeAtKey(4);
            feeder.getPageMap().removeAtKey(6);
            feeder.getPageMap().removeAtKey(7);
            feeder.getPageMap().removeAtKey(10);
            delete feeder.feed[13];
            delete feeder.feed[7];
            t.expect(feeder.getFeedAt(13)).toBe(null);
            t.expect(feeder.getFeedAt(7)).toBe(null);

            t.expect(feeder.findFeedIndexesForActionAtPage(9, ADD)).toEqual([[10], [11, 13]]);
            t.expect(feeder.findFeedIndexesForActionAtPage(9, REMOVE)).toBe(null);

            // [1, 2] [5] [8, 9], (10), (11) [12]
            feeder.getPageMap().removeAtKey(3);
            feeder.getPageMap().removeAtKey(4);
            feeder.getPageMap().removeAtKey(6);
            feeder.getPageMap().removeAtKey(7);
            feeder.getPageMap().removeAtKey(10);
            feeder.getPageMap().removeAtKey(11);
            delete feeder.feed[13];
            delete feeder.feed[7];
            t.expect(feeder.getFeedAt(13)).toBe(null);
            t.expect(feeder.getFeedAt(7)).toBe(null);
            feeder.createFeedAt(10);
            t.expect(feeder.getFeedAt(10).getPrevious()).toBe(9);
            feeder.createFeedAt(11);
            t.expect(feeder.getFeedAt(11).getNext()).toBe(12);


            t.expect(feeder.findFeedIndexesForActionAtPage(9, ADD)).toEqual([[10], [11, 13]]);
            t.expect(feeder.findFeedIndexesForActionAtPage(9, REMOVE)).toEqual([[10]]);


        });

    });


    t.it('swapMapToFeed() - exceptions', function(t) {

        var exc, e,
            feeder = createFeeder();

        t.waitForMs(250, function() {


            feeder.getPageMap().removeAtKey(5);
            try {feeder.swapMapToFeed(5)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('does not exist');
            t.expect(exc.msg.toLowerCase()).toContain('page');
            exc = undefined;

            feeder.feed[8] = {};
            try {feeder.swapMapToFeed(8)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('already exists');
            t.expect(exc.msg.toLowerCase()).toContain('feed');
            exc = undefined;

        });

    });


    t.it('swapMapToFeed()', function(t) {

        let exc, e, page, newFeed,
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
            pageMap.removeAtKey(page + 1);


            t.expect(feeder.getFeedAt(page)).toBe(null);
            t.expect(feeder.getPageMap().peekPage(page)).toBeTruthy();

            collect(pageMap.map[page].value);
            newFeed = feeder.swapMapToFeed(page);
            t.expect(newFeed instanceof conjoon.cn_core.data.pageMap.Feed).toBe(true);

            t.expect(feeder.getPageMap().peekPage(page)).toBeFalsy();
            t.expect(feeder.getFeedAt(page)).toBeDefined();
            t.expect(feeder.getFeedAt(page)).toBe(newFeed);

            t.expect(feeder.getPageMap().getPageSize()).toBeGreaterThan(0);

            for (var i = 0, len = feeder.getPageMap().getPageSize(); i < len; i++) {
                t.expect(feeder.getFeedAt(page).getAt(i) instanceof Ext.data.Model).toBe(true);
                t.expect(feeder.getFeedAt(page).getAt(i).data).toEqual(mapValues[i].data);
            }


        });

    });


    t.it('removeFeedAt()', function(t) {

        var newFeed, page = 5,
            feeder  = createFeeder(),
            pageMap = feeder.getPageMap();

        t.waitForMs(250, function() {

            pageMap.removeAtKey(page);
            pageMap.removeAtKey(page + 1);
            newFeed = feeder.createFeedAt(page);

            t.expect(newFeed).toBeTruthy();
            t.expect(feeder.getFeedAt(page)).not.toBe(null);

            t.expect(feeder.removeFeedAt(page)).toBe(true);
            t.expect(feeder.removeFeedAt(page + 1)).toBe(false);

            t.expect(feeder.getFeedAt(page)).toBe(null);
        });

    });


    t.it('swapFeedToMap() - exceptions', function(t) {
        let exc, e, page, newFeed,
            feeder    = createFeeder(),
            pageMap   = feeder.getPageMap(),
            mapValues = [];

        t.waitForMs(250, function() {

            page = 5;

            try{feeder.swapFeedToMap(page);}catch(e){exc = e};
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("does still exist");

            pageMap.removeAtKey(page);

            try{feeder.swapFeedToMap(page);}catch(e){exc = e};
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("does not exist");
        });
    });


    t.it('swapFeedToMap()', function(t) {
        let exc, e, page, newFeed,
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
            pageMap.removeAtKey(page + 1);

            // swap to Feed
            newFeed = feeder.swapMapToFeed(page);
            t.expect(newFeed instanceof conjoon.cn_core.data.pageMap.Feed).toBe(true);
            t.expect(feeder.getPageMap().peekPage(page)).toBeFalsy();
            collect(newFeed.toArray());


            // swap to Map
            feeder.swapFeedToMap(page);
            t.expect(feeder.getFeedAt(page)).toBe(null);
            t.expect(feeder.getPageMap().peekPage(page)).toBeDefined();
            t.expect(pageMap.map[page].value.length).toBeGreaterThan(0);

            for (var i = 0, len = pageMap.map[page].value.length; i < len; i++) {
                t.expect(pageMap.map[page].value[i] instanceof Ext.data.Model).toBe(true);
                t.expect(pageMap.map[page].value[i].data).toEqual(mapValues[i].data);
            }


        });
    });


    t.it('sanitizeFeedsForActionAtPage() - exceptions', function(t) {
        var exc, e,
            feeder = createFeeder();

        t.waitForMs(250, function() {

            try {feeder.sanitizeFeedsForActionAtPage(8)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be any of');
            t.expect(exc.msg.toLowerCase()).toContain('action');
            exc = undefined;

            feeder.getPageMap().removeAtKey(5);
            feeder.getPageMap().removeAtKey(6);

            feeder.createFeedAt(5);
            try {feeder.sanitizeFeedsForActionAtPage(5, conjoon.cn_core.data.pageMap.PageMapFeeder.ACTION_ADD)} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('processed');
            t.expect(exc.msg.toLowerCase()).toContain('feed');
            exc = undefined;

        });

    });


    t.it('sanitizeFeedsForActionAtPage() - A', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            pageMap   = feeder.getPageMap(),
            PageRange = conjoon.cn_core.data.pageMap.PageRange,
            ADD       = PageMapFeeder.ACTION_ADD,
            REMOVE    = PageMapFeeder.ACTION_REMOVE;

        t.waitForMs(250, function() {

            // [1, 2] [5] [8, 9] [12]
            // 1 ADD
            // [1, 2] [5] [8, 9] [12] -> REMOVE 5, 12
            // 1 REMOVE
            // [1, 2] [5] [8, 9] [12] -> REMOVE 5, 12

            for (var i = 1; i <= 12; i++) {
                t.expect(pageMap.map[i]).toBeTruthy();
            }

            feeder.getPageMap().removeAtKey(3);
            feeder.getPageMap().removeAtKey(4);
            feeder.getPageMap().removeAtKey(6);
            feeder.getPageMap().removeAtKey(7);
            feeder.getPageMap().removeAtKey(10);
            feeder.getPageMap().removeAtKey(11);

            feeder.sanitizeFeedsForActionAtPage(1, ADD);

            t.expect(pageMap.map[1]).toBeTruthy();
            t.expect(pageMap.map[2]).toBeTruthy();
            t.expect(pageMap.map[3]).toBeFalsy();
            t.expect(pageMap.map[4]).toBeFalsy();
            t.expect(pageMap.map[5]).toBeFalsy();
            t.expect(pageMap.map[6]).toBeFalsy();
            t.expect(pageMap.map[7]).toBeFalsy();
            t.expect(pageMap.map[8]).toBeTruthy();
            t.expect(pageMap.map[9]).toBeTruthy();
            t.expect(pageMap.map[10]).toBeFalsy();
            t.expect(pageMap.map[11]).toBeFalsy();
            t.expect(pageMap.map[12]).toBeFalsy();


        });
    });


    t.it('sanitizeFeedsForActionAtPage() - B', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            pageMap   = feeder.getPageMap(),
            PageRange = conjoon.cn_core.data.pageMap.PageRange,
            ADD       = PageMapFeeder.ACTION_ADD,
            REMOVE    = PageMapFeeder.ACTION_REMOVE;

        t.waitForMs(250, function() {

            // [1, 2] [8, 9],(10:9),[12]
            // FEED 10 is previous:9
            // FIRST: IS FEED PAGE CANDIDATE? -> ADD PAGE
            // -> [1, 2] [8, 9, 10], [12] -> 12 removed

            for (var i = 1; i <= 12; i++) {
                t.expect(pageMap.map[i]).toBeTruthy();
            }

            feeder.getPageMap().removeAtKey(3);
            feeder.getPageMap().removeAtKey(4);
            feeder.getPageMap().removeAtKey(6);
            feeder.getPageMap().removeAtKey(7);
            feeder.getPageMap().removeAtKey(11);

            feeder.swapMapToFeed(10);

            t.expect(feeder.getFeedAt(10)).toBeTruthy();
            t.expect(feeder.getFeedAt(10).getPrevious()).toBe(9);

            feeder.sanitizeFeedsForActionAtPage(1, ADD);

            t.expect(pageMap.map[1]).toBeTruthy();
            t.expect(pageMap.map[2]).toBeTruthy();
            t.expect(pageMap.map[3]).toBeFalsy();
            t.expect(pageMap.map[4]).toBeFalsy();
            t.expect(pageMap.map[5]).toBeFalsy();
            t.expect(pageMap.map[6]).toBeFalsy();
            t.expect(pageMap.map[7]).toBeFalsy();
            t.expect(pageMap.map[8]).toBeTruthy();
            t.expect(pageMap.map[9]).toBeTruthy();
            t.expect(pageMap.map[10]).toBeTruthy();
            t.expect(pageMap.map[11]).toBeFalsy();
            t.expect(pageMap.map[12]).toBeFalsy();


        });
    });


    t.it('sanitizeFeedsForActionAtPage() - C', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            PageRange = conjoon.cn_core.data.pageMap.PageRange,
            ADD       = PageMapFeeder.ACTION_ADD,
            REMOVE    = PageMapFeeder.ACTION_REMOVE;

        t.waitForMs(250, function() {


            // [1, 2] [8, 9],(10:9),[12]
            // REMOVE 1 -> OKAY, 10 NOT EMPTY
            // 12 removed
            feeder.getPageMap().removeAtKey(3);
            feeder.getPageMap().removeAtKey(4);
            feeder.getPageMap().removeAtKey(5);
            feeder.getPageMap().removeAtKey(6);
            feeder.getPageMap().removeAtKey(7);
            feeder.getPageMap().removeAtKey(10);
            feeder.getPageMap().removeAtKey(11);

            t.expect(feeder.createFeedAt(10).getPrevious()).toBe(9);

            feeder.getFeedAt(10).fill([Ext.create('Ext.data.Model')])

            feeder.sanitizeFeedsForActionAtPage(1, REMOVE);

            t.expect(feeder.getPageMap().peekPage(12)).toBeFalsy();
            t.expect(feeder.getFeedAt(10)).toBeTruthy();
        });

    });


    t.it('sanitizeFeedsForActionAtPage() - D', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            PageRange = conjoon.cn_core.data.pageMap.PageRange,
            ADD       = PageMapFeeder.ACTION_ADD,
            REMOVE    = PageMapFeeder.ACTION_REMOVE;

        t.waitForMs(250, function() {


            // [1, 2] [8, 9],(10:9),[12]
            // REMOVE 1 -> FEED 10 EMPTY REMOVE
            // -> [1, 2] [8, 9], [12] -> reloadForView 12
            feeder.getPageMap().removeAtKey(3);
            feeder.getPageMap().removeAtKey(4);
            feeder.getPageMap().removeAtKey(5);
            feeder.getPageMap().removeAtKey(6);
            feeder.getPageMap().removeAtKey(7);
            feeder.getPageMap().removeAtKey(10);
            feeder.getPageMap().removeAtKey(11);

            t.expect(feeder.createFeedAt(10).getPrevious()).toBe(9);

            feeder.sanitizeFeedsForActionAtPage(1, REMOVE);

            t.expect(feeder.getPageMap().peekPage(12)).toBeFalsy();
            t.expect(feeder.getFeedAt(10)).toBeFalsy();
        });
    });


    t.it('sanitizeFeedsForActionAtPage() - E', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            PageRange = conjoon.cn_core.data.pageMap.PageRange,
            ADD       = PageMapFeeder.ACTION_ADD,
            REMOVE    = PageMapFeeder.ACTION_REMOVE;

        t.waitForMs(250, function() {


            // [1, 2] (8:9) [9],(10:9),[12]
            // REMOVE 1 -> FEED 10 EMPTY REMOVE
            // -> [1, 2] [8, 9], [12] -> reloadForView 12
            feeder.getPageMap().removeAtKey(3);
            feeder.getPageMap().removeAtKey(4);
            feeder.getPageMap().removeAtKey(5);
            feeder.getPageMap().removeAtKey(6);
            feeder.getPageMap().removeAtKey(7);
            feeder.getPageMap().removeAtKey(8);
            feeder.getPageMap().removeAtKey(10);
            feeder.getPageMap().removeAtKey(11);

            t.expect(feeder.createFeedAt(8).getNext()).toBe(9);
            t.expect(feeder.createFeedAt(10).getPrevious()).toBe(9);

            feeder.sanitizeFeedsForActionAtPage(1, REMOVE);

            t.expect(feeder.getPageMap().peekPage(12)).toBeFalsy();
            t.expect(feeder.getFeedAt(10)).toBeFalsy();
            t.expect(feeder.getFeedAt(8)).toBeFalsy();
        });
    });


    t.it('sanitizeFeedsForActionAtPage() - F', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            PageRange = conjoon.cn_core.data.pageMap.PageRange,
            ADD       = PageMapFeeder.ACTION_ADD,
            REMOVE    = PageMapFeeder.ACTION_REMOVE;

        t.waitForMs(250, function() {


            // [1, 2] (8: 9) [9],(10:9),[12]
            // ADD 1 -> FEED 8 EMPTY - REMOVE, FEED 9 EMPTY - REMOVE, REMOVE 9
            // -> [1, 2] [12] -> reloadForView 12
            feeder.getPageMap().removeAtKey(3);
            feeder.getPageMap().removeAtKey(4);
            feeder.getPageMap().removeAtKey(5);
            feeder.getPageMap().removeAtKey(6);
            feeder.getPageMap().removeAtKey(7);
            feeder.getPageMap().removeAtKey(8);
            feeder.getPageMap().removeAtKey(10);
            feeder.getPageMap().removeAtKey(11);

            t.expect(feeder.createFeedAt(8).getNext()).toBe(9);
            t.expect(feeder.createFeedAt(10).getPrevious()).toBe(9);

            feeder.sanitizeFeedsForActionAtPage(1, ADD);

            t.expect(feeder.getPageMap().peekPage(12)).toBeFalsy();
            t.expect(feeder.getFeedAt(8)).toBeFalsy();
            t.expect(feeder.getPageMap().peekPage(9)).toBeFalsy();
            t.expect(feeder.getFeedAt(10)).toBeFalsy();

        });

    });


    t.it('sanitizeFeedsForActionAtPage() - G', function(t) {

        var exc, e,
            feeder    = createFeeder(),
            PageRange = conjoon.cn_core.data.pageMap.PageRange,
            ADD       = PageMapFeeder.ACTION_ADD,
            REMOVE    = PageMapFeeder.ACTION_REMOVE;

        t.waitForMs(250, function() {

            // [1, 2], [4, 5], [7, 8, 9, 10, 11, 12]
            // 1, ADD:    [1, 2] (3) (4) [5] (6) (7)[8, 9, 10, 11, 12] (13)
            // 5, REMOVE: -1
            feeder.getPageMap().removeAtKey(3);
            feeder.getPageMap().removeAtKey(6);

            let testit = function() {
                t.expect(feeder.getPageMap().peekPage(1)).toBeTruthy();
                t.expect(feeder.getPageMap().peekPage(1)).toBeTruthy();

                t.expect(feeder.getPageMap().peekPage(3)).toBeFalsy();

                t.expect(feeder.getPageMap().peekPage(4)).toBeTruthy();
                t.expect(feeder.getPageMap().peekPage(5)).toBeTruthy();

                t.expect(feeder.getPageMap().peekPage(6)).toBeFalsy();

                t.expect(feeder.getPageMap().peekPage(7)).toBeTruthy();
                t.expect(feeder.getPageMap().peekPage(8)).toBeTruthy();
                t.expect(feeder.getPageMap().peekPage(9)).toBeTruthy();
                t.expect(feeder.getPageMap().peekPage(10)).toBeTruthy();
                t.expect(feeder.getPageMap().peekPage(11)).toBeTruthy();
                t.expect(feeder.getPageMap().peekPage(12)).toBeTruthy();


            };

            testit();
            t.expect(feeder.sanitizeFeedsForActionAtPage(1, ADD)).toBe(true);
            testit();
            t.expect(feeder.sanitizeFeedsForActionAtPage(7, ADD)).toBe(true);
            testit();
            t.expect(feeder.sanitizeFeedsForActionAtPage(1, REMOVE)).toBe(true);
            testit();
            t.expect(feeder.sanitizeFeedsForActionAtPage(6, REMOVE)).toBe(false);
            testit()
            t.expect(feeder.sanitizeFeedsForActionAtPage(6, ADD)).toBe(false);
            testit();
        });

    });




    return;

    /*













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



        t.it('removeRecord() - found in feed', function(t) {

            var exc, e, rec, op,
                feeder   = createFeeder(),
                pageMap  = feeder.getPageMap(),
                pageSize = pageMap.getPageSize(),
                feeds;

            t.waitForMs(250, function() {

                feeds = feeder.feeder;

                pageMap.removeAtKey(1);
                pageMap.removeAtKey(5);

                rec = pageMap.map[3].value[5];

                t.expect(pageMap.map[3].value.length).toBe(25);
                op = feeder.removeRecord(rec, 1);
                testOp(op, {
                    success : true,
                    reason  : conjoon.cn_core.data.pageMap.operation.ResultReason.OK
                }, t);

                t.expect(pageMap.map[3].value.length).toBe(25);


                t.expect(feeder.feeder[4]).toBeDefined();
                t.expect(feeder.feeder[4].length).toBe(24);

                rec = feeds[4][2];
                op  = feeder.removeRecord(rec, 1);
                testOp(op, {
                    success : true,
                    reason  : conjoon.cn_core.data.pageMap.operation.ResultReason.OK
                }, t);
                t.expect(feeds[4].length).toBe(23);


                // test recycle
                feeds[4].splice(1, 22);
                t.expect(feeds[4].length).toBe(1);
                rec = feeds[4][0];
                op  = feeder.removeRecord(rec, 1);
                testOp(op, {
                    success : true,
                    reason  : conjoon.cn_core.data.pageMap.operation.ResultReason.OK
                }, t);
                t.expect(feeds[4]).toBeUndefined();
                t.expect(feeder.recycledFeeds.indexOf(4)).not.toBe(-1);


            });

        });


        t.it('removeRecord() - removed record not available in indexMap anymore', function(t) {
            t.fail();
        });

        t.it('removeRecord() - shifted records not available in indexMap anymore', function(t) {
            t.fail();
        });



     */





    return;

    t.it('removeRecord() - all ranges properly considered', function(t) {

        var exc, e,
            feeder  = createFeeder(),
            pageMap = feeder.getPageMap(),
            pageSize = pageMap.getPageSize(),
            indexEnd = pageSize - 1;

        t.waitForMs(250, function() {

            // [3, 4, 5] [7, 8]
            pageMap.removeAtKey(1);
            pageMap.removeAtKey(2);
            // 3
            // 4
            // 5
            pageMap.removeAtKey(6);
            // 7
            // 8
            pageMap.removeAtKey(9);
            pageMap.removeAtKey(10);

            // remove 3, 2
            // becomes:
            // [3, 4] *5* *6* [7] *8*

            feeder.removeRecord(pageMap.map[3].value[1], 1);

            t.expect(feeder.feeder[5]).toBeDefined();
            t.expect(feeder.feeder[6]).toBeDefined();
            t.expect(feeder.feeder[8]).toBeDefined();

            expectFeedData(feeder, 5, [0, indexEnd - 1], t);
            expectFeedData(feeder, 6, [indexEnd, indexEnd], t);
            expectFeedData(feeder, 8, [0, indexEnd -1], t);

        });

    });


    t.it('removeRecord() - all ranges properly considered (2)', function(t) {

        var exc, e,
            feeder  = createFeeder(),
            pageMap = feeder.getPageMap(),
            pageSize = pageMap.getPageSize(),
            indexEnd = pageSize - 1;

        t.waitForMs(250, function() {

            // [3, 4, 5] [7, 8]
            pageMap.removeAtKey(1);
            pageMap.removeAtKey(2);
            // 3
            // 4
            // 5
            pageMap.removeAtKey(6);
            // 7
            // 8
            pageMap.removeAtKey(9);
            pageMap.removeAtKey(10);

            // remove 3, 2
            // becomes:
            // [3, 4]  [6, 7]
            for (var i = 0, len = pageSize; i < len; i++) {
                feeder.removeRecord(pageMap.map[3].value[i], 1);
            }

            t.expect(feeder.feeder[5]).not.toBeDefined();
            t.expect(feeder.feeder[6]).not.toBeDefined();
            t.expect(feeder.feeder[8]).not.toBeDefined();

            t.expect(pageMap.map[3]).toBeDefined();
            t.expect(pageMap.map[4]).toBeDefined();
            t.expect(pageMap.map[5]).not.toBeDefined();
            t.expect(pageMap.map[6]).toBeDefined();
            t.expect(pageMap.map[7]).toBeDefined();
            t.expect(pageMap.map[8]).not.toBeDefined();


        });

    });


})})})});
