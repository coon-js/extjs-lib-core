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

    Ext.define("MockModel", {
        extend: "Ext.data.Model",
        fields: [{
            name: "testPropForIndexLookup",
            type: "int"
        }]
    });

    const loadPages = function (store, pages) {

            store.loadPage(pages.shift(), {

                callback: function () {
                    if (pages.length) {
                        loadPages(store, pages);
                    }
                }

            });

        },
        expectPages = function (pages, pageMap, t) {

            for (let i = 0; i < pages.length; i++) {
                t.expect(pageMap.peekPage(pages[i])).toBeTruthy();
            }
        };

    var createPageMap = function (cfg) {
            var store;

            store = Ext.create("Ext.data.BufferedStore", {
                model: "MockModel",
                autoLoad: true,
                sorters: cfg.sorters,
                pageSize: 25,
                fields: ["id", "testProp"],
                proxy: {
                    type: "rest",
                    url: "cn_core/fixtures/PageMapItems",
                    extraParams: {
                        empty: cfg.empty
                    },
                    reader: {
                        type: "json",
                        rootProperty: "data"
                    }
                }
            });


            return store.getData();
        },
        prop = function (testProperty, id) {
            let cfg = {
                testPropForIndexLookup: testProperty
            };
            if (id) {
                cfg.id = "" + id;
            }
            return Ext.create("MockModel", cfg);
        },
        propsMax  = function (length, startId) {

            let data = [];

            for (var i = 0;  i < length; i++) {
                data.push(prop(
                    startId ? startId + i : undefined,
                    startId ? startId + i : undefined
                ));
            }

            return data;

        },
        createFeeder = function (cfg) {

            cfg = cfg || {};

            return Ext.create("coon.core.data.pageMap.PageMapFeeder", {
                pageMap: createPageMap(cfg)
            });
        },
        createFeed = function (cfg) {
            return Ext.create("coon.core.data.pageMap.Feed", cfg);
        },
        createFeedFilled = function (cfg, full) {

            let feed = createFeed(cfg);

            for (var i = 0, len = cfg.size; i < len; i++) {
                if (full || (i % 2 === 0)) {
                    feed.data.push(prop());
                }
            }

            return feed;
        },
        testOp = function (op, expected, t) {

            var Operation = coon.core.data.pageMap.Operation;
            t.expect(op instanceof Operation).toBe(true);
            t.expect(Ext.isObject(op.getResult())).toBe(true);

            t.expect(op.getResult().success).toBe(expected.success);


        },
        toIntMap = function (arr) {
            return arr.map(function (v){return parseInt(v, 10);});
        };


    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------


    t.requireOk("coon.core.fixtures.sim.ItemSim", function (){
        t.requireOk("coon.core.data.pageMap.PageMapFeeder", function (){
            t.requireOk("coon.core.data.pageMap.Feed", function (){
                t.requireOk("coon.core.data.pageMap.IndexLookup", () => {

                    const Feed          = coon.core.data.pageMap.Feed,
                        PageMapFeeder = coon.core.data.pageMap.PageMapFeeder;


                    t.it("prerequisites", (t) => {

                        var ls, exc;

                        t.expect(PageMapFeeder.ACTION_ADD).toBeDefined();
                        t.expect(PageMapFeeder.ACTION_REMOVE).toBeDefined();
                        t.expect(PageMapFeeder.ACTION_REMOVE).not.toBe(PageMapFeeder.ACTION_ADD);

                        try {Ext.create("coon.core.data.pageMap.PageMapFeeder");} catch (e) {exc = e;}
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("is required");

                        try {Ext.create("coon.core.data.pageMap.PageMapFeeder", {pageMap: null});} catch (e) {exc = e;}
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");

                        try {Ext.create("coon.core.data.pageMap.PageMapFeeder", { pageMap: Ext.create("Ext.data.PageMap")});} catch (e) {exc = e;}
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("valid store");

                        try {Ext.create("coon.core.data.pageMap.PageMapFeeder", { pageMap:
          Ext.create("Ext.data.PageMap", {store: Ext.create("Ext.data.Store")})});} catch (e) {exc = e;}
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("valid store");

                        ls = Ext.create("coon.core.data.pageMap.PageMapFeeder", {
                            pageMap: Ext.create("Ext.data.PageMap", {store: Ext.create("Ext.data.BufferedStore")})
                        });

                        t.expect(ls instanceof coon.core.data.pageMap.PageMapFeeder).toBe(true);

                        t.expect(ls.mixins).toBeDefined();
                        t.expect(ls.mixins["coon.core.data.pageMap.ArgumentFilter"]).toBeDefined();

                        try {ls.setPageMap(null);} catch (e) {exc = e;}
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("already set");
                    });


                    t.it("getFeedAt()", (t) => {

                        let feed = createFeed({
                                size: 25,
                                previous: 7
                            }),
                            feeder = createFeeder();

                        t.isCalled("filterPageValue", feeder);

                        feeder.feed[8] = feed;

                        t.expect(feeder.getFeedAt(8)).toBe(feed);
                        t.expect(feeder.feed[1]).toBeUndefined();
                        t.expect(feeder.getFeedAt(1)).toBe(null);
                    });


                    t.it("isPageCandidate()", (t) => {
                        let candidate = createFeedFilled({
                                size: 25,
                                previous: 7
                            }, true),
                            nocandidate = createFeedFilled({
                                size: 25,
                                next: 2
                            }, false);
                        let feeder = createFeeder();

                        t.isCalled("filterPageValue", feeder);

                        feeder.feed[8] = candidate;
                        feeder.feed[1] = nocandidate;

                        t.expect(feeder.isPageCandidate(1)).toBe(false);
                        t.expect(feeder.isPageCandidate(8)).toBe(true);
                    });


                    t.it("createFeedAt()", (t) => {

                        let exc, ret,
                            feeder   = createFeeder(),
                            pageMap  = feeder.getPageMap(),
                            pageSize = pageMap.getPageSize();

                        t.isCalled("filterPageValue", feeder);

                        pageMap.map[1] = {};
                        try{feeder.createFeedAt(1, 2);}catch(e){exc=e;}
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("unexpected page at");
                        exc = undefined;

                        try{feeder.createFeedAt(1, 8);}catch(e){exc=e;}
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("targetpage");
                        exc = undefined;

                        delete pageMap.map[1];
                        delete pageMap.map[3];
                        try{feeder.createFeedAt(2, 1);}catch(e){exc=e;}
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("at least one neighbour page");
                        exc = undefined;

                        delete pageMap.map[1];
                        delete pageMap.map[2];
                        delete pageMap.map[3];
                        feeder.feed = {};
                        feeder.feed[2] = Ext.create(Feed, {size: pageSize, previous: 1});
                        pageMap.map[3] = {};
                        try{feeder.createFeedAt(2, 3);}catch(e){exc=e;}
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("the computed");
                        exc = undefined;

                        delete pageMap.map[1];
                        delete pageMap.map[2];
                        delete pageMap.map[3];
                        feeder.feed = {};
                        feeder.feed[3] = Ext.create(Feed, {size: pageSize, next: 4});
                        pageMap.map[2] = {};
                        try{feeder.createFeedAt(3, 2);}catch(e){exc=e;}
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("the computed");
                        exc = undefined;

                        delete pageMap.map[1];
                        delete pageMap.map[2];
                        delete pageMap.map[3];
                        feeder.feed = {};
                        pageMap.map[2] = {};

                        t.expect(feeder.createFeedAt(3, 2).getPrevious()).toBe(2);
                        t.expect(feeder.createFeedAt(1, 2).getNext()).toBe(2);

                        delete pageMap.map[1];
                        delete pageMap.map[2];
                        delete pageMap.map[3];
                        feeder.feed = {};
                        pageMap.map[3] = {};

                        ret = feeder.createFeedAt(2, 3);
                        t.expect(ret instanceof Feed).toBe(true);

                        t.expect(feeder.createFeedAt(2, 3)).toBe(ret);

                        t.expect(feeder.createFeedAt(2, 3)).toBe(feeder.getFeedAt(2));
                    });


                    t.it("swapMapToFeed() - exceptions", (t) => {

                        var exc,
                            feeder = createFeeder();

                        t.waitForMs(t.parent.TIMEOUT, () => {


                            feeder.getPageMap().removeAtKey(5);
                            try {feeder.swapMapToFeed(5, 4);} catch (e) {exc = e;}
                            t.expect(exc).toBeDefined();
                            t.expect(exc.msg).toBeDefined();
                            t.expect(exc.msg.toLowerCase()).toContain("does not exist");
                            t.expect(exc.msg.toLowerCase()).toContain("page");
                            exc = undefined;

                            feeder.feed[8] = {};
                            try {feeder.swapMapToFeed(8, 9);} catch (e) {exc = e;}
                            t.expect(exc).toBeDefined();
                            t.expect(exc.msg).toBeDefined();
                            t.expect(exc.msg.toLowerCase()).toContain("already exists");
                            t.expect(exc.msg.toLowerCase()).toContain("feed");
                            exc = undefined;
                            feeder.feed = {};

                            try {feeder.swapMapToFeed(8, 4);} catch (e) {exc = e;}
                            t.expect(exc).toBeDefined();
                            t.expect(exc.msg).toBeDefined();
                            t.expect(exc.msg.toLowerCase()).toContain("targetpage");
                            exc = undefined;


                        });

                    });


                    t.it("swapMapToFeed()", (t) => {

                        let page, newFeed,
                            feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap(),
                            mapValues = [],
                            collect   = function (data) {
                                for (var i = 0, len = data.length; i<  len; i++) {
                                    mapValues.push(data[i].clone());
                                }
                            };

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            page = 5;
                            pageMap.removeAtKey(page + 1);


                            t.expect(feeder.getFeedAt(page)).toBe(null);
                            t.expect(feeder.getPageMap().peekPage(page)).toBeTruthy();

                            collect(pageMap.map[page].value);
                            newFeed = feeder.swapMapToFeed(page, page - 1);
                            t.expect(newFeed instanceof coon.core.data.pageMap.Feed).toBe(true);

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


                    t.it("fillFeed() - exception", function (t){

                        let exc,
                            feeder  = createFeeder();

                        t.isCalledNTimes("filterPageValue", feeder, 1);

                        try{feeder.fillFeed(1, prop());}catch (e) {exc = e;}
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("does not exist");
                        t.expect(exc.msg.toLowerCase()).toContain("feed");
                        exc = undefined;
                    });


                    t.it("fillFeed()", function (t){

                        var p, p1, p2,
                            feeder  = createFeeder(),
                            pageMap = feeder.getPageMap();


                        delete pageMap.map[1];
                        pageMap.map[2] = {};

                        feeder.createFeedAt(1, 2);


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


                    t.it("findFeedIndexesForActionAtPage() - exception" , (t) => {

                        let exc,
                            feeder    = createFeeder();

                        try{feeder.findFeedIndexesForActionAtPage(1, "foo");}catch (e) {exc = e;}
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("must be any of");
                        t.expect(exc.msg.toLowerCase()).toContain("action");
                        exc = undefined;

                    });


                    t.it("hasPreviousFeed()", (t) => {
                        var feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap();

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            t.expect(feeder.hasPreviousFeed(5)).toBe(false);

                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(3);

                            feeder.createFeedAt(4, 5);

                            t.expect(feeder.hasPreviousFeed(5)).toBe(true);
                        });
                    });


                    t.it("hasNextFeed()", (t) => {

                        var feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap();

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            t.expect(feeder.hasNextFeed(5)).toBe(false);

                            pageMap.removeAtKey(6);
                            pageMap.removeAtKey(7);

                            feeder.createFeedAt(6, 5);

                            t.expect(feeder.hasNextFeed(5)).toBe(true);
                        });
                    });


                    t.it("groupWithFeeds() - A", (t) => {

                        // [1, 2] (3:2) (4:5)[5](6:5) [ 8, 9] (10:9)
                        //         // groupWithFeedsForPage(1)
                        //         // -> [1, 2, 3] [4, 5, 6] [8, 9 10]
                        //
                        var feeder    = createFeeder();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            feeder.getPageMap().removeAtKey(3);
                            feeder.getPageMap().removeAtKey(4);
                            feeder.getPageMap().removeAtKey(6);
                            feeder.getPageMap().removeAtKey(7);
                            feeder.getPageMap().removeAtKey(10);
                            feeder.getPageMap().removeAtKey(11);
                            feeder.getPageMap().removeAtKey(12);

                            feeder.createFeedAt(3, 2);
                            feeder.createFeedAt(4, 5);
                            feeder.createFeedAt(6, 5);
                            feeder.createFeedAt(10, 9);

                            t.expect(feeder.groupWithFeeds()).toEqual([[1, 2, 3], [4, 5, 6], [8, 9, 10]]);
                        });
                    });


                    t.it("groupWithFeeds() - B", (t) => {

                        // [1, 2] (3:2) (4:5)[5](6:5) [ 8, 9] (10:9)
                        //         // groupWithFeedsForPage(1)
                        //         // -> [1, 2, 3] [4, 5, 6] [8, 9 10]
                        //
                        var feeder = createFeeder();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            feeder.getPageMap().removeAtKey(3);
                            feeder.getPageMap().removeAtKey(4);
                            feeder.getPageMap().removeAtKey(6);
                            feeder.getPageMap().removeAtKey(7);
                            feeder.getPageMap().removeAtKey(10);
                            feeder.getPageMap().removeAtKey(11);
                            feeder.getPageMap().removeAtKey(12);

                            feeder.createFeedAt(3, 2);
                            feeder.createFeedAt(4, 5);
                            feeder.createFeedAt(6, 5);
                            feeder.createFeedAt(10, 9);

                            t.expect(feeder.groupWithFeeds()).toEqual([[1, 2, 3], [4, 5, 6], [8, 9, 10]]);
                        });
                    });


                    t.it("groupWithFeeds() - C", (t) => {

                        // [1, 2] (3:2) (4:5)[5](6:5) [ 8, 9] (10:9)
                        //         // groupWithFeedsForPage(1)
                        //         // -> [1, 2, 3] [4, 5, 6] [8, 9 10]
                        //
                        var feeder = createFeeder();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            feeder.getPageMap().removeAtKey(3);
                            feeder.getPageMap().removeAtKey(4);
                            feeder.getPageMap().removeAtKey(6);
                            feeder.getPageMap().removeAtKey(7);
                            feeder.getPageMap().removeAtKey(10);
                            feeder.getPageMap().removeAtKey(11);
                            feeder.getPageMap().removeAtKey(12);


                            feeder.createFeedAt(4, 5);
                            feeder.createFeedAt(6, 5);
                            feeder.createFeedAt(10, 9);

                            t.expect(feeder.groupWithFeeds()).toEqual([[1, 2], [4, 5, 6], [8, 9, 10]]);
                        });


                    });


                    t.it("groupWithFeeds() - D", (t) => {

                        var feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap(),
                            pageSize  = pageMap.getPageSize();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(9);

                            feeder.createFeedAt(4, 5);
                            feeder.createFeedAt(9, 10);

                            t.expect(feeder.getFeedAt(4).getNext()).toBe(5);
                            t.expect(feeder.getFeedAt(9).getNext()).toBe(10);


                            feeder.getFeedAt(4).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(9).fill(propsMax(pageSize - 1));


                            t.expect(feeder.groupWithFeeds()).toEqual([
                                [1, 2, 3], [4, 5, 6, 7, 8], [9, 10, 11, 12]
                            ]);

                        });


                    });


                    t.it("groupWithFeedsForPage() - A", (t) => {

                        // [1, 2] (3:2) (4:5)[5](6:5) [ 8, 9] (10:9)
                        //         // groupWithFeedsForPage(1)
                        //         // -> [1, 2, 3] [4, 5, 6] [8, 9 10]
                        //
                        var feeder    = createFeeder();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            feeder.getPageMap().removeAtKey(3);
                            feeder.getPageMap().removeAtKey(4);
                            feeder.getPageMap().removeAtKey(6);
                            feeder.getPageMap().removeAtKey(7);
                            feeder.getPageMap().removeAtKey(10);
                            feeder.getPageMap().removeAtKey(11);
                            feeder.getPageMap().removeAtKey(12);

                            feeder.createFeedAt(3, 2);
                            feeder.createFeedAt(4, 5);
                            feeder.createFeedAt(6, 5);
                            feeder.createFeedAt(10, 9);

                            t.expect(feeder.groupWithFeedsForPage(1)).toEqual([[1, 2, 3], [4, 5, 6], [8, 9, 10]]);
                        });
                    });


                    t.it("groupWithFeedsForPage() - B", (t) => {

                        // [1, 2] (3:2) (4:5)[5](6:5) [ 8, 9] (10:9)
                        //         // groupWithFeedsForPage(1)
                        //         // -> [1, 2, 3] [4, 5, 6] [8, 9 10]
                        //
                        var feeder    = createFeeder();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            feeder.getPageMap().removeAtKey(3);
                            feeder.getPageMap().removeAtKey(4);
                            feeder.getPageMap().removeAtKey(6);
                            feeder.getPageMap().removeAtKey(7);
                            feeder.getPageMap().removeAtKey(10);
                            feeder.getPageMap().removeAtKey(11);
                            feeder.getPageMap().removeAtKey(12);

                            feeder.createFeedAt(3, 2);
                            feeder.createFeedAt(4, 5);
                            feeder.createFeedAt(6, 5);
                            feeder.createFeedAt(10, 9);

                            t.expect(feeder.groupWithFeedsForPage(3)).toEqual([[3], [4, 5, 6], [8, 9, 10]]);
                        });
                    });


                    t.it("groupWithFeedsForPage() - C", (t) => {

                        // [1, 2] (3:2) (4:5)[5](6:5) [ 8, 9] (10:9)
                        //         // groupWithFeedsForPage(1)
                        //         // -> [1, 2, 3] [4, 5, 6] [8, 9 10]
                        //
                        var feeder    = createFeeder();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            feeder.getPageMap().removeAtKey(3);
                            feeder.getPageMap().removeAtKey(4);
                            feeder.getPageMap().removeAtKey(6);
                            feeder.getPageMap().removeAtKey(7);
                            feeder.getPageMap().removeAtKey(10);
                            feeder.getPageMap().removeAtKey(11);
                            feeder.getPageMap().removeAtKey(12);


                            feeder.createFeedAt(4, 5);
                            feeder.createFeedAt(6, 5);
                            feeder.createFeedAt(10, 9);

                            t.expect(feeder.groupWithFeedsForPage(3)).toEqual(null);
                        });


                    });


                    t.it("groupWithFeedsForPage() - D", (t) => {

                        var feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap(),
                            pageSize  = pageMap.getPageSize();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(9);

                            feeder.createFeedAt(4, 5);
                            feeder.createFeedAt(9, 10);

                            t.expect(feeder.getFeedAt(4).getNext()).toBe(5);
                            t.expect(feeder.getFeedAt(9).getNext()).toBe(10);


                            feeder.getFeedAt(4).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(9).fill(propsMax(pageSize - 1));


                            t.expect(feeder.groupWithFeedsForPage(3)).toEqual([
                                [3], [4, 5, 6, 7, 8], [9, 10, 11, 12]
                            ]);

                        });


                    });


                    t.it("findFeedIndexesForActionAtPage() - A", (t) => {

                        // - RANGE       = [1, 2] [4, 5] [8, 9 , 10, 11]
                        // - REM (1, 1)  =  [1] (2:1) (3:4) [4] (5:4) (7:8) [8, 9, 10] (11:10)

                        var feeder    = createFeeder(),
                            REMOVE    = PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            feeder.getPageMap().removeAtKey(3);
                            feeder.getPageMap().removeAtKey(6);
                            feeder.getPageMap().removeAtKey(7);
                            feeder.getPageMap().removeAtKey(12);


                            t.expect(feeder.findFeedIndexesForActionAtPage(1, REMOVE)).toEqual(
                                [[2], [3, 5], [7, 11]]
                            );
                        });

                    });


                    t.it("findFeedIndexesForActionAtPage() - B", (t) => {

                        var feeder    = createFeeder(),
                            ADD       = PageMapFeeder.ACTION_ADD;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            feeder.getPageMap().removeAtKey(1);
                            feeder.getPageMap().removeAtKey(2);
                            feeder.getPageMap().removeAtKey(5);
                            feeder.getPageMap().removeAtKey(9);
                            feeder.getPageMap().removeAtKey(10);


                            t.expect(feeder.findFeedIndexesForActionAtPage(3, ADD)).toEqual(
                                [[5], [6, 9], [11, 13]]
                            );
                        });

                    });


                    t.it("findFeedIndexesForActionAtPage() - C", (t) => {

                        // [1] (2:1) (3:4) [4] (5:4) (7:8) [8, 9, 10] (11:10)
                        // REM 2
                        // [1] (2:1) (3:4) [4] (5:4) (7:8) [8, 9, 10] (11:10)
                        // --> [2] [3, 5] [7, 11]

                        var feeder    = createFeeder(),
                            REMOVE    = PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            feeder.getPageMap().removeAtKey(2);
                            feeder.getPageMap().removeAtKey(3);

                            feeder.getPageMap().removeAtKey(5);
                            feeder.getPageMap().removeAtKey(6);

                            feeder.getPageMap().removeAtKey(7);
                            feeder.getPageMap().removeAtKey(11);
                            feeder.getPageMap().removeAtKey(12);

                            feeder.createFeedAt(2, 1);
                            feeder.createFeedAt(3, 4);
                            feeder.createFeedAt(5, 4);
                            feeder.createFeedAt(7, 8);
                            feeder.createFeedAt(11, 10);


                            t.expect(feeder.findFeedIndexesForActionAtPage(2, REMOVE)).toEqual(
                                [[3, 5], [7, 11]]
                            );
                        });

                    });


                    t.it("findFeedIndexesForActionAtPage() - D", (t) => {

                        var feeder    = createFeeder(),
                            ADD       = PageMapFeeder.ACTION_ADD;

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            // [1, 2, 3, 4, 5] [7, 8, 9 10 , 11. 12]
                            feeder.getPageMap().removeAtKey(6);
                            t.expect(feeder.findFeedIndexesForActionAtPage(5, ADD)).toEqual([[6], [7, 13]]);
                            t.expect(feeder.findFeedIndexesForActionAtPage(1, ADD)).toEqual([[6], [7, 13]]);
                        });
                    });


                    t.it("findFeedIndexesForActionAtPage() - E", (t) => {

                        var feeder    = createFeeder(),
                            ADD       = PageMapFeeder.ACTION_ADD;

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            t.expect(feeder.findFeedIndexesForActionAtPage(5, ADD)).toEqual([[13]]);
                        });

                    });


                    t.it("findFeedIndexesForActionAtPage() - F", (t) => {

                        var feeder    = createFeeder(),
                            ADD       = PageMapFeeder.ACTION_ADD;

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            feeder.getPageMap().removeAtKey(3);
                            feeder.getPageMap().removeAtKey(4);
                            feeder.getPageMap().removeAtKey(6);
                            feeder.getPageMap().removeAtKey(7);

                            // [1, 2] (3:2) [5] [8, 9, 10, 11, 12]
                            //
                            feeder.createFeedAt(3, 2);
                            t.expect(feeder.findFeedIndexesForActionAtPage(3, ADD)).toEqual([[3], [8, 13]]);
                        });

                    });


                    t.it("findFeedIndexesForActionAtPage() - G", (t) => {

                        var feeder    = createFeeder(),
                            ADD       = PageMapFeeder.ACTION_ADD;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // [1, 2] [5], [8, 9] [11, 12]

                            feeder.getPageMap().removeAtKey(3);
                            feeder.getPageMap().removeAtKey(4);
                            feeder.getPageMap().removeAtKey(6);
                            feeder.getPageMap().removeAtKey(7);
                            feeder.getPageMap().removeAtKey(10);

                            t.expect(feeder.findFeedIndexesForActionAtPage(1, ADD)).toEqual([[3], [8, 10], [11, 13]]);
                        });

                    });


                    t.it("findFeedIndexesForActionAtPage() - H", (t) => {

                        var feeder    = createFeeder(),
                            REMOVE    = PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // [1, 2] [5], [8, 9] [12]
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
                            feeder.createFeedAt(10, 9);
                            t.expect(feeder.getFeedAt(10).getPrevious()).toBe(9);
                            feeder.createFeedAt(11, 12);
                            t.expect(feeder.getFeedAt(11).getNext()).toBe(12);

                            t.expect(feeder.findFeedIndexesForActionAtPage(9, REMOVE)).toEqual([[10]]);

                        });

                    });


                    t.it("findFeedIndexesForActionAtPage() - I", (t) => {

                        var feeder    = createFeeder(),
                            ADD       = PageMapFeeder.ACTION_ADD,
                            REMOVE    = PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

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
                            t.expect(feeder.findFeedIndexesForActionAtPage(5, REMOVE)).toBe(null);
                            t.expect(feeder.findFeedIndexesForActionAtPage(5, ADD)).toEqual([[6], [8, 13]]);

                            feeder.createFeedAt(3, 2);
                            t.expect(feeder.findFeedIndexesForActionAtPage(3, ADD)).toEqual([[3], [8, 13]]);
                            feeder.removeFeedAt(3);

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
                            feeder.createFeedAt(13, 12);
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
                            feeder.createFeedAt(7, 8);
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

                            // [1, 2] [5] [8, 9], (10:9), (11:12) [12]
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
                            feeder.createFeedAt(10, 9);
                            t.expect(feeder.getFeedAt(10).getPrevious()).toBe(9);
                            feeder.createFeedAt(11, 12);
                            t.expect(feeder.getFeedAt(11).getNext()).toBe(12);


                            t.expect(feeder.findFeedIndexesForActionAtPage(9, ADD)).toEqual([[10], [11, 13]]);

                            t.expect(feeder.findFeedIndexesForActionAtPage(9, REMOVE)).toEqual([[10]]);


                        });

                    });


                    t.it("findFeedIndexesForActionAtPage() - J", (t) => {

                        var feeder    = createFeeder(),
                            REMOVE    = PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            feeder.getPageMap().removeAtKey(1);
                            feeder.getPageMap().removeAtKey(5);


                            // [2, 3, 4] [6, 7, 8, 9, 10, 11, 12]
                            // [2, 3] (4:3) (5:6) [8, 9, 10, 11] (12:11)

                            t.expect(feeder.findFeedIndexesForActionAtPage(3, REMOVE)).toEqual([[4], [5, 12]]);
                        });
                    });


                    t.it("findFeedIndexesForActionAtPage() - K", (t) => {

                        var feeder    = createFeeder(),
                            REMOVE    = PageMapFeeder.ACTION_REMOVE,
                            pageMap   = feeder.getPageMap();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // When removing in a feed, we must make sure the Feed exists,
                            // otherwise we cannot remove from it
                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2] (3:2) (4:5) [5, 6, 7] (8:7) (9:10) [10, 11] (12:11)
                            // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] (12:11)


                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(9);

                            feeder.swapMapToFeed(3, 2);
                            feeder.createFeedAt(4, 5);
                            feeder.swapMapToFeed(8, 7);
                            feeder.createFeedAt(9, 10);
                            feeder.swapMapToFeed(12, 11);

                            t.expect(feeder.findFeedIndexesForActionAtPage(4, REMOVE)).toEqual([
                                [8], [9, 12]
                            ]);

                        });
                    });


                    t.it("findFeedIndexesForActionAtPage() - L", (t) => {

                        var feeder    = createFeeder(),
                            REMOVE    = PageMapFeeder.ACTION_REMOVE,
                            pageMap   = feeder.getPageMap(),
                            pageSize  = pageMap.getPageSize();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // When removing in a feed, we must make sure the Feed exists,
                            // otherwise we cannot remove from it
                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2, 3] (4:5) [5, 6, 7] (8:7) (9:10) [10, 11] (12:11)
                            // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] (12:11)


                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(9);

                            feeder.createFeedAt(4, 5);
                            feeder.createFeedAt(9, 10);

                            t.expect(feeder.getFeedAt(4).getNext()).toBe(5);
                            t.expect(feeder.getFeedAt(9).getNext()).toBe(10);


                            feeder.getFeedAt(4).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(9).fill(propsMax(pageSize - 1));


                            t.expect(feeder.findFeedIndexesForActionAtPage(4, REMOVE)).toEqual([
                                [8], [9, 12]
                            ]);

                            t.expect(toIntMap(Ext.Object.getKeys(pageMap.map))).toEqual([1, 2, 3, 5, 6, 7, 8, 10, 11, 12]);
                            t.expect(toIntMap(Ext.Object.getKeys(feeder.feed))).toEqual([4, 9]);


                        });
                    });


                    t.it("findFeedIndexesForActionAtPage() - M", (t) => {

                        var feeder    = createFeeder(),
                            REMOVE    = PageMapFeeder.ACTION_REMOVE,
                            pageMap   = feeder.getPageMap(),
                            pageSize  = pageMap.getPageSize();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // When removing in a feed, we must make sure the Feed exists,
                            // otherwise we cannot remove from it
                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2, 3] (4:5) [5, 6, 7] (8:7) (9:10) [10, 11] (12:11)
                            // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] (12:11)


                            pageMap.removeAtKey(3);
                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(8);
                            pageMap.removeAtKey(9);

                            feeder.createFeedAt(3, 2);
                            feeder.createFeedAt(4, 5);
                            feeder.createFeedAt(8, 7);
                            feeder.createFeedAt(9, 10);

                            feeder.getFeedAt(3).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(4).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(8).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(9).fill(propsMax(pageSize));

                            feeder.sanitizeFeedsForPage(2, REMOVE);
                            t.expect(feeder.findFeedIndexesForActionAtPage(2, REMOVE)).toEqual([
                                [3], [4, 8], [9, 12]
                            ]);


                        });
                    });


                    t.it("findFeedIndexesForActionAtPage() - N", (t) => {

                        var feeder    = createFeeder(),
                            REMOVE    = PageMapFeeder.ACTION_REMOVE,
                            pageMap   = feeder.getPageMap();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // 1 2 3 4 5 6 7 8 9 12
                            t.expect(pageMap.peekPage(1)).toBeTruthy();
                            t.expect(pageMap.peekPage(2)).toBeTruthy();
                            t.expect(pageMap.peekPage(3)).toBeTruthy();
                            t.expect(pageMap.peekPage(4)).toBeTruthy();
                            t.expect(pageMap.peekPage(5)).toBeTruthy();
                            t.expect(pageMap.peekPage(6)).toBeTruthy();
                            t.expect(pageMap.peekPage(7)).toBeTruthy();
                            t.expect(pageMap.peekPage(8)).toBeTruthy();
                            t.expect(pageMap.peekPage(9)).toBeTruthy();

                            pageMap.removeAtKey(10);
                            pageMap.removeAtKey(11);

                            t.expect(pageMap.peekPage(12)).toBeTruthy();

                            t.expect(pageMap.peekPage(13)).toBeFalsy();
                            t.expect(pageMap.peekPage(14)).toBeFalsy();

                            feeder.sanitizeFeedsForPage(2, REMOVE);
                            t.expect(feeder.findFeedIndexesForActionAtPage(6, REMOVE)).toEqual([
                                [9]
                            ]);

                            t.expect(pageMap.peekPage(12)).toBeFalsy();

                        });
                    });


                    t.it("removeFeedAt()", (t) => {

                        var newFeed, page = 5,
                            feeder  = createFeeder(),
                            pageMap = feeder.getPageMap();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            pageMap.removeAtKey(page);
                            pageMap.removeAtKey(page + 1);
                            newFeed = feeder.createFeedAt(page, page - 1);

                            t.expect(newFeed).toBeTruthy();
                            t.expect(feeder.getFeedAt(page)).not.toBe(null);

                            t.expect(feeder.removeFeedAt(page)).toBe(true);
                            t.expect(feeder.removeFeedAt(page + 1)).toBe(false);

                            t.expect(feeder.getFeedAt(page)).toBe(null);
                        });

                    });


                    t.it("swapFeedToMap() - exceptions", (t) => {
                        let exc, page,
                            feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            page = 5;

                            try{feeder.swapFeedToMap(page);}catch(e){exc = e;}
                            t.expect(exc).toBeDefined();
                            t.expect(exc.msg).toBeDefined();
                            t.expect(exc.msg.toLowerCase()).toContain("does still exist");

                            pageMap.removeAtKey(page);

                            try{feeder.swapFeedToMap(page);}catch(e){exc = e;}
                            t.expect(exc).toBeDefined();
                            t.expect(exc.msg).toBeDefined();
                            t.expect(exc.msg.toLowerCase()).toContain("does not exist");
                        });
                    });


                    t.it("swapFeedToMap()", (t) => {
                        let page, newFeed,
                            feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap(),
                            mapValues = [],
                            collect   = function (data) {
                                for (var i = 0, len = data.length; i<  len; i++) {
                                    mapValues.push(data[i].clone());
                                }
                            };

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            page = 5;
                            pageMap.removeAtKey(page + 1);

                            // swap to Feed
                            newFeed = feeder.swapMapToFeed(page, page - 1);
                            t.expect(newFeed instanceof coon.core.data.pageMap.Feed).toBe(true);
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


                    t.it("sanitizeFeedsForPage() - A", (t) => {

                        var feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap(),
                            ADD       = PageMapFeeder.ACTION_ADD;

                        t.waitForMs(t.parent.TIMEOUT, () => {

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

                            feeder.sanitizeFeedsForPage(1, ADD);

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


                    t.it("sanitizeFeedsForPage() - B", (t) => {

                        var feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap(),
                            ADD       = PageMapFeeder.ACTION_ADD;

                        t.waitForMs(t.parent.TIMEOUT, () => {

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

                            feeder.swapMapToFeed(10, 9);

                            t.expect(feeder.getFeedAt(10)).toBeTruthy();
                            t.expect(feeder.getFeedAt(10).getPrevious()).toBe(9);

                            feeder.sanitizeFeedsForPage(1, ADD);

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


                    t.it("sanitizeFeedsForPage() - C", (t) => {

                        var feeder    = createFeeder(),
                            REMOVE    = PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {


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

                            t.expect(feeder.createFeedAt(10, 9).getPrevious()).toBe(9);

                            feeder.getFeedAt(10).fill([Ext.create("Ext.data.Model")]);

                            feeder.sanitizeFeedsForPage(1, REMOVE);

                            t.expect(feeder.getPageMap().peekPage(12)).toBeFalsy();
                            t.expect(feeder.getFeedAt(10)).toBeTruthy();
                        });

                    });


                    t.it("sanitizeFeedsForPage() - D", (t) => {

                        var feeder    = createFeeder(),
                            REMOVE    = PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {


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

                            t.expect(feeder.createFeedAt(10, 9).getPrevious()).toBe(9);

                            feeder.sanitizeFeedsForPage(1, REMOVE);

                            t.expect(feeder.getPageMap().peekPage(12)).toBeFalsy();
                            t.expect(feeder.getFeedAt(10)).toBeFalsy();
                        });
                    });


                    t.it("sanitizeFeedsForPage() - E", (t) => {

                        var feeder    = createFeeder(),
                            REMOVE    = PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {


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

                            t.expect(feeder.createFeedAt(8, 9).getNext()).toBe(9);
                            t.expect(feeder.createFeedAt(10, 9).getPrevious()).toBe(9);

                            feeder.sanitizeFeedsForPage(1, REMOVE);

                            t.expect(feeder.getPageMap().peekPage(12)).toBeFalsy();
                            t.expect(feeder.getFeedAt(10)).toBeFalsy();
                            t.expect(feeder.getFeedAt(8)).toBeFalsy();
                        });
                    });


                    t.it("sanitizeFeedsForPage() - F", (t) => {

                        var feeder    = createFeeder(),
                            ADD       = PageMapFeeder.ACTION_ADD;

                        t.waitForMs(t.parent.TIMEOUT, () => {


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

                            t.expect(feeder.createFeedAt(8, 9).getNext()).toBe(9);
                            t.expect(feeder.createFeedAt(10, 9).getPrevious()).toBe(9);

                            feeder.sanitizeFeedsForPage(1, ADD);

                            t.expect(feeder.getPageMap().peekPage(12)).toBeFalsy();
                            t.expect(feeder.getFeedAt(8)).toBeFalsy();
                            t.expect(feeder.getPageMap().peekPage(9)).toBeFalsy();
                            t.expect(feeder.getFeedAt(10)).toBeFalsy();

                        });

                    });


                    t.it("sanitizeFeedsForPage() - G", (t) => {

                        var feeder    = createFeeder(),
                            ADD       = PageMapFeeder.ACTION_ADD,
                            REMOVE    = PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // [1, 2], [4, 5], [7, 8, 9, 10, 11, 12]
                            // 1, ADD:    [1, 2] (3) (4) [5] (6) (7)[8, 9, 10, 11, 12] (13)
                            // 5, REMOVE: -1
                            feeder.getPageMap().removeAtKey(3);
                            feeder.getPageMap().removeAtKey(6);

                            let testit = function () {
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
                            t.expect(feeder.sanitizeFeedsForPage(1, ADD)).toBe(true);
                            testit();
                            t.expect(feeder.sanitizeFeedsForPage(7, ADD)).toBe(true);
                            testit();
                            t.expect(feeder.sanitizeFeedsForPage(1, REMOVE)).toBe(true);
                            testit();
                            t.expect(feeder.sanitizeFeedsForPage(6, REMOVE)).toBe(false);
                            testit();
                            t.expect(feeder.sanitizeFeedsForPage(6, ADD)).toBe(false);
                            testit();
                        });

                    });


                    t.it("sanitizeFeedsForPage() - H", (t) => {

                        var feeder    = createFeeder(),
                            ADD       = PageMapFeeder.ACTION_ADD;

                        t.waitForMs(t.parent.TIMEOUT, () => {


                            // throws exception since feed at 10 will be out of sync with
                            // other Feeds
                            feeder.getPageMap().removeAtKey(3);
                            feeder.getPageMap().removeAtKey(4);
                            feeder.getPageMap().removeAtKey(5);
                            feeder.getPageMap().removeAtKey(6);
                            feeder.getPageMap().removeAtKey(7);
                            feeder.getPageMap().removeAtKey(8);
                            feeder.getPageMap().removeAtKey(10);
                            feeder.getPageMap().removeAtKey(11);

                            t.expect(feeder.createFeedAt(3, 2).getPrevious()).toBe(2);
                            t.expect(feeder.createFeedAt(8, 9).getNext()).toBe(9);
                            t.expect(feeder.createFeedAt(10, 9).getPrevious()).toBe(9);

                            feeder.getFeedAt(3).fill([Ext.create("Ext.data.Model"), Ext.create("Ext.data.Model")]);
                            feeder.getFeedAt(8).fill([Ext.create("Ext.data.Model"), Ext.create("Ext.data.Model")]);
                            feeder.getFeedAt(10).fill([Ext.create("Ext.data.Model")]);

                            // former out of sync exception
                            t.expect(feeder.sanitizeFeedsForPage(1, ADD)).toBe(true);
                        });

                    });


                    t.it("sanitizeFeedsForPage() - I", (t) => {
                        let feeder   = createFeeder(),
                            pageMap  = feeder.getPageMap(),
                            pageSize = pageMap.getPageSize(),
                            REMOVE   = PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2] (3:2) (4:5) [5, 6, 7] (8:7) (9:10) [10, 11] (12:11)
                            // 3 - full, 4 - empty, 8 - full, 9 - empty , 12 full
                            // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] (12:11)

                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(9);

                            feeder.swapMapToFeed(3, 2);
                            feeder.createFeedAt(4, 5);
                            feeder.swapMapToFeed(8, 7);
                            feeder.createFeedAt(9, 10);
                            feeder.swapMapToFeed(12, 11);

                            t.expect(feeder.getFeedAt(3).getFreeSpace()).toBe(0);
                            t.expect(feeder.getFeedAt(4).getFreeSpace()).toBe(pageSize);
                            t.expect(feeder.getFeedAt(8).getFreeSpace()).toBe(0);
                            t.expect(feeder.getFeedAt(9).getFreeSpace()).toBe(pageSize);
                            t.expect(feeder.getFeedAt(12).getFreeSpace()).toBe(0);

                            t.expect(toIntMap(Ext.Object.getKeys(pageMap.map))).toEqual([1, 2, 5, 6, 7, 10, 11]);
                            t.expect(toIntMap(Ext.Object.getKeys(feeder.feed))).toEqual([3, 4, 8, 9, 12]);

                            t.expect(feeder.sanitizeFeedsForPage(4, REMOVE)).toBe(true);

                            // [1, 2 ,3](4:5) [5, 6, 7

                            t.expect(toIntMap(Ext.Object.getKeys(pageMap.map))).toEqual([1, 2, 3, 5, 6, 7, 8, 10, 11, 12]);
                            t.expect(toIntMap(Ext.Object.getKeys(feeder.feed))).toEqual([]);
                        });

                    });


                    t.it("sanitizeFeedsForPage() - J", (t) => {
                        let feeder   = createFeeder(),
                            pageMap  = feeder.getPageMap(),
                            pageSize = pageMap.getPageSize(),
                            REMOVE   = PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2] (3:2) (4:5) [5, 6, 7] (8:7) (9:10) [10, 11] (12:11)
                            // 3 - full, 4 - empty, 8 - full, 9 - empty , 12 full
                            // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] (12:11)

                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(9);

                            feeder.swapMapToFeed(3, 2);
                            feeder.createFeedAt(4, 5);
                            feeder.swapMapToFeed(8, 7);
                            feeder.createFeedAt(9, 10);
                            feeder.swapMapToFeed(12, 11);

                            t.expect(feeder.getFeedAt(3).getFreeSpace()).toBe(0);
                            t.expect(feeder.getFeedAt(4).getFreeSpace()).toBe(pageSize);
                            t.expect(feeder.getFeedAt(8).getFreeSpace()).toBe(0);
                            t.expect(feeder.getFeedAt(9).getFreeSpace()).toBe(pageSize);
                            t.expect(feeder.getFeedAt(12).getFreeSpace()).toBe(0);

                            feeder.getFeedAt(3).extract(1);
                            feeder.getFeedAt(8).extract(1);
                            feeder.getFeedAt(12).extract(1);

                            feeder.getFeedAt(4).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(9).fill(propsMax(pageSize - 1));

                            t.expect(toIntMap(Ext.Object.getKeys(pageMap.map))).toEqual([1, 2, 5, 6, 7, 10, 11]);
                            t.expect(toIntMap(Ext.Object.getKeys(feeder.feed))).toEqual([3, 4, 8, 9, 12]);

                            t.expect(feeder.sanitizeFeedsForPage(4, REMOVE)).toBe(true);

                            // [1, 2 ,3](4:5) [5, 6, 7

                            t.expect(toIntMap(Ext.Object.getKeys(pageMap.map))).toEqual([1, 2, 5, 6, 7, 10, 11]);
                            t.expect(toIntMap(Ext.Object.getKeys(feeder.feed))).toEqual([3, 4, 8, 9, 12]);
                        });

                    });


                    t.it("prepareForAction() - exceptions", (t) => {

                        let exc,
                            feeder   = createFeeder();

                        try {feeder.prepareForAction(8);} catch (e) {exc = e;}
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("must be any of");
                        t.expect(exc.msg.toLowerCase()).toContain("action");
                        exc = undefined;
                    });


                    t.it("prepareForAction() - A", (t) => {
                        let feeder   = createFeeder(),
                            pageMap  = feeder.getPageMap(),
                            REMOVE   = PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2] (3:2) (4:5) [5, 6, 7] (8:7) (9:10) [10, 11] (12:11)
                            // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] (12:11)

                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(9);


                            t.expect(feeder.prepareForAction(2, REMOVE)).toEqual(
                                [[3], [4, 8], [9, 12]]
                            );

                            t.expect(feeder.getFeedAt(3).getPrevious()).toBe(2);
                            t.expect(feeder.getFeedAt(4).getNext()).toBe(5);
                            t.expect(feeder.getFeedAt(8).getPrevious()).toBe(7);
                            t.expect(feeder.getFeedAt(9).getNext()).toBe(10);
                            t.expect(feeder.getFeedAt(12).getPrevious()).toBe(11);

                            t.expect(toIntMap(Ext.Object.getKeys(pageMap.map))).toEqual([1, 2, 5, 6, 7, 10, 11]);
                            t.expect(toIntMap(Ext.Object.getKeys(feeder.feed))).toEqual([3, 4, 8, 9, 12]);
                        });

                    });


                    t.it("prepareForAction() - B", (t) => {
                        let feeder   = createFeeder(),
                            pageMap  = feeder.getPageMap(),
                            ADD      = PageMapFeeder.ACTION_ADD;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2, 3]  [5, 6, 7, 8]  [10, 11, 12]
                            // [1, 2, 3](4:3)  (5:6)[6, 7, 8](9:8)  (10:11)[11, 12](13:12)

                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(9);

                            t.expect(feeder.prepareForAction(2, ADD)).toEqual(
                                [[4], [5, 9], [10, 13]]
                            );
                            t.expect(toIntMap(Ext.Object.getKeys(pageMap.map))).toEqual([1, 2, 3, 6, 7, 8, 11, 12]);
                            t.expect(toIntMap(Ext.Object.getKeys(feeder.feed))).toEqual([4, 5, 9, 10, 13]);
                        });

                    });


                    t.it("prepareForAction() - C", (t) => {
                        let feeder   = createFeeder(),
                            pageMap  = feeder.getPageMap(),
                            pageSize = pageMap.getPageSize(),
                            REMOVE   = PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2] (3:2) (4:5) [5, 6, 7] (8:7) (9:10) [10, 11] (12:11)
                            // 3 - full, 4 - empty, 8 - full, 9 - empty , 12 full
                            // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] (12:11)

                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(9);

                            feeder.swapMapToFeed(3, 2);
                            feeder.createFeedAt(4, 5);
                            feeder.swapMapToFeed(8, 7);
                            feeder.createFeedAt(9, 10);
                            feeder.swapMapToFeed(12, 11);

                            feeder.getFeedAt(3).extract(1);
                            feeder.getFeedAt(8).extract(1);
                            feeder.getFeedAt(12).extract(1);

                            feeder.getFeedAt(4).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(9).fill(propsMax(pageSize - 1));

                            t.expect(feeder.prepareForAction(4, REMOVE)).toEqual([
                                [8], [9, 12]
                            ]);

                            t.expect(feeder.getFeedAt(8).getPrevious()).toBe(7);
                            t.expect(feeder.getFeedAt(9).getNext()).toBe(10);
                            t.expect(feeder.getFeedAt(12).getPrevious()).toBe(11);
                        });

                    });


                    t.it("prepareForAction() - D", (t) => {
                        let feeder   = createFeeder(),
                            pageMap  = feeder.getPageMap(),
                            pageSize = pageMap.getPageSize(),
                            REMOVE   = PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2] (3:2) (4:5) [5, 6, 7] (8:7) (9:10) [10, 11] (12:11)
                            // 3 - full, 4 - empty, 8 - full, 9 - empty , 12 full
                            // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] (12:11)

                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(9);

                            feeder.swapMapToFeed(3, 2);
                            feeder.createFeedAt(4, 5);
                            feeder.swapMapToFeed(8, 7);
                            feeder.createFeedAt(9, 10);
                            feeder.swapMapToFeed(12, 11);


                            // [1, 2, 3] [5, 6, 7, 8] [10, 11, 12]

                            feeder.getFeedAt(4).fill(propsMax(pageSize));

                            t.expect(feeder.prepareForAction(4, REMOVE)).toEqual([
                                [8], [9, 12]
                            ]);

                            t.expect(toIntMap(Ext.Object.getKeys(pageMap.map))).toEqual([1, 2, 3, 4, 5, 6, 7, 10, 11]);
                            t.expect(toIntMap(Ext.Object.getKeys(feeder.feed))).toEqual([8, 9, 12]);

                        });

                    });


                    t.it("prepareForAction() - E", (t) => {
                        let feeder   = createFeeder(),
                            ADD      = PageMapFeeder.ACTION_ADD;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2] (3:2) (4:5) [5, 6, 7] (8:7) (9:10) [10, 11] (12:11)
                            // 3 - full, 4 - empty, 8 - full, 9 - empty , 12 full
                            // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] (12:11)

                            t.expect(feeder.prepareForAction(1, ADD)).toEqual([
                                [13]
                            ]);

                            t.expect(feeder.getFeedAt(13).getNext()).toBeUndefined();
                            t.expect(feeder.getFeedAt(13).getPrevious()).toBe(12);
                        });

                    });


                    t.it("prepareForAction() - F", (t) => {
                        let feeder   = createFeeder(),
                            pageMap  = feeder.getPageMap(),
                            ADD      = PageMapFeeder.ACTION_ADD;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2](3:2)  (6:7) [7] (8:7) (9:10) [10,11] (12:11)
                            pageMap.removeAtKey(3);
                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(5);
                            feeder.swapMapToFeed(6, 7);
                            feeder.getFeedAt(6).extract(1);
                            feeder.swapMapToFeed(8, 7);
                            feeder.getFeedAt(8).extract(1);
                            feeder.swapMapToFeed(9, 10);
                            feeder.getFeedAt(9).extract(1);
                            feeder.swapMapToFeed(12, 11);
                            feeder.getFeedAt(12).extract(1);

                            t.expect(feeder.prepareForAction(1, ADD)).toEqual([
                                [3], [6, 8], [9, 12]
                            ]);

                            t.expect(feeder.getFeedAt(3).getPrevious()).toBe(2);
                            t.expect(feeder.getFeedAt(6).getNext()).toBe(7);
                            t.expect(feeder.getFeedAt(8).getPrevious()).toBe(7);
                            t.expect(feeder.getFeedAt(9).getNext()).toBe(10);
                            t.expect(feeder.getFeedAt(12).getPrevious()).toBe(11);
                        });

                    });


                    t.it("prepareForAction() - G", (t) => {

                        let feeder   = createFeeder(),
                            pageMap  = feeder.getPageMap(),
                            ADD      = PageMapFeeder.ACTION_ADD;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            feeder.swapMapToFeed(3, 2);
                            feeder.getFeedAt(3).extract(1);
                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(5);
                            feeder.swapMapToFeed(6, 7);
                            feeder.getFeedAt(6).extract(1);
                            feeder.swapMapToFeed(8, 7);
                            feeder.getFeedAt(8).extract(1);
                            feeder.swapMapToFeed(9, 10);
                            feeder.getFeedAt(9).extract(1);
                            feeder.swapMapToFeed(12, 11);
                            feeder.getFeedAt(12).extract(1);

                            t.expect(feeder.prepareForAction(3, ADD)).toEqual([
                                [3], [6, 8], [9, 12]
                            ]);

                        });
                    });


                    t.it("removeRecord() - not found", (t) => {

                        let feeder  = createFeeder();

                        t.waitForMs(t.parent.TIMEOUT, () => {


                            var op = feeder.removeRecord(prop(10000000000));


                            testOp(op, {
                                success: false
                            }, t);
                        });

                    });


                    t.it("removeRecord() - no feedIndexes available", (t) => {

                        let feeder  = createFeeder(),
                            pageMap  = feeder.getPageMap();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            feeder.findFeedIndexesForActionAtPage = function () {return null;};

                            var op = feeder.removeRecord(pageMap.map[1].value[0]);

                            testOp(op, {
                                success: false
                            }, t);
                        });

                    });


                    t.it("removeRecord() - found", (t) => {

                        let rec, op, recNext,
                            feeder   = createFeeder(),
                            pageMap  = feeder.getPageMap(),
                            map      = pageMap.map,
                            mapping  = {},
                            indexMap = {}, i, a , lena;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            rec      = map[3].value[5];
                            recNext = map[3].value[6];


                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // createFeedIndexes:
                            // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] (12:11)

                            t.expect(map[3].value[5]).not.toBe(recNext);
                            t.expect(map[3].value.length).toBe(25);

                            for (i = 11; i > 3; i--) {
                                mapping[i]     = {};
                                mapping[i][24] = map[i + 1].value[0].getId();
                                mapping[i][0]  = map[i].value[1].getId();

                                for (a = 0, lena = map[i].value.length; a < lena; a++) {
                                    indexMap[map[i].value[a].internalId] = pageMap.indexMap[map[i].value[a].internalId];
                                }
                            }


                            op = feeder.removeRecord(rec);
                            t.expect(map[3].value.length).toBe(25);

                            for (i = 11; i > 3; i--) {
                                t.expect(map[i].value[24].getId()).toBe(mapping[i][24]);
                                t.expect(map[i].value[0].getId()).toBe(mapping[i][0]);

                                for (a = 0, lena = map[i].value.length; a < lena; a++) {
                                    t.expect(
                                        indexMap[map[i].value[a].internalId]
                                    ).not.toBe(pageMap.indexMap[map[i].value[a].internalId]);
                                }
                            }

                            t.expect(map[3].value[5]).toBe(recNext);
                            t.expect(pageMap.indexOf(rec)).toBe(-1);
                            t.expect(pageMap.indexMap[rec.internalId]).toBeUndefined();

                            testOp(op, {
                                success: true
                            }, t);

                        });
                    });


                    t.it("removeRecord() - found in feed", (t) => {

                        let rec, op,
                            feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap(),
                            map       = pageMap.map,
                            pageSize  = pageMap.getPageSize(),
                            mapping   = {},
                            REMOVE    = coon.core.data.pageMap.PageMapFeeder.ACTION_REMOVE,
                            recNextId;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2] (3:2) (4:5) [5, 6, 7] (8:7) (9:10) [10, 11] (12:11)
                            // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] (12:11)

                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(9);

                            feeder.swapMapToFeed(3, 2);
                            feeder.createFeedAt(4, 5);
                            feeder.swapMapToFeed(8, 7);
                            feeder.createFeedAt(9, 10);
                            feeder.swapMapToFeed(12, 11);

                            // fill to pageSize - 1 so that no new pages are generated
                            feeder.getFeedAt(4).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(9).fill(propsMax(pageSize - 1));

                            t.expect(feeder.prepareForAction(4, REMOVE)).toEqual([
                                [8], [9, 12]
                            ]);

                            t.expect(toIntMap(Ext.Object.getKeys(pageMap.map))).toEqual([1, 2, 3, 5, 6, 7, 10, 11]);
                            t.expect(toIntMap(Ext.Object.getKeys(feeder.feed))).toEqual([4, 8, 9, 12]);

                            mapping = {
                                11: [],
                                9: [],
                                8: [],
                                4: []
                            };


                            mapping[11][24] = feeder.getFeedAt(12).getAt(0);
                            mapping[9][24]  = map[10].value[0];
                            mapping[8][24]  = undefined;
                            mapping[4][24]  = map[5].value[0];

                            rec = feeder.getFeedAt(4).getAt(3);
                            recNextId = feeder.getFeedAt(4).getAt(4).getId();

                            op = feeder.removeRecord(rec);

                            testOp(op, {
                                success: true
                            }, t);

                            t.expect(feeder.getFeedAt(4).getFreeSpace()).toBe(1);
                            t.expect(feeder.getFeedAt(12).getFreeSpace()).toBe(1);
                            t.expect(feeder.getFeedAt(4).getAt(3).getId()).toBe(recNextId);

                            t.expect(map[11].value[24]).toBe(mapping[11][24]);
                            t.expect(feeder.getFeedAt(9)).toBe(null);
                            t.expect(feeder.getFeedAt(8).getAt(24)).toBe(mapping[8][24]);
                            t.expect(feeder.getFeedAt(4).getAt(24)).toBe(mapping[4][24]);


                        });

                    });


                    t.it("removeRecord() - doesnt pass across none sibling pages and Feeds", (t) => {

                        let rec, op,
                            feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap(),
                            map       = pageMap.map,
                            mapping   = {},
                            REMOVE    = coon.core.data.pageMap.PageMapFeeder.ACTION_REMOVE,
                            recNextId;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2, 3, 4, 5] (6:5) (7:8) [8, 9, 10, 11] (12:11)

                            pageMap.removeAtKey(7);

                            t.expect(feeder.prepareForAction(2, REMOVE)).toEqual([
                                [6], [7, 12]
                            ]);

                            t.expect(toIntMap(Ext.Object.getKeys(pageMap.map))).toEqual([1, 2, 3, 4, 5, 8, 9, 10, 11]);
                            t.expect(toIntMap(Ext.Object.getKeys(feeder.feed))).toEqual([6, 7, 12]);


                            mapping = {
                                11: [],
                                7: [],
                                6: [],
                                5: [],
                                4: [],
                                3: [],
                                2: []
                            };

                            mapping[11][24] = feeder.getFeedAt(12).getAt(0);
                            mapping[7][24]  = map[8].value[0];
                            mapping[6][24]  = undefined;
                            mapping[5][24]  = feeder.getFeedAt(6).getAt(0);
                            mapping[4][24]  = map[5].value[0];
                            mapping[3][24]  = map[4].value[0];
                            mapping[2][24]  = map[3].value[0];


                            rec = map[2].value[24];
                            recNextId = map[3].value[0].getId();

                            op = feeder.removeRecord(rec);

                            testOp(op, {
                                success: true
                            }, t);

                            t.expect(map[2].value[24].getId()).toBe(recNextId);

                            t.expect(map[11].value[24]).toBe(mapping[11][24]);
                            t.expect(feeder.getFeedAt(7).getAt(24)).toBe(mapping[7][24]);
                            t.expect(feeder.getFeedAt(6).getAt(24)).toBe(mapping[6][24]);
                            t.expect(map[5].value[24]).toBe(mapping[5][24]);
                            t.expect(map[4].value[24]).toBe(mapping[4][24]);
                            t.expect(map[3].value[24]).toBe(mapping[3][24]);
                        });

                    });


                    t.it("canServeFromFeed()", (t) => {
                        let exc,
                            feeder   = createFeeder(),
                            pageMap  = feeder.getPageMap(),
                            pageSize = pageMap.getPageSize();


                        t.waitForMs(t.parent.TIMEOUT, () => {

                            pageMap.removeAtKey(3);
                            pageMap.removeAtKey(4);

                            feeder.createFeedAt(3, 2);

                            try{feeder.canServeFromFeed(4, 3);}catch(e){exc = e;}
                            t.expect(exc).toBeDefined();
                            t.expect(exc.msg).toBeDefined();
                            t.expect(exc.msg.toLowerCase()).toContain("does not exist");

                            t.expect(feeder.canServeFromFeed(3, 3)).toBe(false);
                            t.expect(feeder.canServeFromFeed(3, 1)).toBe(false);
                            t.expect(feeder.canServeFromFeed(3, 2)).toBe(false);


                            feeder.getFeedAt(3).fill(propsMax(pageSize - 1));
                            t.expect(feeder.canServeFromFeed(3, 2)).toBe(true);

                            feeder.createFeedAt(4, 5);
                            t.expect(feeder.canServeFromFeed(4, 3)).toBe(false);
                            t.expect(feeder.canServeFromFeed(4, 5)).toBe(false);

                            feeder.getFeedAt(4).fill(propsMax(pageSize));

                            t.expect(feeder.canServeFromFeed(4, 5)).toBe(true);
                            t.expect(feeder.canServeFromFeed(4, 3)).toBe(true);

                            t.expect(feeder.canServeFromFeed(3, 4)).toBe(false);

                            feeder.getFeedAt(4).extract(1);
                            feeder.getFeedAt(3).fill([prop()]);

                            t.expect(feeder.canServeFromFeed(3, 4)).toBe(true);
                            t.expect(feeder.canServeFromFeed(4, 3)).toBe(false);

                        });
                    });


                    t.it("removeRecord() - recreate feeds - A", (t) => {

                        let op,
                            feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap(),
                            map       = pageMap.map,
                            pageSize  = pageMap.getPageSize(),
                            REMOVE    = coon.core.data.pageMap.PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2](3:2) (4:5) [5, 6, 7] (8:7) (9:10) [10,11] (12:11)

                            pageMap.removeAtKey(3);
                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(8);
                            pageMap.removeAtKey(9);

                            feeder.createFeedAt(3, 2);
                            feeder.createFeedAt(4, 5);
                            feeder.createFeedAt(8, 7);
                            feeder.createFeedAt(9, 10);

                            feeder.getFeedAt(3).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(4).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(8).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(9).fill(propsMax(pageSize - 1));

                            t.expect(feeder.prepareForAction(2, REMOVE)).toEqual([
                                [3], [4, 8], [9, 12]
                            ]);

                            feeder.getFeedAt(3).fill(propsMax(pageSize));
                            feeder.getFeedAt(4).fill(propsMax(pageSize));
                            feeder.getFeedAt(8).fill(propsMax(pageSize));
                            feeder.getFeedAt(9).fill(propsMax(pageSize));

                            op = feeder.removeRecord(map[2].value[12]);

                            testOp(op, {
                                success: true
                            }, t);

                            t.expect(feeder.prepareForAction(2, REMOVE)).toEqual([
                                [12]
                            ]);

                            t.expect(toIntMap(Ext.Object.getKeys(pageMap.map))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
                            t.expect(toIntMap(Ext.Object.getKeys(feeder.feed))).toEqual([12]);


                        });

                    });


                    t.it("removeRecord() - recreate feeds () - B", (t) => {

                        let op,
                            feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap(),
                            map       = pageMap.map,
                            pageSize  = pageMap.getPageSize(),
                            REMOVE    = coon.core.data.pageMap.PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2](3:2) (4:5) [5, 6, 7] (8:7) (9:10) [10,11] (12:11)

                            pageMap.removeAtKey(3);
                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(8);
                            pageMap.removeAtKey(9);

                            feeder.createFeedAt(3, 2);
                            feeder.createFeedAt(4, 5);
                            feeder.createFeedAt(8, 7);
                            feeder.createFeedAt(9, 10);

                            feeder.getFeedAt(3).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(4).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(8).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(9).fill(propsMax(pageSize));

                            t.expect(feeder.prepareForAction(2, REMOVE)).toEqual([
                                [3], [4, 8], [9, 12]
                            ]);

                            op = feeder.removeRecord(map[2].value[12]);

                            testOp(op, {
                                success: true
                            }, t);

                            // 9 is 25, it is NOW allowed to shift to 8, since 8 has enough room to get filled up
                            t.expect(feeder.getFeedAt(8).getFreeSpace()).toBe(1);
                            t.expect(pageMap.peekPage(9)).toBeTruthy();
                            t.expect(feeder.prepareForAction(2, REMOVE)).toEqual([
                                [3], [4, 8], [9, 12]
                            ]);

                            t.expect(feeder.isPageCandidate(9)).toBe(true);

                        });
                    });


                    t.it("removeRecord() - recreate feeds () - C", (t) => {

                        let op,
                            feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap(),
                            map       = pageMap.map,
                            pageSize  = pageMap.getPageSize(),
                            REMOVE    = coon.core.data.pageMap.PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2](3:2) (4:5) [5, 6, 7] (8:7) (9:10) [10,11] (12:11)

                            pageMap.removeAtKey(3);
                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(8);
                            pageMap.removeAtKey(9);

                            feeder.createFeedAt(3, 2);
                            feeder.createFeedAt(8, 7);
                            feeder.createFeedAt(9, 10);

                            pageMap.removeAtKey(5);
                            feeder.createFeedAt(5, 6);
                            feeder.getFeedAt(5).fill(propsMax(pageSize, 66));
                            feeder.swapFeedToMap(5);

                            feeder.createFeedAt(4, 5);

                            feeder.getFeedAt(3).fill(propsMax(pageSize - 1, 300));
                            feeder.getFeedAt(4).fill(propsMax(pageSize - 1, 400));
                            feeder.getFeedAt(8).fill(propsMax(pageSize,800));
                            feeder.getFeedAt(9).fill(propsMax(pageSize, 900));


                            t.expect(feeder.getFeedAt(3).getAt(24)).toBeUndefined();
                            t.expect(feeder.getFeedAt(3).getAt(0).getId()).toBe("300");
                            t.expect(feeder.getFeedAt(4).getAt(0)).toBeUndefined();

                            let recFor8 = feeder.getFeedAt(9).getAt(0);
                            t.expect(feeder.getFeedAt(8).getAt(0).getId()).toBe("800");
                            t.expect(feeder.getFeedAt(8).getAt(3).getId()).toBe("803");
                            t.expect(recFor8.getId()).toBe("900");
                            let recFor9 = map[10].value[0];
                            let recFor7 = feeder.getFeedAt(8).getAt(0);
                            let recFor4 = map[5].value[0];

                            // ovverride sanitizer to provoke test for swapping
                            feeder.sanitizeFeedsForPage = function () {
                                return true;
                            };
                            t.expect(feeder.prepareForAction(2, REMOVE)).toEqual([
                                [3], [4, 8], [9, 12]
                            ]);
                            t.expect(feeder.getFeedAt(9).getNext()).toBe(10);

                            op = feeder.removeRecord(map[2].value[12]);

                            testOp(op, {
                                success: true
                            }, t);

                            // although 9 is 25, it is not allowed to shift to 8
                            t.expect(feeder.getFeedAt(8).getFreeSpace()).toBe(0);
                            t.expect(feeder.getFeedAt(8).getAt(24)).toBe(recFor8);
                            t.expect(map[7].value[24]).toBe(recFor7);

                            t.expect(feeder.getFeedAt(4).getAt(1)).toBeDefined();
                            t.expect(feeder.getFeedAt(4).getAt(1).getId()).toBe("401");
                            t.expect(feeder.getFeedAt(4).getAt(24)).toBe(recFor4);
                            t.expect(feeder.getFeedAt(3).getAt(0)).toBeDefined();
                            t.expect(feeder.getFeedAt(3).getAt(0).getId()).toBe("301");
                            t.expect(map[2].value[24].getId()).toBe("300");

                            t.expect(feeder.getFeedAt(9).getAt(24)).toBe(recFor9);
                            t.expect(feeder.getFeedAt(9).getAt(23).getId()).toBe("924");
                            t.expect(feeder.getFeedAt(9).getAt(0).getId()).toBe("901");

                            t.expect(feeder.getFeedAt(8).getAt(24).getId()).toBe("900");
                            t.expect(feeder.getFeedAt(8).getAt(23).getId()).toBe("824");


                            t.expect(feeder.isPageCandidate(8)).toBe(true);
                            t.expect(feeder.isPageCandidate(9)).toBe(true);
                        });
                    });


                    t.it("removeRecord() - recreate feeds () - D", (t) => {

                        let op,
                            feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap(),
                            map       = pageMap.map,
                            pageSize  = pageMap.getPageSize();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2](3:2) (4:5) [5, 6, 7] (8:7) (9:10) [10,11] (12:11)

                            pageMap.removeAtKey(3);
                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(8);
                            pageMap.removeAtKey(9);

                            feeder.createFeedAt(3, 2);
                            feeder.createFeedAt(8, 7);
                            feeder.createFeedAt(9, 10);

                            pageMap.removeAtKey(5);
                            feeder.createFeedAt(5, 6);
                            feeder.getFeedAt(5).fill(propsMax(pageSize, 66));
                            feeder.swapFeedToMap(5);

                            feeder.createFeedAt(4, 5);

                            feeder.getFeedAt(3).fill(propsMax(pageSize - 1, 300));
                            feeder.getFeedAt(4).fill(propsMax(pageSize - 1, 400));
                            feeder.getFeedAt(8).fill(propsMax(pageSize - 5, 800));
                            feeder.getFeedAt(9).fill(propsMax(pageSize - 5, 900));


                            t.expect(feeder.getFeedAt(8).getFreeSpace()).toBe(5);
                            t.expect(feeder.getFeedAt(9).getFreeSpace()).toBe(5);

                            let remMe = function (page, value) {
                                op = feeder.removeRecord(map[page].value[value]);
                                testOp(op, {
                                    success: true
                                }, t);
                            };

                            remMe(2, 12);
                            t.expect(feeder.getFeedAt(9).getFreeSpace()).toBe(4);
                            t.expect(feeder.getFeedAt(8).getFreeSpace()).toBe(6);
                            remMe(2, 12);
                            t.expect(feeder.getFeedAt(9).getFreeSpace()).toBe(3);
                            t.expect(feeder.getFeedAt(8).getFreeSpace()).toBe(7);
                            remMe(2, 12);
                            t.expect(feeder.getFeedAt(9).getFreeSpace()).toBe(2);
                            t.expect(feeder.getFeedAt(8).getFreeSpace()).toBe(8);
                            remMe(2, 12);
                            t.expect(feeder.getFeedAt(9).getFreeSpace()).toBe(1);
                            t.expect(feeder.getFeedAt(8).getFreeSpace()).toBe(9);
                            remMe(2, 12);
                            // feeder.getFeedAt(9).getFreeSpace()).toBe(0);
                            // since sanitizer was called from removeRecord after operations finished,
                            // 9 will be recreated as page
                            t.expect(pageMap.peekPage(9)).toBeTruthy();
                            t.expect(feeder.getFeedAt(8).getFreeSpace()).toBe(10);
                            remMe(2, 12);
                            t.expect(pageMap.peekPage(9)).toBeTruthy();
                            t.expect(feeder.getFeedAt(8).getFreeSpace()).toBe(10);
                            remMe(2, 12);
                            t.expect(pageMap.peekPage(9)).toBeTruthy();
                            t.expect(feeder.getFeedAt(8).getFreeSpace()).toBe(10);

                        });
                    });


                    t.it("removeRecord() - multiple", (t) => {

                        let op,
                            feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap(),
                            map       = pageMap.map,
                            pageSize  = pageMap.getPageSize(),
                            REMOVE    = coon.core.data.pageMap.PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2](3:2) (4:5) [5, 6, 7] (8:7) (9:10) [10,11] (12:11)

                            pageMap.removeAtKey(3);
                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(8);
                            pageMap.removeAtKey(9);

                            feeder.createFeedAt(3, 2);
                            feeder.createFeedAt(4, 5);
                            feeder.createFeedAt(8, 7);
                            feeder.createFeedAt(9, 10);

                            feeder.getFeedAt(3).fill(propsMax(1));
                            feeder.getFeedAt(4).fill(propsMax(1));
                            feeder.getFeedAt(8).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(9).fill(propsMax(pageSize - 1));

                            t.expect(feeder.prepareForAction(2, REMOVE)).toEqual([
                                [3], [4, 8], [9, 12]
                            ]);

                            op = feeder.removeRecord(map[2].value[12]);

                            testOp(op, {
                                success: true
                            }, t);

                            // feed at 3 gone, cant serve
                            t.expect(feeder.prepareForAction(2, REMOVE)).toBeNull();

                        });

                    });

                    t.it("removeRecord() - sanitized is called afterwards", (t) => {

                        let op,
                            feeder    = createFeeder(),
                            pageMap   = feeder.getPageMap(),
                            map       = pageMap.map,
                            pageSize  = pageMap.getPageSize(),
                            REMOVE    = coon.core.data.pageMap.PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2](3:2) (4:5) [5, 6, 7] (8:7) (9:10) [10,11] (12:11)

                            pageMap.removeAtKey(3);
                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(8);
                            pageMap.removeAtKey(9);

                            feeder.createFeedAt(3, 2);
                            feeder.createFeedAt(4, 5);
                            feeder.createFeedAt(8, 7);
                            feeder.createFeedAt(9, 10);

                            feeder.getFeedAt(3).fill(propsMax(1));
                            feeder.getFeedAt(4).fill(propsMax(1));
                            feeder.getFeedAt(8).fill(propsMax(pageSize - 1));
                            feeder.getFeedAt(9).fill(propsMax(pageSize - 1));

                            t.expect(feeder.prepareForAction(2, REMOVE)).toEqual([
                                [3], [4, 8], [9, 12]
                            ]);

                            t.expect(feeder.getFeedAt(9)).toBeTruthy();
                            t.expect(pageMap.peekPage(9)).toBeFalsy();


                            op = feeder.removeRecord(map[2].value[12]);

                            testOp(op, {
                                success: true
                            }, t);

                            t.expect(feeder.getFeedAt(9)).toBeNull();
                            t.expect(pageMap.peekPage(9)).toBeTruthy();

                        });

                    });


                    t.it("addRecord - exceptions", (t) => {

                        let exc, e,
                            feeder         = createFeeder(),
                            RecordPosition = coon.core.data.pageMap.RecordPosition;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2](3:2) (4:5) [5, 6, 7] (8:7) (9:10) [10,11] (12:11)


                            let addRec = prop(999, "999");

                            try{t.expect(feeder.addRecord(addRec, RecordPosition.create(1313, 2)));
                            } catch(e){exc = e;}
                            t.expect(exc).toBeDefined();
                            t.expect(exc.msg).toBeDefined();
                            t.expect(exc.msg.toLowerCase()).toContain("does not exist");
                            t.expect(exc.msg.toLowerCase()).toContain("page");
                            exc = e;

                        });


                    });


                    t.it("addRecord - A", (t) => {

                        let op,
                            feeder         = createFeeder(),
                            pageMap        = feeder.getPageMap(),
                            map            = pageMap.map,
                            pageSize       = pageMap.getPageSize(),
                            ADD            = coon.core.data.pageMap.PageMapFeeder.ACTION_ADD,
                            RecordPosition = coon.core.data.pageMap.RecordPosition,
                            lastRec        = null,
                            mapping        = [],
                            PageMapUtil    = coon.core.data.pageMap.PageMapUtil;

                        t.waitForMs(t.parent.TIMEOUT, () => {


                            for (let i in map) {
                                for (let a = 0; a < pageSize; a++) {
                                    mapping.push(map[i].value[a].getId());
                                }
                            }

                            lastRec = map[12].value[24];


                            t.expect(feeder.prepareForAction(1, ADD)).toEqual([
                                [13]
                            ]);

                            let addRec = prop(999, "999");

                            t.expect(feeder.getFeedAt(13)).toBeTruthy();
                            t.expect(feeder.getFeedAt(13).getPrevious()).toBe(12);
                            op = feeder.addRecord(addRec, RecordPosition.create(1, 0));

                            testOp(op, {
                                success: true
                            }, t);

                            t.expect(feeder.getFeedAt(13)).not.toBeNull();
                            t.expect(map[12]).toBeTruthy();
                            t.expect(map[1].value[0]).toBe(addRec);
                            t.expect(pageMap.indexOf(lastRec)).toBe(-1);
                            t.expect(feeder.getFeedAt(13).getAt(0)).toBe(lastRec);

                            for (let a = 1, lena = mapping.length; a < lena; a++) {
                                let cp = PageMapUtil.storeIndexToPosition(a, pageMap);
                                t.expect(map[cp.getPage()].value[cp.getIndex()].getId()).toBe(mapping[a - 1]);
                            }


                        });


                    });


                    t.it("addRecord - B", (t) => {

                        let op,
                            feeder         = createFeeder(),
                            pageMap        = feeder.getPageMap(),
                            map            = pageMap.map,
                            ADD            = coon.core.data.pageMap.PageMapFeeder.ACTION_ADD,
                            RecordPosition = coon.core.data.pageMap.RecordPosition;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2](3:2)  (6:7) [7] (8:7) (9:10) [10,11] (12:11)

                            pageMap.removeAtKey(3);
                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(5);
                            feeder.swapMapToFeed(6, 7);
                            feeder.getFeedAt(6).extract(1);
                            feeder.swapMapToFeed(8, 7);
                            feeder.getFeedAt(8).extract(1);
                            feeder.swapMapToFeed(9, 10);
                            feeder.getFeedAt(9).extract(1);
                            feeder.swapMapToFeed(12, 11);
                            feeder.getFeedAt(12).extract(1);

                            t.expect(feeder.prepareForAction(1, ADD)).toEqual([
                                [3], [6, 8], [9, 12]
                            ]);

                            let addRec = prop(999, "999");

                            // enforce feed structure
                            feeder.sanitizeFeedsForPage = function () {
                                return true;
                            };

                            let undefinedRecords = {
                                3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                                6: [0, 1],
                                9: [0, 1]
                            };

                            let movedRecords = {
                                1: {5: addRec},
                                2: {0: map[1].value[24]},
                                3: {0: map[2].value[24]},
                                7: {0: feeder.getFeedAt(6).getAt(24)},
                                8: {0: map[7].value[24]},
                                10: {0: feeder.getFeedAt(9).getAt(24)},
                                11: {0: map[10].value[24]},
                                12: {0: map[11].value[24]}
                            };

                            op = feeder.addRecord(addRec, RecordPosition.create(1, 5));

                            testOp(op, {
                                success: true
                            }, t);

                            for (let i in undefinedRecords) {
                                for (let a = 0, lena = undefinedRecords[i].length; a < lena; a++) {
                                    t.expect(feeder.getFeedAt(i).getAt(undefinedRecords[i][a])).toBeUndefined();
                                }

                            }

                            for (let i in movedRecords) {
                                let movedMap = movedRecords[i];
                                let feed     = feeder.getFeedAt(i);

                                for (let u in movedMap) {
                                    if (feed) {
                                        t.expect(feed.getAt(u)).toBe(movedMap[u]);
                                    } else {
                                        t.expect(map[i].value[u]).toBe(movedMap[u]);
                                    }
                                }
                            }

                            t.expect(feeder.getFeedAt(8).getFreeSpace()).toBe(0);
                        });
                    });


                    t.it("addRecord - C", (t) => {

                        let op,
                            feeder         = createFeeder(),
                            pageMap        = feeder.getPageMap(),
                            map            = pageMap.map,
                            ADD            = coon.core.data.pageMap.PageMapFeeder.ACTION_ADD,
                            RecordPosition = coon.core.data.pageMap.RecordPosition;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2](3:2)  (6:7) [7] (8:7) (9:10) [10,11] (12:11)

                            feeder.swapMapToFeed(3, 2);
                            feeder.getFeedAt(3).extract(1);
                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(5);
                            feeder.swapMapToFeed(6, 7);
                            feeder.getFeedAt(6).extract(1);
                            feeder.swapMapToFeed(8, 7);
                            feeder.getFeedAt(8).extract(1);
                            feeder.swapMapToFeed(9, 10);
                            feeder.getFeedAt(9).extract(1);
                            feeder.swapMapToFeed(12, 11);
                            feeder.getFeedAt(12).extract(1);

                            t.expect(feeder.prepareForAction(1, ADD)).toEqual([
                                [3], [6, 8], [9, 12]
                            ]);

                            let feed3Rec = prop(777, "777");
                            let newFeed3Rec = feeder.getFeedAt(3).getAt(23);
                            t.expect(newFeed3Rec).toBeTruthy();
                            feeder.getFeedAt(3).fill([feed3Rec]);
                            t.expect(feeder.getFeedAt(3).getFreeSpace()).toBe(0);
                            t.expect(feeder.getFeedAt(3).getAt(24)).toBe(newFeed3Rec);
                            let prevFeed3Rec = feeder.getFeedAt(3).getAt(23);
                            t.expect(feeder.getFeedAt(3).getAt(0)).toBe(feed3Rec);

                            let addRec = prop(999, "999");

                            // enforce feed structure
                            feeder.sanitizeFeedsForPage = function () {
                                return true;
                            };

                            let undefinedRecords = {
                                6: [0, 1],
                                9: [0, 1]
                            };

                            let movedRecords = {
                                1: {5: addRec},
                                2: {0: map[1].value[24]},
                                3: {0: map[2].value[24]},
                                7: {0: feeder.getFeedAt(6).getAt(24)},
                                8: {0: map[7].value[24]},
                                10: {0: feeder.getFeedAt(9).getAt(24)},
                                11: {0: map[10].value[24]},
                                12: {0: map[11].value[24]}
                            };

                            op = feeder.addRecord(addRec, RecordPosition.create(1, 5));

                            testOp(op, {
                                success: true
                            }, t);

                            t.expect(feeder.getFeedAt(3).getAt(24)).toBe(prevFeed3Rec);

                            for (let i in undefinedRecords) {
                                for (let a = 0, lena = undefinedRecords[i].length; a < lena; a++) {
                                    t.expect(feeder.getFeedAt(i).getAt(undefinedRecords[i][a])).toBeUndefined();
                                }
                            }

                            for (let i in movedRecords) {
                                let movedMap = movedRecords[i];
                                let feed     = feeder.getFeedAt(i);

                                for (let u in movedMap) {
                                    if (feed) {
                                        t.expect(feed.getAt(u)).toBe(movedMap[u]);
                                    } else {
                                        t.expect(map[i].value[u]).toBe(movedMap[u]);
                                    }
                                }
                            }
                            t.expect(feeder.getFeedAt(3).getFreeSpace()).toBe(0);
                            t.expect(feeder.getFeedAt(8).getFreeSpace()).toBe(0);
                        });
                    });


                    t.it("addRecord - D", (t) => {

                        let op,
                            feeder         = createFeeder(),
                            pageMap        = feeder.getPageMap(),
                            map            = pageMap.map,
                            ADD            = coon.core.data.pageMap.PageMapFeeder.ACTION_ADD,
                            RecordPosition = coon.core.data.pageMap.RecordPosition;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // loaded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            // [1, 2](3:2)  (6:7) [7] (8:7) (9:10) [10,11] (12:11)

                            feeder.swapMapToFeed(3, 2);
                            feeder.getFeedAt(3).extract(1);
                            pageMap.removeAtKey(4);
                            pageMap.removeAtKey(5);
                            feeder.swapMapToFeed(6, 7);
                            feeder.getFeedAt(6).extract(1);
                            feeder.swapMapToFeed(8, 7);
                            feeder.getFeedAt(8).extract(1);
                            feeder.swapMapToFeed(9, 10);
                            feeder.getFeedAt(9).extract(1);
                            feeder.swapMapToFeed(12, 11);
                            feeder.getFeedAt(12).extract(1);

                            t.expect(feeder.prepareForAction(3, ADD)).toEqual([
                                [3], [6, 8], [9, 12]
                            ]);

                            let feed3Rec = prop(777, "777");
                            let newFeed3Rec = feeder.getFeedAt(3).getAt(23);
                            t.expect(newFeed3Rec).toBeTruthy();
                            feeder.getFeedAt(3).fill([feed3Rec]);
                            t.expect(feeder.getFeedAt(3).getFreeSpace()).toBe(0);
                            t.expect(feeder.getFeedAt(3).getAt(24)).toBe(newFeed3Rec);
                            let prevFeed3Rec = feeder.getFeedAt(3).getAt(23);
                            t.expect(feeder.getFeedAt(3).getAt(0)).toBe(feed3Rec);

                            let addRec = prop(999, "999");

                            // enforce feed structure
                            feeder.sanitizeFeedsForPage = function () {
                                return true;
                            };

                            let undefinedRecords = {
                                6: [0, 1],
                                9: [0, 1]
                            };

                            let movedRecords = {
                                3: {5: addRec},
                                7: {0: feeder.getFeedAt(6).getAt(24)},
                                8: {0: map[7].value[24]},
                                10: {0: feeder.getFeedAt(9).getAt(24)},
                                11: {0: map[10].value[24]},
                                12: {0: map[11].value[24]}
                            };

                            op = feeder.addRecord(addRec, RecordPosition.create(3, 5));

                            testOp(op, {
                                success: true
                            }, t);

                            t.expect(feeder.getFeedAt(3).getAt(24)).toBe(prevFeed3Rec);

                            for (let i in undefinedRecords) {
                                for (let a = 0, lena = undefinedRecords[i].length; a < lena; a++) {
                                    t.expect(feeder.getFeedAt(i).getAt(undefinedRecords[i][a])).toBeUndefined();
                                }
                            }

                            for (let i in movedRecords) {
                                let movedMap = movedRecords[i];
                                let feed     = feeder.getFeedAt(i);

                                for (let u in movedMap) {
                                    if (feed) {
                                        t.expect(feed.getAt(u)).toBe(movedMap[u]);
                                    } else {
                                        t.expect(map[i].value[u]).toBe(movedMap[u]);
                                    }
                                }
                            }
                            t.expect(feeder.getFeedAt(3).getFreeSpace()).toBe(0);
                            t.expect(feeder.getFeedAt(8).getFreeSpace()).toBe(0);
                        });

                    });

                    t.it("sanitizerSuspended", (t) => {

                        let feeder = createFeeder(),
                            ADD    = coon.core.data.pageMap.PageMapFeeder.ACTION_ADD;

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            feeder.sanitizerSuspended = true;
                            t.expect(feeder.sanitizeFeedsForPage(1, ADD)).toBe(false);
                            feeder.sanitizerSuspended = false;
                            t.expect(feeder.sanitizeFeedsForPage(1, ADD)).toBe(true);
                        });

                    });


                    t.it("moveRecord - A", (t) => {

                        let exc, op,
                            feeder = createFeeder(),
                            pageMap = feeder.getPageMap(),
                            map = pageMap.map,
                            RecordPosition = coon.core.data.pageMap.RecordPosition,
                            PageMapUtil = coon.core.data.pageMap.PageMapUtil;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            try {feeder.moveRecord(prop(34), RecordPosition.create(5, 10));}catch(e){exc=e;}
                            t.expect(exc).toBeDefined();
                            t.expect(exc.msg).toBeDefined();
                            t.expect(exc.msg.toLowerCase()).toContain("cannot be found");

                            pageMap.removeAtKey(1);
                            try {feeder.moveRecord(map[2].value[3], RecordPosition.create(1, 10));}catch(e){exc=e;}
                            t.expect(exc).toBeDefined();
                            t.expect(exc.msg).toBeDefined();
                            t.expect(exc.msg.toLowerCase()).toContain("does not exist");

                            feeder.createFeedAt(1, 2);
                            feeder.getFeedAt(1).fill(propsMax(20));
                            t.isCalled("moveRecord", PageMapUtil);

                            op = feeder.moveRecord(map[2].value[3], RecordPosition.create(4, 8));
                            t.expect(op).toBeTruthy();
                            t.expect(op.getResult().success).toBe(true);
                            t.expect(op.getResult().to).toBeTruthy();
                            t.expect(op.getResult().from).toBeTruthy();
                            t.expect(op.getResult().record).toBeTruthy();


                            op = feeder.moveRecord(feeder.getFeedAt(1).getAt(17), RecordPosition.create(1, 24));
                            t.expect(op).toBeTruthy();
                            t.expect(op.getResult().success).toBe(true);
                            t.expect(op.getResult().to).toBeTruthy();
                            t.expect(op.getResult().from).toBeTruthy();
                            t.expect(op.getResult().record).toBeTruthy();


                        });

                    });


                    t.it("moveRecord - B", (t) => {

                        let op, feeder = createFeeder(),
                            pageMap = feeder.getPageMap(),
                            map = pageMap.map,
                            RecordPosition = coon.core.data.pageMap.RecordPosition,
                            PageMapUtil = coon.core.data.pageMap.PageMapUtil;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // [1, 2] (3:2) (4:5) [5, 6] ....

                            feeder.swapMapToFeed(3, 2);
                            feeder.getFeedAt(3).extract(1);
                            feeder.swapMapToFeed(4, 5);
                            feeder.getFeedAt(4).extract(1);

                            feeder.swapMapToFeed(7, 6);
                            feeder.getFeedAt(7).extract(1);

                            let rec      = map[1].value[4],
                                recLeft  = map[6].value[1],
                                recRight = map[6].value[2],
                                to       = RecordPosition.create(6, 2);

                            op = feeder.moveRecord(rec, to);
                            t.expect(op).toBeTruthy();
                            t.expect(op.getResult().success).toBe(true);
                            t.expect(op.getResult().to).toBe(to);
                            t.expect(op.getResult().from).toBeTruthy();
                            t.expect(op.getResult().record).toBe(rec);

                            let found = PageMapUtil.findRecord(rec, feeder);
                            t.expect(found).toBeTruthy();
                            t.expect(found.equalTo(RecordPosition.create(to.getPage(), to.getIndex() - 1))).toBe(true);

                            t.expect(map[6].value[0]).toBe(recLeft);
                            t.expect(map[6].value[1]).toBe(rec);
                            t.expect(map[6].value[2]).toBe(recRight);
                        });

                    });


                    t.it("replaceWith()", (t) => {

                        let feeder         = createFeeder(),
                            pageMap        = feeder.getPageMap(),
                            map            = pageMap.map,
                            RecordPosition = coon.core.data.pageMap.RecordPosition,
                            exc, newProp, oldProp, newPropForFeed, oldIndex;


                        t.waitForMs(t.parent.TIMEOUT, () => {

                            newProp        = prop(2113);
                            newPropForFeed = prop(2113);

                            try{feeder.replaceWith(RecordPosition.create(14, 1), newProp);}catch(e){exc = e;}
                            t.expect(exc).toBeDefined();
                            t.expect(exc.msg).toBeDefined();
                            t.expect(exc.msg.toLowerCase()).toContain("does not exist");

                            oldProp  = map[2].value[5];
                            oldIndex = pageMap.indexOf(oldProp);

                            t.expect(feeder.replaceWith(RecordPosition.create(2, 5), newProp)).toBe(oldProp);

                            t.expect(pageMap.indexOf(oldProp)).toBe(-1);
                            t.expect(pageMap.indexOf(newProp)).toBe(oldIndex);

                            feeder.swapMapToFeed(2, 1);

                            t.expect(pageMap.indexOf(newProp)).toBe(-1);

                            t.isCalledNTimes("replaceWith", feeder.getFeedAt(2), 1);
                            t.expect(feeder.replaceWith(RecordPosition.create(2, 5), newPropForFeed)).toBe(newProp);

                            feeder.swapFeedToMap(2);

                            t.expect(pageMap.indexOf(newPropForFeed)).toBe(oldIndex);
                        });
                    });


                    t.it("reset()", (t) => {

                        let feeder = createFeeder();

                        feeder.sanitizerSuspended = true;
                        feeder.feed               = {1: 2};

                        feeder.reset();

                        t.expect(feeder.sanitizerSuspended).toBe(false);
                        t.expect(feeder.feed).toEqual({});


                    });


                    t.it("addRecord() - total count", (t) => {

                        let feeder         = createFeeder(),
                            RecordPosition = coon.core.data.pageMap.RecordPosition;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            let oldCount = feeder.getPageMap().getStore().getTotalCount();

                            feeder.addRecord(prop(4), RecordPosition.create(1, 2));

                            t.expect(feeder.getPageMap().getStore().getTotalCount()).toBe(
                                oldCount + 1
                            );
                        });
                    });


                    t.it("removeRecord() - total count", (t) => {

                        let feeder = createFeeder();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            let oldCount = feeder.getPageMap().getStore().getTotalCount();

                            feeder.removeRecord(feeder.getPageMap().map[1].value[2]);

                            t.expect(feeder.getPageMap().getStore().getTotalCount()).toBe(
                                oldCount - 1
                            );


                        });
                    });


                    t.it("getIndexLookup()", (t) => {

                        let feeder = createFeeder();

                        t.expect(feeder.indexLookup).toBeFalsy();

                        t.expect(feeder.getIndexLookup()).toBe(feeder.indexLookup);

                        t.expect(feeder.indexLookup instanceof coon.core.data.pageMap.IndexLookup);
                    });


                    t.it("add() - A", (t) => {

                        let feeder  = createFeeder({empty: true, sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap = feeder.getPageMap();

                        t.waitForMs(t.parent.TIMEOUT, () => {


                            t.expect(pageMap.map).toEqual({});
                            t.expect(pageMap.getStore().getTotalCount()).toBe(0);

                            let rec = prop(1),
                                op  = feeder.add(rec);

                            t.expect(op.getResult().success).toBe(true);

                            t.expect(op.getResult().to.getPage()).toBe(1);
                            t.expect(op.getResult().to.getIndex()).toBe(0);


                            t.expect(pageMap.map[1]).toBeDefined();
                            t.expect(pageMap.getStore().getTotalCount()).toBe(1);


                        });
                    });


                    t.it("add() - B", (t) => {

                        let feeder   = createFeeder({empty: true, sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap  = feeder.getPageMap(),
                            pageSize = pageMap.getPageSize(),
                            size     = 32, rec, op;

                        t.waitForMs(t.parent.TIMEOUT, () => {


                            t.expect(pageMap.map).toEqual({});
                            t.expect(pageMap.getStore().getTotalCount()).toBe(0);

                            for (var i = 0; i < size; i++) {
                                rec = prop(i + 1);
                                op  = feeder.add(rec);

                                t.expect(op.getResult().success).toBe(true);
                                t.expect(op.getResult().to.getPage()).toBe(Math.floor(i / pageSize) + 1);
                                t.expect(op.getResult().to.getIndex()).toBe(i % pageSize);
                            }

                            t.expect(pageMap.map[1]).toBeDefined();
                            t.expect(pageMap.map[2]).toBeDefined();

                            t.expect(pageMap.getStore().getTotalCount()).toBe(size);


                        });
                    });


                    t.it("add() - C", (t) => {

                        let feeder   = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap  = feeder.getPageMap();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            let totalCount = pageMap.getStore().getTotalCount();

                            let rec = prop(68586588686);
                            let op  = feeder.add(rec);

                            t.expect(op.getResult().success).toBe(false);

                            t.expect(pageMap.getStore().getTotalCount()).toBe(totalCount + 1);

                        });
                    });


                    t.it("add() - D", (t) => {

                        let feeder   = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap  = feeder.getPageMap();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            pageMap.getStore().loadPage(20);

                            t.waitForMs(t.parent.TIMEOUT, () => {

                                let totalCount = pageMap.getStore().getTotalCount();

                                let rec = prop(1323523532),
                                    op  = feeder.add(rec);

                                t.expect(op.getResult().success).toBe(true);

                                t.expect(op.getResult().to.getPage()).toBe(21);
                                t.expect(op.getResult().to.getIndex()).toBe(0);


                                t.expect(pageMap.map[1]).toBeDefined();
                                t.expect(pageMap.getStore().getTotalCount()).toBe(totalCount + 1);

                            });
                        });
                    });


                    t.it("add() - E", (t) => {

                        let feeder   = createFeeder({empty: true, sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap  = feeder.getPageMap(),
                            size     = 32, rec, op, i;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            t.expect(pageMap.map).toEqual({});
                            t.expect(pageMap.getStore().getTotalCount()).toBe(0);

                            for (i = 0; i < size; i++) {
                                rec = prop(0 - i);
                                op  = feeder.add(rec);

                                t.expect(op.getResult().success).toBe(true);
                                t.expect(op.getResult().to.getPage()).toBe(1);
                                t.expect(op.getResult().to.getIndex()).toBe(0);
                            }

                            t.expect(pageMap.map[1]).toBeDefined();
                            t.expect(feeder.getFeedAt(2)).toBeDefined();

                            for (i = size; i < 2 * size; i++) {
                                rec = prop(0 - i);
                                op  = feeder.add(rec);

                                t.expect(op.getResult().success).toBe(true);
                                t.expect(op.getResult().to.getPage()).toBe(1);
                                t.expect(op.getResult().to.getIndex()).toBe(0);
                            }

                            t.expect(pageMap.map[2]).toBeDefined();
                            t.expect(feeder.getFeedAt(3)).toBeDefined();

                            t.expect(pageMap.getStore().getTotalCount()).toBe(2 * size);
                        });
                    });


                    t.it("remove()", (t) => {

                        let feeder   = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap  = feeder.getPageMap();

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            t.isCalled("removeRecord", feeder);
                            t.expect(feeder.remove(pageMap.map[1].value[2])).toBeTruthy();

                        });
                    });


                    t.it("update() - A", (t) => {

                        let feeder      = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            PageMapUtil = coon.core.data.pageMap.PageMapUtil,
                            pageMap     = feeder.getPageMap();

                        t.waitForMs(t.parent.TIMEOUT, () => {


                            let totalCount = pageMap.getStore().getTotalCount();
                            let rec = pageMap.map[1].value[0];

                            rec.set("testPropForIndexLookup", 898979878);

                            let op = feeder.update(rec);

                            t.expect(op.getResult().success).toBe(false);
                            t.expect(op.getResult().to).toBeUndefined();
                            t.expect(op.getResult().from.getPage()).toBe(1);
                            t.expect(op.getResult().from.getIndex()).toBe(0);

                            // record was moved out of the cached data
                            t.expect(PageMapUtil.findRecord(rec, feeder)).toBe(null);

                            t.expect(pageMap.getStore().getTotalCount()).toBe(totalCount);


                        });
                    });


                    t.it("update() - B", (t) => {

                        let feeder   = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap  = feeder.getPageMap();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            pageMap.getStore().loadPage(20);

                            t.waitForMs(t.parent.TIMEOUT, () => {

                                let rec = pageMap.map[1].value[0];
                                rec.set("testPropForIndexLookup", 898979878);

                                let op  = feeder.update(rec);

                                t.expect(op.getResult().success).toBe(true);

                                t.expect(op.getResult().to.getPage()).toBe(20);
                                t.expect(op.getResult().to.getIndex()).toBe(24);

                                t.expect(pageMap.peekPage(20)).toBeTruthy();
                                t.expect(feeder.getFeedAt(20)).toBeFalsy();


                            });
                        });
                    });


                    t.it("reset-callback", (t) => {

                        let feeder   = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap  = feeder.getPageMap();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            feeder.feed = {1: 2};

                            pageMap.generation = 89;
                            pageMap.clear(false);
                            t.expect(feeder.feed).toEqual({});


                            feeder.destroy();
                            feeder = null;

                            pageMap.addPage(1, []);
                            pageMap.generation = 8322;
                            pageMap.clear(false);


                        });
                    });


                    t.it("removeRecord() - last page", (t) => {

                        let feeder      = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap     = feeder.getPageMap(),
                            PageMapUtil = coon.core.data.pageMap.PageMapUtil;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            let lastPage = PageMapUtil.getLastPossiblePageNumber(pageMap);
                            pageMap.getStore().loadPage(lastPage);

                            t.waitForMs(t.parent.TIMEOUT, () => {

                                let remRec = pageMap.map[lastPage].value[2],
                                    op     = feeder.removeRecord(remRec);

                                t.expect(op).toBeTruthy();
                                t.expect(op.getResult().success).toBe(true);
                                t.expect(op.getResult().record).toBe(remRec);

                                t.expect(pageMap.map[lastPage]).toBeDefined();
                                t.expect(feeder.getFeedAt(lastPage)).toBe(null);
                                t.expect(pageMap.map[lastPage + 1]).toBeUndefined();
                                t.expect(feeder.getFeedAt(lastPage + 1)).toBe(null);

                                t.expect(pageMap.indexOf(remRec)).toBe(-1);
                            });

                        });

                    });


                    t.it("isPageCandidate() - feed as highest possible page number", (t) => {
                        let feeder      = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap     = feeder.getPageMap(),
                            PageMapUtil = coon.core.data.pageMap.PageMapUtil;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            let lastPage = PageMapUtil.getLastPossiblePageNumber(pageMap);
                            pageMap.getStore().loadPage(lastPage);

                            t.waitForMs(t.parent.TIMEOUT, () => {

                                feeder.swapMapToFeed(lastPage, lastPage - 1);

                                t.expect(feeder.isPageCandidate(lastPage)).toBe(true);
                                feeder.getFeedAt(lastPage).removeAt(5);
                                feeder.getFeedAt(lastPage).removeAt(1);
                                t.expect(feeder.isPageCandidate(lastPage)).toBe(true);
                            });

                        });
                    });

                    t.it("removeRecord() - feeder", (t) => {

                        let feeder      = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap     = feeder.getPageMap(),
                            PageMapUtil = coon.core.data.pageMap.PageMapUtil,
                            pageSize    = pageMap.getPageSize();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            let lastPage = PageMapUtil.getLastPossiblePageNumber(pageMap);
                            pageMap.getStore().loadPage(lastPage);

                            t.waitForMs(t.parent.TIMEOUT, () => {

                                feeder.swapMapToFeed(lastPage, lastPage - 1);

                                let feed   = feeder.getFeedAt(lastPage),
                                    remRec = feed.getAt(2);

                                feed.removeAt(24);

                                let op = feeder.removeRecord(remRec);

                                t.expect(PageMapUtil.findRecord(remRec, feeder)).toBe(null);
                                t.expect(feeder.getFeedAt(lastPage)).toBe(null);


                                t.expect(op).toBeTruthy();
                                t.expect(op.getResult().success).toBe(true);
                                t.expect(op.getResult().record).toBe(remRec);

                                t.expect(pageMap.map[lastPage]).toBeDefined();
                                t.expect(feeder.getFeedAt(lastPage)).toBe(null);
                                t.expect(pageMap.map[lastPage + 1]).toBeUndefined();
                                t.expect(feeder.getFeedAt(lastPage + 1)).toBe(null);

                                t.expect(pageMap.indexOf(remRec)).toBe(-1);
                                t.expect(pageMap.map[lastPage].value.length).toBe(pageSize - 2);

                            });

                        });

                    });


                    t.it("sanitizeFeedsForPage() - finalizing", (t) => {

                        let feeder  = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap = feeder.getPageMap(),
                            ADD     = coon.core.data.pageMap.PageMapFeeder.ACTION_ADD;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            pageMap.map[3].value = [];

                            t.expect(feeder.sanitizeFeedsForPage(3, ADD)).toBe(true);

                            t.expect(pageMap.map[3]).toBeDefined();
                            t.expect(pageMap.map[3].value).toEqual([]);

                            t.expect(feeder.sanitizeFeedsForPage(3, null, true)).toBe(true);

                            t.expect(pageMap.map[3]).toBeUndefined();

                            feeder.swapMapToFeed(5, 6);
                            feeder.getFeedAt(5).extract(1);
                            pageMap.map[6].value = [];
                            feeder.swapMapToFeed(7, 6);
                            feeder.getFeedAt(7).extract(1);

                            t.expect(feeder.sanitizeFeedsForPage(6, null, true)).toBe(true);
                            t.expect(pageMap.map[6]).toBeDefined();

                        });
                    });


                    t.it("swapMapToFeed() - consider value length instead of pageSize", (t) => {

                        let feeder      = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap     = feeder.getPageMap(),
                            pageSize    = pageMap.getPageSize();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            t.expect(pageMap.map[3].value.length).toBe(pageSize);
                            pageMap.map[3].value.splice(3, 2);
                            t.expect(pageMap.map[3].value.length).not.toBe(pageSize);

                            t.expect(feeder.swapMapToFeed(3, 4)).toBeTruthy();
                            t.expect(feeder.getFeedAt(3).getFreeSpace()).toBeGreaterThan(0);

                            t.expect(feeder.getFeedAt(3).getAt(0)).toBeUndefined();
                            t.expect(feeder.getFeedAt(3).getAt(1)).toBeUndefined();
                            t.expect(feeder.getFeedAt(3).getAt(2)).toBeDefined();
                        });
                    });


                    t.it("hasPreviousFeed() - page 1 does not cause errors due to check for data at page '0'", (t) => {

                        let feeder = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]});

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            t.expect(feeder.hasPreviousFeed(1)).toBe(false);
                        });
                    });


                    t.it("removePageAt() - no listener", (t) => {

                        let exc,
                            feeder  = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap = feeder.getPageMap();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            t.expect(pageMap.map[1]).toBeDefined();
                            feeder.removePageAt(1);
                            t.expect(pageMap.map[1]).toBeUndefined();

                            pageMap.getStore().on("beforepageremove", function (){return false;});

                            try{feeder.removePageAt(2);}catch(e){exc = e;}
                            t.expect(exc).toBeDefined();
                            t.expect(exc.msg).toBeDefined();
                            t.expect(exc.msg.toLowerCase()).toContain("unexpectedly vetoed");
                            t.expect(exc.msg.toLowerCase()).toContain("page");

                            t.expect(pageMap.map[2]).toBeDefined();


                        });
                    });


                    t.it("removePageAt() - listener", (t) => {

                        let feeder      = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap     = feeder.getPageMap();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            t.expect(pageMap.map[1]).toBeDefined();
                            feeder.removePageAt(1);
                            t.expect(pageMap.map[1]).toBeUndefined();

                            pageMap.getStore().on("beforepageremove", function (){return false;});

                            let VETO = 0;
                            feeder.on("cn_core-pagemapfeeder-pageremoveveto", () => {VETO++;});
                            t.expect(VETO).toBe(0);
                            feeder.removePageAt(2);
                            t.expect(VETO).toBe(1);
                            t.expect(pageMap.map[2]).toBeDefined();


                        });
                    });


                    t.it("add() - first and last page available", (t) => {

                        let feeder      = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap     = feeder.getPageMap(),
                            store       = pageMap.getStore(),
                            pageSize    = pageMap.getPageSize(),
                            PageMapUtil = coon.core.data.pageMap.PageMapUtil,
                            cmps = [];

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            t.expect(PageMapUtil.getLastPossiblePageNumber(pageMap)).toBe(20);

                            pageMap.getStore().loadPage(20);

                            t.waitForMs(t.parent.TIMEOUT, () => {

                                t.expect(pageMap.map[1]).toBeDefined();
                                t.expect(pageMap.map[20]).toBeDefined();

                                for (var i = 4; i < 20; i++) {
                                    feeder.removePageAt(i);
                                }

                                for (let i = 0; i < pageSize; i++) {
                                    cmps.push(pageMap.map[20].value[i]);
                                }

                                t.expect(pageMap.map[1]).toBeDefined();
                                t.expect(pageMap.map[2]).toBeDefined();
                                t.expect(pageMap.map[3]).toBeDefined();
                                t.expect(pageMap.map[20]).toBeDefined();

                                let VETOED = 0;
                                store.on("beforepageremove", () => {
                                    return false;
                                });
                                feeder.on("cn_core-pagemapfeeder-pageremoveveto", function (feeder, pageNumber) {
                                    VETOED = pageNumber;
                                });

                                let op = feeder.add(prop(0));
                                t.expect(VETOED).toBe(20);

                                t.expect(feeder.getFeedAt(21)).toBe(null);
                                t.expect(feeder.getFeedAt(4)).not.toBe(null);

                                t.expect(pageMap.map[20]).toBeDefined();
                                t.expect(pageMap.map[20].value.length).toBe(pageSize);
                                for (let i = 0; i < pageSize; i++) {
                                    t.expect(pageMap.map[20].value[i]).toBe(cmps[i]);
                                }

                                t.expect(op.getResult().success).toBe(true);

                            });

                        });
                    });


                    t.it("removeRecord() - issue (A)", (t) => {

                        let feeder      = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap     = feeder.getPageMap(),
                            ADD         = PageMapFeeder.ACTION_ADD,
                            REMOVE      = PageMapFeeder.ACTION_REMOVE;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            loadPages(pageMap.getStore(), [13, 14, 15, 16]);

                            t.waitForMs(t.parent.TIMEOUT, () => {

                                expectPages([...Array(21).keys()].slice(1), pageMap, t);

                                pageMap.removeAtKey(17);
                                pageMap.removeAtKey(18);
                                pageMap.removeAtKey(19);
                                pageMap.removeAtKey(20);

                                t.waitForMs(t.parent.TIMEOUT, () => {

                                    feeder.swapMapToFeed(10, 9);
                                    feeder.swapMapToFeed(14, 13);

                                    t.expect(pageMap.peekPage(1)).toBeTruthy();
                                    t.expect(pageMap.peekPage(2)).toBeTruthy();
                                    t.expect(pageMap.peekPage(3)).toBeTruthy();
                                    t.expect(pageMap.peekPage(4)).toBeTruthy();
                                    t.expect(pageMap.peekPage(5)).toBeTruthy();
                                    t.expect(pageMap.peekPage(6)).toBeTruthy();
                                    t.expect(pageMap.peekPage(7)).toBeTruthy();
                                    t.expect(pageMap.peekPage(8)).toBeTruthy();
                                    t.expect(pageMap.peekPage(9)).toBeTruthy();
                                    t.expect(pageMap.peekPage(10)).toBeFalsy();
                                    t.expect(pageMap.peekPage(11)).toBeTruthy();
                                    t.expect(pageMap.peekPage(12)).toBeTruthy();

                                    t.expect(pageMap.peekPage(13)).toBeTruthy();
                                    t.expect(pageMap.peekPage(14)).toBeFalsy();
                                    t.expect(pageMap.peekPage(15)).toBeTruthy();
                                    t.expect(pageMap.peekPage(16)).toBeTruthy();

                                    t.expect(pageMap.peekPage(17)).toBeFalsy();
                                    t.expect(pageMap.peekPage(18)).toBeFalsy();
                                    t.expect(pageMap.peekPage(19)).toBeFalsy();
                                    t.expect(pageMap.peekPage(20)).toBeFalsy();

                                    t.expect(pageMap.peekPage(21)).toBeFalsy();
                                    t.expect(pageMap.peekPage(22)).toBeFalsy();
                                    t.expect(pageMap.peekPage(23)).toBeFalsy();
                                    t.expect(pageMap.peekPage(24)).toBeFalsy();
                                    t.expect(pageMap.peekPage(25)).toBeFalsy();

                                    feeder.getFeedAt(10).extract(1);
                                    feeder.getFeedAt(14).extract(1);

                                    t.expect(feeder.sanitizeFeedsForPage(8, REMOVE)).toBe(true);

                                    let coll = [];
                                    for (let i in feeder.feed) {
                                        coll.push(i);
                                    }
                                    t.expect(coll).toEqual(["10", "14"]);

                                    // that's okay, we serve from 15 and drop records out of 16
                                    // without adding to a new target

                                    // this must be tested if there exists as Feed (17:18)
                                    t.expect(feeder.prepareForAction(8, ADD)).toEqual([
                                        [10], [11, 14], [15, 17]
                                    ]);

                                    t.expect(feeder.prepareForAction(8, REMOVE)).toEqual([
                                        [10], [11, 14], [15, 16]
                                    ]);

                                    t.expect(feeder.getFeedAt(14).getAt(24)).toBeUndefined();
                                    t.expect(feeder.getFeedAt(14).getAt(23)).toBeDefined();

                                    t.expect(feeder.getFeedAt(16)).toBeDefined();
                                    t.expect(feeder.getFeedAt(15)).toBe(null);
                                    t.expect(pageMap.map[15]).toBeDefined();

                                    let old14_0 = feeder.getFeedAt(14).getAt(0),
                                        feedRec = feeder.getFeedAt(14).getAt(23),
                                        newRec  = pageMap.map[15].value[1],
                                        lostRec = pageMap.map[15].value[0];

                                    t.expect(feedRec).toBeTruthy();

                                    feeder.removeRecord(pageMap.map[8].value[20]);
                                    t.expect(pageMap.map[13].value[24]).toBe(old14_0);
                                    t.expect(pageMap.map[15].value[0]).toBe(newRec);

                                    t.expect(feeder.getFeedAt(14).getAt(24)).toBeUndefined();
                                    t.expect(feeder.getFeedAt(14).getAt(0)).not.toBe(lostRec);
                                    t.expect(feeder.getFeedAt(14).getAt(23)).not.toBe(lostRec);
                                    t.expect(feeder.getFeedAt(14).getAt(23)).toBeUndefined();
                                    t.expect(feeder.getFeedAt(14).getAt(22)).toBe(feedRec);

                                    t.expect(feeder.prepareForAction(8, ADD)).toEqual([
                                        [10], [11, 14]
                                    ]);

                                });
                            });


                        });

                    });


                    t.it("removeRecord() - issue (B)", (t) => {

                        let feeder         = createFeeder({sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap        = feeder.getPageMap(),
                            ADD            = PageMapFeeder.ACTION_ADD,
                            REMOVE         = PageMapFeeder.ACTION_REMOVE,
                            RecordPosition = coon.core.data.pageMap.RecordPosition;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            loadPages(pageMap.getStore(),[13, 14, 15, 16]);

                            t.waitForMs(t.parent.TIMEOUT, () => {

                                expectPages([...Array(21).keys()].slice(1), pageMap, t);

                                pageMap.removeAtKey(19);
                                pageMap.removeAtKey(20);

                                t.waitForMs(t.parent.TIMEOUT, () => {

                                    feeder.swapMapToFeed(10, 9);
                                    feeder.swapMapToFeed(14, 13);
                                    feeder.swapMapToFeed(17, 18);

                                    t.expect(pageMap.peekPage(1)).toBeTruthy();
                                    t.expect(pageMap.peekPage(2)).toBeTruthy();
                                    t.expect(pageMap.peekPage(3)).toBeTruthy();
                                    t.expect(pageMap.peekPage(4)).toBeTruthy();
                                    t.expect(pageMap.peekPage(5)).toBeTruthy();
                                    t.expect(pageMap.peekPage(6)).toBeTruthy();
                                    t.expect(pageMap.peekPage(7)).toBeTruthy();
                                    t.expect(pageMap.peekPage(8)).toBeTruthy();
                                    t.expect(pageMap.peekPage(9)).toBeTruthy();
                                    t.expect(pageMap.peekPage(10)).toBeFalsy();
                                    t.expect(pageMap.peekPage(11)).toBeTruthy();
                                    t.expect(pageMap.peekPage(12)).toBeTruthy();

                                    t.expect(pageMap.peekPage(13)).toBeTruthy();
                                    t.expect(pageMap.peekPage(14)).toBeFalsy();
                                    t.expect(pageMap.peekPage(15)).toBeTruthy();
                                    t.expect(pageMap.peekPage(16)).toBeTruthy();

                                    t.expect(pageMap.peekPage(17)).toBeFalsy();
                                    t.expect(pageMap.peekPage(18)).toBeTruthy();
                                    t.expect(pageMap.peekPage(19)).toBeFalsy();
                                    t.expect(pageMap.peekPage(20)).toBeFalsy();

                                    t.expect(pageMap.peekPage(21)).toBeFalsy();
                                    t.expect(pageMap.peekPage(22)).toBeFalsy();
                                    t.expect(pageMap.peekPage(23)).toBeFalsy();
                                    t.expect(pageMap.peekPage(24)).toBeFalsy();
                                    t.expect(pageMap.peekPage(25)).toBeFalsy();

                                    feeder.getFeedAt(10).extract(1);
                                    feeder.getFeedAt(14).extract(1);
                                    feeder.getFeedAt(17).extract(1);


                                    // that's okay, we serve from 15 and drop records out of 16
                                    // without adding to a new target

                                    // this must be tested if there exists as Feed (17:18)


                                    t.expect(feeder.prepareForAction(8, ADD)).toEqual([
                                        [10], [11, 14], [15, 16], [17, 19]
                                    ]);

                                    t.expect(feeder.getFeedAt(15)).toBeTruthy();
                                    t.expect(feeder.getFeedAt(17).getAt(0)).toBeUndefined();

                                    let rec16_24 = pageMap.map[16].value[24],
                                        rec16_23 = pageMap.map[16].value[23],
                                        rec17_01 = feeder.getFeedAt(17).getAt(1);

                                    feeder.addRecord(prop(19988, 189768), RecordPosition.create(8, 12));

                                    t.expect(pageMap.map[16].value[24]).toBe(rec16_23);

                                    t.expect(feeder.getFeedAt(17).getAt(0)).toBeUndefined();
                                    t.expect(feeder.getFeedAt(17).getAt(1)).toBeUndefined();
                                    t.expect(feeder.getFeedAt(17).getAt(2)).toBe(rec17_01);
                                    t.expect(feeder.getFeedAt(17).getAt(24)).not.toBe(rec16_24);

                                    t.expect(feeder.prepareForAction(8, ADD)).toEqual([
                                        [10], [11, 14], [15, 16], [17, 19]
                                    ]);

                                    t.expect(feeder.getFeedAt(15)).toBeDefined();
                                    t.expect(pageMap.map[16]).toBeDefined();

                                    t.expect(feeder.prepareForAction(8, REMOVE)).toEqual([
                                        [10], [11, 14], [17, 19]
                                    ]);

                                });
                            });


                        });

                    });


                    t.it("extjs-lib-core#4", (t) => {

                        let feeder   = createFeeder({empty: true, sorters: [{property: "testPropForIndexLookup", direction: "ASC"}]}),
                            pageMap  = feeder.getPageMap(),
                            rec;

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            t.expect(pageMap.getStore().getTotalCount()).toBe(0);

                            rec = prop(1);
                            feeder.add(rec);

                            let op  = feeder.update(rec);

                            t.expect(op.getResult().success).toBe(true);

                            t.expect(op.getResult().from).toBe(op.getResult().to);
                        });
                    });


                });});});});});
