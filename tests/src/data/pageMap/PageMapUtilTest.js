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

describe('conjoon.cn_core.data.pageMap.PageMapUtilTest', function(t) {

    var createPageMap = function(cfg) {

        cfg = cfg || {};

        var store;

        store = Ext.create('Ext.data.BufferedStore', {
            autoLoad: true,
            pageSize: 25,
            fields: ['id', 'testProp'],
            proxy: {
                type: 'rest',
                extraParams : {
                    empty : cfg.empty
                },
                url: 'cn_core/fixtures/PageMapItems',
                reader: {
                    type: 'json',
                    rootProperty: 'data'
                }
            }
        });


        return store.getData();

    },
    prop = function(id) {
        return Ext.create('Ext.data.Model', {
            id : id + "" || Ext.id()
        });
    },
    createFeeder = function(empty) {
        return Ext.create('conjoon.cn_core.data.pageMap.PageMapFeeder', {
            pageMap : createPageMap({empty : empty})
        });
    },
    getExpectedId = function(pos, pageMap) {
        return (((pos.getPage() - 1) * pageMap.getPageSize()) + (pos.getIndex() + 1)) + '';
    },
    getExpectedTestProp = function(pos, pageMap) {
        return ((pos.getPage() - 1) * pageMap.getPageSize()) + pos.getIndex();
    },
    checkMaintainedIndex = function(sourcePosition, targetPosition, sourceRecord, pageMap, t) {

        var PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
            tp = targetPosition;

        if (sourcePosition.getPage() < targetPosition.getPage()) {
            // records being shifted down
            tp = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                page  : targetPosition.getPage(),
                index : targetPosition.getIndex() - 1
            })
        } else if (sourcePosition.getPage() === targetPosition.getPage() &&
            sourcePosition.getIndex() < targetPosition.getIndex()) {
            tp = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                page  : targetPosition.getPage(),
                index : targetPosition.getIndex() - 1
            })
        }

        t.expect(
            pageMap.getStore().getAt(PageMapUtil.positionToStoreIndex(tp, pageMap)).getId()
        ).toBe(sourceRecord.getId())

        t.expect(
            pageMap.indexOf(sourceRecord)
        ).toBe(PageMapUtil.positionToStoreIndex(tp, pageMap));
    },
    checkRecords = function(pageMap, t) {
        t.diag("checking record positions")
        var ind = 0;
        for (var i in pageMap.map) {
            var page = pageMap.map[i], rec;
            for (var a = 0, lena = page.value.length; a < lena; a++) {
                rec = page.value[a];

                t.expect(pageMap.indexOf(rec)).toBe(ind);

                ind++;
            }

        }
    },
    checkOrder = function(left, center, right, pageMap, t) {
        t.expect(pageMap.indexOf(left)).toBe(
            pageMap.indexOf(center) -1
        );
        t.expect(pageMap.indexOf(right)).toBe(
            pageMap.indexOf(center) + 1
        );

    },
    createPos = function(page, index) {
        return Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
            page  : page,
            index : index
        })
    },
    createTmpMap = function() {

        var pm = Ext.create('Ext.data.PageMap');
        for (var i = 0, len = arguments.length; i < len; i++) {
            pm.map[arguments[i]] = {};
        }

        return pm;
    },
    propsMax  = function(length, startId) {

            let data = [];

            for (var i = 0;  i < length; i++) {
                data.push(prop(
                    startId ? startId + i : undefined,
                    startId ? startId + i : undefined
                ));
            }

            return data;

        };


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('conjoon.cn_core.fixtures.sim.ItemSim', function(){
    t.requireOk('conjoon.cn_core.data.pageMap.PageMapUtil', function() {
    t.requireOk('conjoon.cn_core.data.pageMap.PageMapFeeder', function() {


        t.it('positionToStoreIndex()', function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                pageMap = Ext.create('Ext.data.PageMap', {
                    pageSize : 25
                }),
                invalid  = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : 4,
                    index : 25
                }),
                expected = [{
                    pos : Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                        page  : 4,
                        index : 5
                    }),
                    result : 80
                }, {
                    pos : Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                        page  : 1,
                        index : 0
                    }),
                    result : 0
                }, {
                    pos : Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                        page  : 1,
                        index : 24
                    }),
                    result : 24
                }];



            try {PageMapUtil.positionToStoreIndex(null, pageMap);} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
            t.expect(exc.msg.toLowerCase()).toContain('position');

            try {PageMapUtil.positionToStoreIndex(expected[0].pos, null);} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
            t.expect(exc.msg.toLowerCase()).toContain('pagemap');

            try {PageMapUtil.positionToStoreIndex(invalid, pageMap);} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('exceeds');
            t.expect(exc.msg.toLowerCase()).toContain('index');

            for (var i = 0, len = expected.length; i < len; i++) {
                t.expect(PageMapUtil.positionToStoreIndex(expected[i].pos, pageMap)).toBe(expected[i].result);
            }


        });


        t.it('storeIndexToPosition()', function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                pageMap = createPageMap(),
                invalid  = 1000000000,
                expected = [{
                    result : createPos(2, 0),
                    pos    : 25
                }, {
                    result : createPos(2, 1),
                    pos    : 26
                }, {
                    result : createPos(5, 5),
                    pos    : 105
                }, {
                    result : createPos(5, 6),
                    pos    : 106
                }, {
                    result : createPos(1, 0),
                    pos    : 0
                }, {
                    result : createPos(1, 24),
                    pos    : 24
                }, {
                    result : createPos(2, 14),
                    pos    : 39
                }];



            t.waitForMs(250, function() {

                try {PageMapUtil.storeIndexToPosition(null, pageMap);} catch (e) {exc = e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain('must be a number');
                t.expect(exc.msg.toLowerCase()).toContain('index');

                try {PageMapUtil.storeIndexToPosition(expected[0].pos, null);} catch (e) {exc = e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
                t.expect(exc.msg.toLowerCase()).toContain('pagemap');

                try {PageMapUtil.storeIndexToPosition(invalid, pageMap);} catch (e) {exc = e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain('exceeds');
                t.expect(exc.msg.toLowerCase()).toContain('total count');


                for (var i = 0, len = expected.length; i < len; i++) {
                    console.log(expected[i].pos, expected[i].result, '->', PageMapUtil.storeIndexToPosition(expected[i].pos, pageMap))
                    t.expect(PageMapUtil.storeIndexToPosition(expected[i].pos, pageMap).equalTo(expected[i].result)).toBe(true);
                }

            });

        });


        t.it('getPageRangeForRecord() - exception Record', function(t) {

            var exc, e;

            try {
                conjoon.cn_core.data.pageMap.PageMapUtil.getPageRangeForRecord(null, new Ext.data.PageMap);
            } catch (e) {
                exc = e;
            }

            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
            t.expect(exc.msg.toLowerCase()).toContain('ext.data.model')

        });

        t.it('getPageRangeForRecord() - exception PageMap', function(t) {

            var exc, e;

            try {
                conjoon.cn_core.data.pageMap.PageMapUtil.getPageRangeForRecord(new Ext.data.Record, null);
            } catch (e) {
                exc = e;
            }

            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
            t.expect(exc.msg.toLowerCase()).toContain('ext.data.pagemap')

        });


        t.it('getPageRangeForRecord() - exception record not member of pageMap', function(t) {

            var exc, e;

            try {
                conjoon.cn_core.data.pageMap.PageMapUtil.getPageRangeForRecord(
                    new Ext.data.Record, new Ext.data.PageMap);
            } catch (e) {
                exc = e;
            }

            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('cannot be found');

        });


        t.it('getPageRangeForRecord()', function(t) {

            var exc, e, pageMap, record, range;

            record  = Ext.create('Ext.data.Model');
            pageMap = Ext.create('Ext.data.PageMap');

            pageMap.map = {1 : [], 2 : [], 8 : [], 9 : [], 15 : []};
            pageMap.indexOf = function() {
                return 1
            };

            pageMap.getPageFromRecordIndex = function() {
                return 9;
            }

            range = conjoon.cn_core.data.pageMap.PageMapUtil.getPageRangeForRecord(
                record, pageMap);

            t.expect(range instanceof conjoon.cn_core.data.pageMap.PageRange).toBe(true);
            t.expect(range.getPages()).toEqual([8, 9])


        });


        t.it('getRightSideRange()', function(t) {

            var exc, e, pageMap, record, range;

            record  = Ext.create('Ext.data.Model');
            pageMap = Ext.create('Ext.data.PageMap');

            pageMap.map = {1 : [], 2 : [], 8 : [], 9 : [], 10 : [], 11 : [], 15 : []};
            pageMap.indexOf = function() {
                return 1
            };

            pageMap.getPageFromRecordIndex = function() {
                return 10;
            }

            range = conjoon.cn_core.data.pageMap.PageMapUtil.getRightSideRange(
                record, pageMap);

            t.expect(range instanceof conjoon.cn_core.data.pageMap.PageRange).toBe(true);
            t.expect(range.getPages()).toEqual([10, 11])


        });


        t.it('getRecordAt() - A', function(t) {
            var pageMap        = createPageMap(),
                map            = pageMap.map,
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                sourcePosition = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : 4,
                    index : 5
                }),
                impossiblePosition = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : 244424,
                    index : 524555
                }), exc, e;

            try {
                PageMapUtil.getRecordAt(null, pageMap);
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('position')
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of')

            try {
                PageMapUtil.getRecordAt(sourcePosition, null);
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('pagemap')
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of')

            // wait for storeload
            t.waitForMs(250, function() {
                t.expect(PageMapUtil.getRecordAt(sourcePosition, pageMap)).toBe(map[4].value[5]);

                try {PageMapUtil.getRecordAt(impossiblePosition, pageMap);}catch(e){exc=e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain("bounds");
                exc = undefined;

            })
        });


        t.it("getRecordAt() - B", function(t) {

            let exc, e, rec, op,
                feeder         = createFeeder(),
                pageMap        = feeder.getPageMap(),
                map            = pageMap.map,
                pageSize       = pageMap.getPageSize(),
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition;

            t.waitForMs(250, function() {

                try{PageMapUtil.getRecordAt(
                    RecordPosition.create(3, 29), feeder);}catch(e){exc=e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain("bounds");
                exc = undefined;

                pageMap.removeAtKey(4);
                pageMap.removeAtKey(5);

                feeder.createFeedAt(4, 3);
                let rec_0 = map[6].value[24];
                // swap the feeds and maps to make sure we test for references
                feeder.swapMapToFeed(6, 7);
                feeder.swapFeedToMap(6);
                feeder.swapMapToFeed(6, 7);

                feeder.getFeedAt(4).fill(propsMax(pageSize - 1));

                t.expect(PageMapUtil.getRecordAt(
                    RecordPosition.create(14, 1), feeder)).toBeUndefined();

                let rec1 = feeder.getFeedAt(4).getAt(17);
                let rec2 = feeder.getFeedAt(6).getAt(9);
                let rec3 = map[1].value[24];

                t.expect(PageMapUtil.getRecordAt(
                    RecordPosition.create(6, 24), feeder)).toBe(rec_0);
                t.expect(PageMapUtil.getRecordAt(
                    RecordPosition.create(4, 17), feeder)).toBe(rec1);
                t.expect(PageMapUtil.getRecordAt(
                    RecordPosition.create(6, 9), feeder)).toBe(rec2);
                t.expect(PageMapUtil.getRecordAt(
                    RecordPosition.create(1, 24), feeder)).toBe(rec3);
            });



        });


        t.it("maintainIndexMap() - exceptions", function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                PageRange   = conjoon.cn_core.data.pageMap.PageRange,
                pageMap     = createPageMap(),
                range;

            try{PageMapUtil.maintainIndexMap(null)}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
            t.expect(exc.msg.toLowerCase()).toContain('pagerange');
            exc = undefined;

            try{PageMapUtil.maintainIndexMap(PageRange.create(1, 2, 3, 4, 5, 6))}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
            t.expect(exc.msg.toLowerCase()).toContain('pagemap');
            exc = undefined;

            t.waitForMs(250, function() {

                pageMap.removeAtKey(5);

                try{PageMapUtil.maintainIndexMap(PageRange.create(1, 2, 3, 4, 5, 6), pageMap)}catch(e){exc = e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain('does not exist');
                exc = undefined;

            });

        });


        t.it("maintainIndexMap()", function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                PageRange   = conjoon.cn_core.data.pageMap.PageRange,
                pageMap     = createPageMap(),
                map         = pageMap.map,
                range, fakeIndex;

            t.waitForMs(250, function() {

                range = [1, 2, 3];

                fakeIndex = 9999;
                for (var i = range[0], len = range[range.length - 1]; i <= len; i++) {
                    for (var a = 0, lena = map[i].value.length; a < lena; a++) {
                        pageMap.indexMap[map[i].value[a].internalId] = fakeIndex++;
                    }
                }

                for (var i = range[0], len = range[range.length - 1]; i <= len; i++) {
                    for (var a = 0, lena = map[i].value.length; a < lena; a++) {
                        t.expect(
                            pageMap.indexMap[map[i].value[a].internalId]
                        ).not.toBe((i - 1) * pageMap.getPageSize() + a);
                    }
                }

                PageMapUtil.maintainIndexMap(PageRange.create(range), pageMap);

                for (var i = range[0], len = range[range.length - 1]; i <= len; i++) {
                    for (var a = 0, lena = map[i].value.length; a < lena; a++) {
                        t.expect(
                            pageMap.indexMap[map[i].value[a].internalId]
                        ).toBe((i - 1) * pageMap.getPageSize() + a);
                        t.expect(
                            pageMap.getStore().getAt((i - 1) * pageMap.getPageSize() + a)
                        ).toBe(map[i].value[a]);
                    }
                }
            });

        });



        t.it("maintainIndexMap() - after remove", function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                PageRange   = conjoon.cn_core.data.pageMap.PageRange,
                pageMap     = createPageMap(),
                map         = pageMap.map,
                range, fakeIndex;

            t.waitForMs(250, function() {

                range = [4, 5, 6];

                pageMap.removeAtKey(1);
                pageMap.removeAtKey(2);
                pageMap.removeAtKey(3);


                fakeIndex = 9999;
                for (var i = range[0], len = range[range.length - 1]; i <= len; i++) {
                    for (var a = 0, lena = map[i].value.length; a < lena; a++) {
                        pageMap.indexMap[map[i].value[a].internalId] = fakeIndex++;
                    }
                }

                for (var i = range[0], len = range[range.length - 1]; i <= len; i++) {
                    for (var a = 0, lena = map[i].value.length; a < lena; a++) {
                        t.expect(
                            pageMap.indexMap[map[i].value[a].internalId]
                        ).not.toBe((i - 1) * pageMap.getPageSize() + a);
                    }
                }

                PageMapUtil.maintainIndexMap(PageRange.create(range), pageMap);

                for (var i = range[0], len = range[range.length - 1]; i <= len; i++) {
                    for (var a = 0, lena = map[i].value.length; a < lena; a++) {
                        t.expect(
                            pageMap.indexMap[map[i].value[a].internalId]
                        ).toBe((i - 1) * pageMap.getPageSize() + a);
                        t.expect(
                            pageMap.getStore().getAt((i - 1) * pageMap.getPageSize() + a)
                        ).toBe(map[i].value[a]);
                    }
                }

            });

        });


        t.it('moveRecord() - exceptions', function(t) {

            var exc, e,
                pageMap        = createPageMap(),
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                sourcePosition = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : 4,
                    index : 2
                }),
                targetPosition = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : 1,
                    index : 0
                }),
                noPosition = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : 113,
                    index : 0
                });

            t.waitForMs(250, function() {
                try {PageMapUtil.moveRecord(null, targetPosition, pageMap);} catch (e) {exc = e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
                t.expect(exc.msg.toLowerCase()).toContain('position');

                try {PageMapUtil.moveRecord(sourcePosition, null, pageMap);} catch (e) {exc = e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
                t.expect(exc.msg.toLowerCase()).toContain('position');

                try {PageMapUtil.moveRecord(sourcePosition, targetPosition, null);} catch (e) {exc = e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
                t.expect(exc.msg.toLowerCase()).toContain('pagemap');

                try {PageMapUtil.moveRecord(sourcePosition, noPosition, pageMap);} catch (e) {exc = e;}
                t.expect(exc.msg.toLowerCase()).toContain('could not determine the ranges of the records being moved');


                pageMap.removeAtKey(2);

                t.expect(pageMap[2]).toBeUndefined();

                try {PageMapUtil.moveRecord(sourcePosition, targetPosition, pageMap);} catch (e) {exc = e;}
                t.expect(exc.msg.toLowerCase()).toContain('are not in the same page range');


            });



        });

        t.it('moveRecord() - same position', function(t) {
            var pageMap        = createPageMap(),
                map            = pageMap.map,
                sourcePage     = 1,
                sourceIndex    = 4,
                targetPage     = 1,
                targetIndex    = 4,
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                sourcePosition = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : sourcePage,
                    index : sourceIndex
                }),
                targetPosition = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : targetPage,
                    index : targetIndex
                }),
                sourceRecord, compareId;// = map[12].value[4];

            // wait for storeload
            t.waitForMs(250, function() {
                sourceRecord = PageMapUtil.getRecordAt(sourcePosition, pageMap);
                compareId    = sourceRecord.get('id');

                t.expect(PageMapUtil.moveRecord(sourcePosition, targetPosition, pageMap)).toBe(true);

                for (var i = 0; i < 25; i++) {
                    t.expect(pageMap.map[1].value[i].getId()).toBe((i + 1) + '');
                }

                checkMaintainedIndex(sourcePosition, targetPosition, sourceRecord, pageMap, t);
                checkRecords(pageMap, t);
            })
        });


        t.it('moveRecord() - same page t < s', function(t) {

            var pageMap         = createPageMap(),
                sourcePage      = 1,
                sourceIndex     = 4,
                targetPage      = 1,
                targetIndex     = 0,
                PageMapUtil     = conjoon.cn_core.data.pageMap.PageMapUtil,
                sourcePosition  = createPos(sourcePage, sourceIndex),
                targetPosition  = createPos(targetPage, targetIndex),
                sourceRecord;// = map[12].value[4];

            // wait for storeload
            t.waitForMs(250, function() {
                sourceRecord = PageMapUtil.getRecordAt(sourcePosition, pageMap);

                t.expect(sourceRecord.get('id')).toBe(
                    getExpectedId(sourcePosition, pageMap)
                );
                t.expect(sourceRecord.get('testProp')).toBe(
                    getExpectedTestProp(sourcePosition, pageMap)
                );

                t.expect(PageMapUtil.moveRecord(sourcePosition, targetPosition, pageMap)).toBe(true);

                var values = pageMap.map[1].value;

                t.expect(values[0].getId()).toBe('5'); // 0
                t.expect(values[1].getId()).toBe('1'); // 1
                t.expect(values[2].getId()).toBe('2'); // 2
                t.expect(values[3].getId()).toBe('3'); // 3
                t.expect(values[4].getId()).toBe('4'); // 4
                t.expect(values[5].getId()).toBe('6'); // 5
                t.expect(values[6].getId()).toBe('7'); // 6
                t.expect(values[7].getId()).toBe('8'); // 7
                t.expect(values[8].getId()).toBe('9'); // 8
                t.expect(values[9].getId()).toBe('10'); // 9
                t.expect(values[10].getId()).toBe('11'); // 10
                t.expect(values[11].getId()).toBe('12'); // 11
                t.expect(values[12].getId()).toBe('13'); // 12
                t.expect(values[13].getId()).toBe('14'); // 13
                t.expect(values[14].getId()).toBe('15'); // 14
                t.expect(values[15].getId()).toBe('16'); // 15
                t.expect(values[16].getId()).toBe('17'); // 16
                t.expect(values[17].getId()).toBe('18'); // 17
                t.expect(values[18].getId()).toBe('19'); // 18
                t.expect(values[19].getId()).toBe('20'); // 19
                t.expect(values[20].getId()).toBe('21'); // 20
                t.expect(values[21].getId()).toBe('22'); // 21
                t.expect(values[22].getId()).toBe('23'); // 22
                t.expect(values[23].getId()).toBe('24'); // 23
                t.expect(values[24].getId()).toBe('25'); // 24


                checkMaintainedIndex(sourcePosition, targetPosition, sourceRecord, pageMap, t);
                checkRecords(pageMap, t);
            });
        });


        t.it('moveRecord() - same page, t > s', function(t) {

            var pageMap         = createPageMap(),
                PageMapUtil     = conjoon.cn_core.data.pageMap.PageMapUtil,
                sourcePosition  = createPos(1, 15),
                targetPosition  = createPos(1, 18),
                sourceRecord, left, right;

            t.waitForMs(250, function() {
                sourceRecord = PageMapUtil.getRecordAt(sourcePosition, pageMap);
                left  = PageMapUtil.getRecordAt(createPos(targetPosition.getPage(), targetPosition.getIndex() - 1), pageMap);
                right = PageMapUtil.getRecordAt(targetPosition, pageMap);

                t.expect(PageMapUtil.moveRecord(sourcePosition, targetPosition, pageMap)).toBe(true);
                checkMaintainedIndex(sourcePosition, targetPosition, sourceRecord, pageMap, t);
                checkOrder(left, sourceRecord, right, pageMap, t);

                var values = pageMap.map[1].value;

                t.expect(values[0].getId()).toBe('1'); // 0
                t.expect(values[1].getId()).toBe('2'); // 1
                t.expect(values[2].getId()).toBe('3'); // 2
                t.expect(values[3].getId()).toBe('4'); // 3
                t.expect(values[4].getId()).toBe('5'); // 4
                t.expect(values[5].getId()).toBe('6'); // 5
                t.expect(values[6].getId()).toBe('7'); // 6
                t.expect(values[7].getId()).toBe('8'); // 7
                t.expect(values[8].getId()).toBe('9'); // 8
                t.expect(values[9].getId()).toBe('10'); // 9
                t.expect(values[10].getId()).toBe('11'); // 10
                t.expect(values[11].getId()).toBe('12'); // 11
                t.expect(values[12].getId()).toBe('13'); // 12
                t.expect(values[13].getId()).toBe('14'); // 13
                t.expect(values[14].getId()).toBe('15'); // 14
                t.expect(values[15].getId()).toBe('17'); // 15 -- *
                t.expect(values[16].getId()).toBe('18'); // 16
                t.expect(values[17].getId()).toBe('16'); // 17
                t.expect(values[18].getId()).toBe('19'); // 18  -- 16
                t.expect(values[19].getId()).toBe('20'); // 19  -- 19
                t.expect(values[20].getId()).toBe('21'); // 20  -- 20
                t.expect(values[21].getId()).toBe('22'); // 21  -- 21
                t.expect(values[22].getId()).toBe('23'); // 22  -- 22
                t.expect(values[23].getId()).toBe('24'); // 23  -- 23
                t.expect(values[24].getId()).toBe('25'); // 24  -- 24
                //     -- 25

                checkRecords(pageMap, t);

            });
        });


        t.it('moveRecord() - same page, t < s ', function(t) {
            var pageMap         = createPageMap(),
                PageMapUtil     = conjoon.cn_core.data.pageMap.PageMapUtil,
                sourcePosition  = createPos(1, 19),
                targetPosition  = createPos(1, 12),
                sourceRecord, left, right;

            t.waitForMs(250, function() {
                left  = PageMapUtil.getRecordAt(createPos(targetPosition.getPage(), targetPosition.getIndex() - 1), pageMap);
                right = PageMapUtil.getRecordAt(targetPosition, pageMap);

                sourceRecord = PageMapUtil.getRecordAt(sourcePosition, pageMap);
                t.expect(PageMapUtil.moveRecord(sourcePosition, targetPosition, pageMap)).toBe(true);
                checkMaintainedIndex(sourcePosition, targetPosition, sourceRecord, pageMap, t);

                var values = pageMap.map[1].value;

                t.expect(values[0].getId()).toBe('1'); // 0
                t.expect(values[1].getId()).toBe('2'); // 1
                t.expect(values[2].getId()).toBe('3'); // 2
                t.expect(values[3].getId()).toBe('4'); // 3
                t.expect(values[4].getId()).toBe('5'); // 4
                t.expect(values[5].getId()).toBe('6'); // 5
                t.expect(values[6].getId()).toBe('7'); // 6
                t.expect(values[7].getId()).toBe('8'); // 7
                t.expect(values[8].getId()).toBe('9'); // 8
                t.expect(values[9].getId()).toBe('10'); // 9
                t.expect(values[10].getId()).toBe('11'); // 10
                t.expect(values[11].getId()).toBe('12'); // 11
                t.expect(values[12].getId()).toBe('20'); // 12 13 20
                t.expect(values[13].getId()).toBe('13'); // 13 14 13
                t.expect(values[14].getId()).toBe('14'); // 14 15 14
                t.expect(values[15].getId()).toBe('15'); // 15 16 15
                t.expect(values[16].getId()).toBe('16'); // 16 17 16
                t.expect(values[17].getId()).toBe('17'); // 17 18 17
                t.expect(values[18].getId()).toBe('18'); // 18 19 18
                t.expect(values[19].getId()).toBe('19'); // 19 20 19
                t.expect(values[20].getId()).toBe('21'); // 20 21 20
                t.expect(values[21].getId()).toBe('22'); // 21 22 21
                t.expect(values[22].getId()).toBe('23'); // 22 23 22
                t.expect(values[23].getId()).toBe('24'); // 23 24 23
                t.expect(values[24].getId()).toBe('25'); // 24 25 24
                //       25
                checkRecords(pageMap, t);
                checkOrder(left, sourceRecord, right, pageMap, t);
            });


        });


        t.it('moveRecord() - target page less than source page', function(t) {

            var pageMap        = createPageMap(),
                map            = pageMap.map,
                sourcePage     = 9,
                sourceIndex    = 14,
                targetPage     = 2,
                targetIndex    = 5,
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                sourcePosition = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : sourcePage,
                    index : sourceIndex
                }),
                targetPosition = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : targetPage,
                    index : targetIndex
                }),
                targetPositionLeft = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : targetPage,
                    index : targetIndex - 1
                }), sourceRecord, leftRecord, rightRecord;

            // wait for storeload
            t.waitForMs(250, function() {
                leftRecord   = PageMapUtil.getRecordAt(targetPositionLeft, pageMap);
                rightRecord   = PageMapUtil.getRecordAt(targetPosition, pageMap);
                sourceRecord = PageMapUtil.getRecordAt(sourcePosition, pageMap);


                t.expect(sourceRecord.get('id')).toBe(
                    getExpectedId(sourcePosition, pageMap)
                );
                t.expect(sourceRecord.get('testProp')).toBe(
                    getExpectedTestProp(sourcePosition, pageMap)
                );

                t.expect(PageMapUtil.moveRecord(sourcePosition, targetPosition, pageMap)).toBe(true);
                checkMaintainedIndex(sourcePosition, targetPosition, sourceRecord, pageMap, t);
                checkOrder(leftRecord, sourceRecord, rightRecord, pageMap, t);

                var storeIndex = 0;
                for (var a in map) {
                    var page = map[a].value;
                    t.expect(page.length).toBe(pageMap.getPageSize());

                    for (var i = 0, len = page.length; i < len; i++) {
                        var rec = page[i];
                        if (a < 2 || (a == 2 && i < 5)) {
                            t.expect(rec.getId()).toBe((storeIndex + 1) + '');
                        } else if (a == 2 && i == 5) {
                            storeIndex--;
                            t.expect(rec.getId()).toBe(getExpectedId(sourcePosition, pageMap));
                        }  else if(a > 9 || (a == 9 && i >= 15)) {
                            t.expect(rec.getId()).toBe((storeIndex + 2) + '');
                        } else {
                            t.expect(rec.getId()).toBe((storeIndex + 1) + '');
                        }

                        storeIndex++;
                    }
                }

                checkRecords(pageMap, t);
            })
        });


        t.it('moveRecord() - target page greater than source page', function(t) {

            var pageMap        = createPageMap(),
                map            = pageMap.map,
                sourcePage     = 4,
                sourceIndex    = 23,
                targetPage     = 8,
                targetIndex    = 19,
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                sourcePosition = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : sourcePage,
                    index : sourceIndex
                }),
                targetPosition = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : targetPage,
                    index : targetIndex
                }),
                targetPositionLeft = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : targetPage,
                    index : targetIndex - 1
                }),
                sourceRecord, targetRecordLeft, targetRecordRight, targetIdL, targetIdR;

            // wait for storeload
            t.waitForMs(250, function() {
                sourceRecord = PageMapUtil.getRecordAt(sourcePosition, pageMap);

                targetRecordLeft  = PageMapUtil.getRecordAt(targetPositionLeft, pageMap);
                targetRecordRight = PageMapUtil.getRecordAt(targetPosition, pageMap);

                t.expect(sourceRecord.get('id')).toBe(
                    getExpectedId(sourcePosition, pageMap)
                );
                t.expect(sourceRecord.get('testProp')).toBe(
                    getExpectedTestProp(sourcePosition, pageMap)
                );

                t.expect(PageMapUtil.moveRecord(sourcePosition, targetPosition, pageMap)).toBe(true);
                checkMaintainedIndex(sourcePosition, targetPosition, sourceRecord, pageMap, t);
                checkOrder(targetRecordLeft, sourceRecord, targetRecordRight, pageMap, t);

                var storeIndex = 0;
                for (var a in map) {
                    var page = map[a].value;
                    t.expect(page.length).toBe(pageMap.getPageSize());

                    for (var i = 0, len = page.length; i < len; i++) {
                        var rec = page[i];
                        if (a == 8 && i != 18) {
                            t.expect(rec.getId()).toBe((storeIndex + 2) + '');
                        } else if (a == 8 && i == 18) {
                            storeIndex--;
                            t.expect(rec.getId()).toBe(getExpectedId(sourcePosition, pageMap));
                        } else if (a == 4 && (i >= 23 && i < 25)) {
                            t.expect(rec.getId()).toBe((storeIndex + 2) + '');
                        } else if (a <= 4) {
                            t.expect(rec.getId()).toBe((storeIndex + 1) + '');
                        } else {
                            t.expect(rec.getId()).toBe((storeIndex + 2) + '');
                        }

                        storeIndex++;
                    }
                }

            })
        });


        t.it('getAvailablePageRanges()', function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                tests = [{
                    map      : createTmpMap(1, 5, 2, 3, 7, 8, 9, 11, 12),
                    expected : [[1, 2, 3], [5], [7, 8, 9], [11, 12]]
                }],
                test, rangeCollection, field;

            try{PageMapUtil.getAvailablePageRanges();}catch(e){exc = e;};
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');


            for (var i = 0, len = tests.length; i < len; i++) {
                test = tests[i];

                rangeCollection = PageMapUtil.getAvailablePageRanges(test.map);

                t.expect(rangeCollection.length).toBe(test.expected.length);

                for (var a = 0, lena = rangeCollection.length; a < lena; a++) {
                    t.expect(rangeCollection[a].toArray()).toEqual(test.expected[a]);
                }
            }
        });


        t.it("getAvailableRanges()", function(t) {

            let exc, e,
                feeder   = createFeeder(),
                pageMap  = feeder.getPageMap(),
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                expected = [[1, 2, 3], [5], [7, 8, 9], [11, 12]];

            t.waitForMs(250, function() {

                try{PageMapUtil.getAvailableRanges();}catch(e){exc = e;};
                t.expect(exc).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
                t.expect(exc.msg.toLowerCase()).toContain('pagemapfeeder');


                pageMap.removeAtKey(3);
                pageMap.removeAtKey(4);
                pageMap.removeAtKey(6);
                pageMap.removeAtKey(9);
                pageMap.removeAtKey(10);
                pageMap.removeAtKey(11);

                feeder.createFeedAt(3, 2);
                feeder.createFeedAt(9, 8);
                feeder.createFeedAt(11, 12);

                let rangeCollection = PageMapUtil.getAvailableRanges(feeder);

                t.expect(rangeCollection.length).toBe(4);

                for (var a = 0, lena = rangeCollection.length; a < lena; a++) {
                    t.expect(rangeCollection[a].toArray()).toEqual(expected[a]);
                }

            });


        });

        t.it("isFirstPageLoaded()", function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil;

            try{PageMapUtil.isFirstPageLoaded()}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');


            t.expect(PageMapUtil.isFirstPageLoaded(createTmpMap(1, 5, 2))).toBe(true);
            t.expect(PageMapUtil.isFirstPageLoaded(createTmpMap(3, 11, 12))).toBe(false);
        });


        t.it("isLastPageLoaded()", function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                pageMap     = createPageMap();

            try{PageMapUtil.isLastPageLoaded()}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');


            t.waitForMs(250, function() {

                t.expect(pageMap.getStore().getTotalCount()).toBe(500);
                t.expect(pageMap.map[1]).toBeDefined();
                t.expect(PageMapUtil.isLastPageLoaded(pageMap)).toBe(false);

                pageMap.getStore().loadPage(20);

                t.waitForMs(250, function() {
                    t.expect(PageMapUtil.isLastPageLoaded(pageMap)).toBe(true);
                });
            });
        });


        t.it("getLastPossiblePageNumber()", function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                pageMap     = createPageMap();

            try{PageMapUtil.getLastPossiblePageNumber()}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');



            t.waitForMs(250, function() {
                t.expect(pageMap.getStore().getTotalCount()).toBe(500);
                t.expect(PageMapUtil.getLastPossiblePageNumber(pageMap)).toBe(20);
            });

        });


        t.it("storeIndexToRange()", function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                pageMap     = createPageMap();

            try{PageMapUtil.storeIndexToRange(null, 9, pageMap)}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be a number');
            exc = undefined;

            try{PageMapUtil.storeIndexToRange(-1, 3, pageMap)}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be greater than or equal');
            exc = undefined;

            try{PageMapUtil.storeIndexToRange(3, -1, pageMap)}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be greater than or equal');
            exc = undefined;

            try{PageMapUtil.storeIndexToRange(3, 4)}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
            exc = undefined;

            t.waitForMs(250, function() {
                t.expect(
                    PageMapUtil.storeIndexToRange(3, 4, pageMap) instanceof conjoon.cn_core.data.pageMap.IndexRange
                ).toBe(true);
            });
        });


        t.it("getPageRangeForPage()", function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                pageMap     = createPageMap(),
                range;

            try{PageMapUtil.getPageRangeForPage(null, pageMap)}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be a number');
            exc = undefined;

            try{PageMapUtil.getPageRangeForPage(-1, pageMap)}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be a number');
            exc = undefined;

            try{PageMapUtil.getPageRangeForPage(4)}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
            exc = undefined;

            t.waitForMs(250, function() {

                pageMap.removeAtKey(2);
                pageMap.removeAtKey(6);

                range = PageMapUtil.getPageRangeForPage(3, pageMap);
                t.expect(range  instanceof conjoon.cn_core.data.pageMap.PageRange).toBe(true);
                t.expect(range.toArray()).toEqual([3, 4, 5]);

                range = PageMapUtil.getPageRangeForPage(6, pageMap);
                t.expect(range).toBe(null);
            });
        });


        t.it("getPageRangeForPage() - flat", function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                pageMap     = createPageMap(),
                range;


            t.waitForMs(250, function() {

                pageMap.removeAtKey(2);
                pageMap.removeAtKey(6);

                range = PageMapUtil.getPageRangeForPage(3, pageMap, true);
                t.expect(Ext.isArray(range)).toBe(true);
                t.expect(range).toEqual([3, 4, 5]);

                range = PageMapUtil.getPageRangeForPage(6, pageMap, true);
                t.expect(range).toBe(null);
            });
        });


        t.it("getRightSidePageRangeForPage()", function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                pageMap     = createPageMap(),
                range;

            t.isCalled('filterPageValue', PageMapUtil);
            t.isCalled('filterPageMapValue', PageMapUtil);

            t.waitForMs(250, function() {

                pageMap.removeAtKey(2);
                pageMap.removeAtKey(6);

                range = PageMapUtil.getRightSidePageRangeForPage(1, pageMap);
                t.expect(Ext.isArray(range)).toBe(true);
                t.expect(range.length).toBe(2);
                t.expect(range[0].toArray()).toEqual([3, 4, 5]);
                t.expect(range[1].toArray()).toEqual([7, 8 , 9, 10, 11, 12]);

                range = PageMapUtil.getRightSidePageRangeForPage(5, pageMap);
                t.expect(range.length).toBe(1);
                t.expect(range[0].toArray()).toEqual([7, 8 , 9, 10, 11, 12]);

                range = PageMapUtil.getRightSidePageRangeForPage(6, pageMap);
                t.expect(range).toBe(null);

                range = PageMapUtil.getRightSidePageRangeForPage(7, pageMap);
                t.expect(range).toBe(null);


            });
        });


        t.it("getRightSidePageRangeForPage() - flat", function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                pageMap     = createPageMap(),
                range;

            t.waitForMs(250, function() {

                pageMap.removeAtKey(2);
                pageMap.removeAtKey(6);

                range = PageMapUtil.getRightSidePageRangeForPage(1, pageMap, true);
                t.expect(Ext.isArray(range)).toBe(true);
                t.expect(range.length).toBe(9);
                t.expect(range).toEqual([3, 4, 5, 7, 8 , 9, 10, 11, 12]);

                range = PageMapUtil.getRightSidePageRangeForPage(5, pageMap, true);
                t.expect(range.length).toBe(6);
                t.expect(range).toEqual([7, 8 , 9, 10, 11, 12]);

                range = PageMapUtil.getRightSidePageRangeForPage(6, pageMap, true);
                t.expect(range).toBe(null);

                range = PageMapUtil.getRightSidePageRangeForPage(7, pageMap, true);
                t.expect(range).toBe(null);


            });
        });


        t.it("findRecord() - A", function(t){

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                feeder      = createFeeder(),
                pageMap     = feeder.getPageMap(),
                range, pos;

            t.waitForMs(250, function() {

                feeder.swapMapToFeed(2, 1);
                pageMap.removeAtKey(3);

                t.expect(PageMapUtil.findRecord(prop(3), feeder)).toBe(null);

                pos = PageMapUtil.findRecord(pageMap.map[5].value[18] , feeder);
                t.expect(pos).not.toBe(null);
                t.expect(pos.getPage()).toBe(5);
                t.expect(pos.getIndex()).toBe(18);

                pos = PageMapUtil.findRecord(feeder.getFeedAt(2).getAt(2), feeder);
                t.expect(pos).not.toBe(null);
                t.expect(pos.getPage()).toBe(2);
                t.expect(pos.getIndex()).toBe(2);
                t.expect(feeder.getFeedAt(2)).toBeTruthy();

            });
        });


        t.it("findRecord() - B", function(t){

            let exc, e, rec, op,
                feeder      = createFeeder(),
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                pageMap     = feeder.getPageMap(),
                map         = pageMap.map,
                pageSize    = pageMap.getPageSize();

            t.waitForMs(250, function() {

                pageMap.removeAtKey(4);
                pageMap.removeAtKey(5);
                pageMap.removeAtKey(6);

                feeder.createFeedAt(4, 3);
                feeder.createFeedAt(6, 7);

                feeder.getFeedAt(4).fill(propsMax(pageSize - 1));
                feeder.getFeedAt(6).fill(propsMax(pageSize - 1));

                t.expect(PageMapUtil.findRecord(Ext.create('Ext.data.Model'), feeder)).toBe(null);

                let rec1 = feeder.getFeedAt(4).getAt(17);
                let rec2 = feeder.getFeedAt(6).getAt(9);

                t.expect(rec1).toBeTruthy();
                t.expect(rec2).toBeTruthy();

                let pos1 = PageMapUtil.findRecord(rec1, feeder);
                t.expect(pos1 instanceof conjoon.cn_core.data.pageMap.RecordPosition);
                t.expect(pos1.getPage()).toBe(4);
                t.expect(pos1.getIndex()).toBe(17);

                let pos2 = PageMapUtil.findRecord(rec2, feeder);
                t.expect(pos2 instanceof conjoon.cn_core.data.pageMap.RecordPosition);
                t.expect(pos2.getPage()).toBe(6);
                t.expect(pos2.getIndex()).toBe(9);
            });


        });


        t.it("getRangeForRecord() - consider Feeds", function(t){

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                feeder      = createFeeder(),
                pageMap     = feeder.getPageMap(),
                range;

            t.waitForMs(250, function() {


                pageMap.removeAtKey(2);
                pageMap.removeAtKey(3);

                feeder.createFeedAt(2, 1);

                range = PageMapUtil.getRangeForRecord(pageMap.map[1].value[2], pageMap);
                t.expect(range).toEqual([1]);

                range = PageMapUtil.getRangeForRecord(pageMap.map[1].value[2], feeder);
                t.expect(range).toEqual([1, 2]);


            });
        });


        t.it("getPageRangeForRecord() - consider Feeds", function(t){

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                feeder      = createFeeder(),
                pageMap     = feeder.getPageMap(),
                range;

            t.waitForMs(250, function() {


                pageMap.removeAtKey(2);
                pageMap.removeAtKey(3);

                feeder.createFeedAt(2, 1);

                range = PageMapUtil.getPageRangeForRecord(pageMap.map[1].value[2], pageMap);
                t.expect(range.toArray()).toEqual([1]);

                range = PageMapUtil.getPageRangeForRecord(pageMap.map[1].value[2], feeder);
                t.expect(range.toArray()).toEqual([1, 2]);
            });

        });


        t.it('getRecordAt() - Feeds', function(t) {
            var feeder         = createFeeder(),
                pageMap        = feeder.getPageMap(),
                map            = pageMap.map,
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                sourcePosition = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : 4,
                    index : 5
                }),
                impossiblePosition = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : 244424,
                    index : 524555
                }), exc, e;

            // wait for storeload
            t.waitForMs(250, function() {

                feeder.swapMapToFeed(4, 3);

                t.expect(PageMapUtil.getRecordAt(sourcePosition, feeder)).toBe(feeder.getFeedAt(4).getAt(5));

                try {PageMapUtil.getRecordAt(impossiblePosition, feeder);}catch(e){exc=e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain("bounds");
                exc = undefined;
            })
        });


        t.it("moveRecord() - Feed - A", function(t) {

            var feeder         = createFeeder(),
                pageMap        = feeder.getPageMap(),
                map            = pageMap.map,
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition,
                mapping = [];

            // wait for storeload
            t.waitForMs(250, function() {

                feeder.swapMapToFeed(4, 3);

                let feed = feeder.getFeedAt(4);

                let rec1  = feed.getAt(3),
                    rec3  = feed.getAt(4),
                    rec24 = feed.getAt(24);


                let from = RecordPosition.create(4, 3),
                    to   = RecordPosition.create(4, 17);

                t.expect(PageMapUtil.moveRecord(from, to, feeder)).toBe(true);

                t.expect(feed.getAt(17)).toBe(rec1);
                t.expect(feed.getAt(3)).toBe(rec3);
                t.expect(feed.getAt(24)).toBe(rec24);

            })

        });


        t.it("moveRecord() - Feed - B", function(t) {

            var feeder         = createFeeder(),
                pageMap        = feeder.getPageMap(),
                map            = pageMap.map,
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition,
                mapping = [];

            // wait for storeload
            t.waitForMs(250, function() {

                feeder.swapMapToFeed(4, 5);

                let feed = feeder.getFeedAt(4);

                let rec1  = feed.getAt(3),
                    rec3  = feed.getAt(4),
                    rec24 = feed.getAt(24);


                let from = RecordPosition.create(4, 3),
                    to   = RecordPosition.create(4, 17);

                t.expect(PageMapUtil.moveRecord(from, to, feeder)).toBe(true);

                t.expect(feed.getAt(17)).toBe(rec1);
                t.expect(feed.getAt(3)).toBe(rec3);
                t.expect(feed.getAt(24)).toBe(rec24);

            })

        });


        t.it("moveRecord() - Feed (f === f) - C", function(t) {

            var feeder         = createFeeder(),
                pageMap        = feeder.getPageMap(),
                map            = pageMap.map,
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition,
                mapping = [];

            // wait for storeload
            t.waitForMs(250, function() {

                feeder.swapMapToFeed(4, 5);

                let feed = feeder.getFeedAt(4);

                let rec1  = feed.getAt(17),
                    rec3  = feed.getAt(18),
                    rec24 = feed.getAt(24);


                let from = RecordPosition.create(4, 17),
                    to   = RecordPosition.create(4, 3);

                t.expect(PageMapUtil.moveRecord(from, to, feeder)).toBe(true);

                t.expect(feed.getAt(3)).toBe(rec1);
                t.expect(feed.getAt(18)).toBe(rec3);
                t.expect(feed.getAt(24)).toBe(rec24);

            })

        });


        t.it("moveRecord() - Feed (p < f) - D", function(t) {

            var feeder         = createFeeder(),
                pageMap        = feeder.getPageMap(),
                map            = pageMap.map,
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition,
                mapping = [];

            // wait for storeload
            t.waitForMs(250, function() {

                feeder.swapMapToFeed(4, 3);

                let feed = feeder.getFeedAt(4);

                let rec1  = map[2].value[15],
                    rec0  = feed.getAt(1),
                    rec24 = feed.getAt(24),
                    rec2_24 = map[3].value[0];


                let from = RecordPosition.create(2, 15),
                    to   = RecordPosition.create(4, 3);

                t.expect(PageMapUtil.moveRecord(from, to, feeder)).toBe(true);

                t.expect(feed.getAt(3)).toBe(rec1);
                t.expect(feed.getAt(24)).toBe(rec24);
                t.expect(feed.getAt(0)).toBe(rec0);
                t.expect(map[2].value[24]).toBe(rec2_24);

            })

        });


        t.it("moveRecord() - Feed (f < f) - E", function(t) {

            var feeder         = createFeeder(),
                pageMap        = feeder.getPageMap(),
                map            = pageMap.map,
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition,
                mapping = [];

            // wait for storeload
            t.waitForMs(250, function() {

                feeder.swapMapToFeed(4, 3);

                feeder.swapMapToFeed(2, 3);
                let feed = feeder.getFeedAt(4),
                    feed2 = feeder.getFeedAt(2);

                let rec1  = feed2.getAt(15),
                    rec0  = feed.getAt(1),
                    rec24 = feed.getAt(24),
                    rec2_24 = map[3].value[0];


                let from = RecordPosition.create(2, 15),
                    to   = RecordPosition.create(4, 3);

                t.expect(PageMapUtil.moveRecord(from, to, feeder)).toBe(true);

                t.expect(feed.getAt(3)).toBe(rec1);
                t.expect(feed.getAt(24)).toBe(rec24);
                t.expect(feed.getAt(0)).toBe(rec0);
                t.expect(feed2.getAt(24)).toBe(rec2_24);

            })

        });


        t.it("moveRecord() - Feed (f > f) - F", function(t) {

            var feeder         = createFeeder(),
                pageMap        = feeder.getPageMap(),
                map            = pageMap.map,
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition,
                mapping = [];

            // wait for storeload
            t.waitForMs(250, function() {

                feeder.swapMapToFeed(4, 3);
                feeder.swapMapToFeed(2, 3);

                let feed4 = feeder.getFeedAt(4),
                    feed2 = feeder.getFeedAt(2);

                let rec1    = feed4.getAt(3),
                    rec3_0  = feed2.getAt(24),
                    rec3_24 = map[3].value[23],
                    rec4_0 = map[3].value[24];

                let from = RecordPosition.create(4, 3),
                    to   = RecordPosition.create(2, 15);

                t.expect(PageMapUtil.moveRecord(from, to, feeder)).toBe(true);

                t.expect(feed2.getAt(15)).toBe(rec1);
                t.expect(feed4.getAt(0)).toBe(rec4_0);
                t.expect(map[3].value[24]).toBe(rec3_24);
                t.expect(map[3].value[0]).toBe(rec3_0);

            })

        });


        t.it("moveRecord() - Feed (p > p) - G", function(t) {

            var feeder         = createFeeder(),
                pageMap        = feeder.getPageMap(),
                map            = pageMap.map,
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition,
                mapping = [];

            // wait for storeload
            t.waitForMs(250, function() {

                let rec1    = map[4].value[3],
                    rec4_0  = map[3].value[24],
                    rec3_0  = map[2].value[24];


                let from = RecordPosition.create(4, 3),
                    to   = RecordPosition.create(2, 15);


                t.expect(PageMapUtil.moveRecord(from, to, feeder)).toBe(true);
                t.expect(map[2].value[15]).toBe(rec1);
                t.expect(map[4].value[0]).toBe(rec4_0);
                t.expect(map[3].value[0]).toBe(rec3_0);
            })
        });


        t.it("moveRecord() - Feed (p > p) - H", function(t) {

            var feeder         = createFeeder(),
                pageMap        = feeder.getPageMap(),
                map            = pageMap.map,
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition,
                mapping = [];

            // wait for storeload
            t.waitForMs(250, function() {

                let rec1    = map[4].value[15],
                    rec4_0  = map[3].value[24],
                    rec3_0  = map[2].value[24];


                let from = RecordPosition.create(4, 15),
                    to   = RecordPosition.create(2, 3);


                t.expect(PageMapUtil.moveRecord(from, to, feeder)).toBe(true);
                t.expect(map[2].value[3]).toBe(rec1);
                t.expect(map[4].value[0]).toBe(rec4_0);
                t.expect(map[3].value[0]).toBe(rec3_0);

            })
        });


        t.it("moveRecord() - Feed (p > f) - I", function(t) {

            var feeder         = createFeeder(),
                pageMap        = feeder.getPageMap(),
                map            = pageMap.map,
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition,
                mapping = [];

            // wait for storeload
            t.waitForMs(250, function() {

                feeder.swapMapToFeed(4, 3);

                let feed = feeder.getFeedAt(4);

                let rec1    = feed.getAt(3),
                    rec4_0  = map[3].value[24],
                    rec3_0  = map[2].value[24];


                let from = RecordPosition.create(4, 3),
                    to   = RecordPosition.create(2, 15);


                t.expect(PageMapUtil.moveRecord(from, to, feeder)).toBe(true);

                t.expect(map[2].value[15]).toBe(rec1);
                t.expect(feed.getAt(0)).toBe(rec4_0);
                t.expect(map[3].value[0]).toBe(rec3_0);

            })

        });


        t.it("moveRecord() - Feed (p < p) - J", function(t) {

            var feeder         = createFeeder(),
                pageMap        = feeder.getPageMap(),
                map            = pageMap.map,
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition,
                mapping = [];

            // wait for storeload
            t.waitForMs(250, function() {

                let rec1 = map[2].value[15];


                let from     = RecordPosition.create(2, 15),
                    to       = RecordPosition.create(4, 0),
                    rec3_24  = map[4].value[0],
                    rec2_24  = map[3].value[0],
                    rec2_15  = map[2].value[16];


                t.expect(PageMapUtil.moveRecord(from, to, feeder)).toBe(true);

                t.expect(map[4].value[0]).toBe(rec1);
                t.expect(map[3].value[24]).toBe(rec3_24);
                t.expect(map[2].value[24]).toBe(rec2_24);
                t.expect(map[2].value[15]).toBe(rec2_15);

            })

        });


        t.it("getRangeForRecord() - consider Feeds (fix)", function(t){

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                feeder      = createFeeder(),
                pageMap     = feeder.getPageMap(),
                range;

            t.waitForMs(250, function() {


                // [1, 2] (3:2) (4:5) [5, 6] ....

                feeder.swapMapToFeed(3, 2);
                feeder.getFeedAt(3).extract(1);
                feeder.swapMapToFeed(4, 5);
                feeder.getFeedAt(4).extract(1);

                feeder.swapMapToFeed(7, 6);
                feeder.getFeedAt(7).extract(1);

                range = PageMapUtil.getPageRangeForRecord(pageMap.map[1].value[2], feeder);
                t.expect(range.toArray()).toEqual([1, 2, 3]);

                range = PageMapUtil.getPageRangeForRecord(feeder.getFeedAt(3).getAt(22), feeder);
                t.expect(range.toArray()).toEqual([1, 2, 3]);

                range = PageMapUtil.getPageRangeForRecord(pageMap.map[5].value[2], feeder);
                t.expect(range.toArray()).toEqual([4, 5, 6, 7]);

                range = PageMapUtil.getPageRangeForRecord(feeder.getFeedAt(4).getAt(2), feeder);
                t.expect(range.toArray()).toEqual([4, 5, 6, 7]);

                range = PageMapUtil.getPageRangeForRecord(feeder.getFeedAt(7).getAt(2), feeder);
                t.expect(range.toArray()).toEqual([4, 5, 6, 7]);


                range = PageMapUtil.getPageRangeForRecord(pageMap.map[12].value[12], feeder);
                t.expect(range.toArray()).toEqual([8, 9, 10, 11, 12]);

                range = PageMapUtil.getPageRangeForRecord(pageMap.map[8].value[12], feeder);
                t.expect(range.toArray()).toEqual([8, 9, 10, 11, 12]);

                range = PageMapUtil.getPageRangeForRecord(pageMap.map[10].value[12], feeder);
                t.expect(range.toArray()).toEqual([8, 9, 10, 11, 12]);

                feeder.swapMapToFeed(8, 9);

                range = PageMapUtil.getPageRangeForRecord(pageMap.map[12].value[12], feeder);
                t.expect(range.toArray()).toEqual([8, 9, 10, 11, 12]);

                range = PageMapUtil.getPageRangeForRecord(feeder.getFeedAt(8).getAt(12), feeder);
                t.expect(range.toArray()).toEqual([8, 9, 10, 11, 12]);

                range = PageMapUtil.getPageRangeForRecord(pageMap.map[10].value[12], feeder);
                t.expect(range.toArray()).toEqual([8, 9, 10, 11, 12]);


                feeder.swapMapToFeed(12, 11);

                range = PageMapUtil.getPageRangeForRecord(feeder.getFeedAt(12).getAt(12), feeder);
                t.expect(range.toArray()).toEqual([8, 9, 10, 11, 12]);

                range = PageMapUtil.getPageRangeForRecord(feeder.getFeedAt(8).getAt(12), feeder);
                t.expect(range.toArray()).toEqual([8, 9, 10, 11, 12]);

                range = PageMapUtil.getPageRangeForRecord(pageMap.map[10].value[12], feeder);
                t.expect(range.toArray()).toEqual([8, 9, 10, 11, 12]);


                feeder.swapFeedToMap(8);
                range = PageMapUtil.getPageRangeForRecord(feeder.getFeedAt(12).getAt(12), feeder);
                t.expect(range.toArray()).toEqual([8, 9, 10, 11, 12]);

                range = PageMapUtil.getPageRangeForRecord(pageMap.map[8].value[12], feeder);
                t.expect(range.toArray()).toEqual([8, 9, 10, 11, 12]);

                range = PageMapUtil.getPageRangeForRecord(pageMap.map[10].value[12], feeder);
                t.expect(range.toArray()).toEqual([8, 9, 10, 11, 12]);


                feeder.swapMapToFeed(1, 2);
                range = PageMapUtil.getPageRangeForRecord(feeder.getFeedAt(1).getAt(2), feeder);
                t.expect(range.toArray()).toEqual([1, 2, 3]);

                range = PageMapUtil.getPageRangeForRecord(feeder.getFeedAt(3).getAt(22), feeder);
                t.expect(range.toArray()).toEqual([1, 2, 3]);

            });
        })


        t.it('getAvailableRanges() - empty store', function(t) {

            var PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                feeder      = createFeeder(true);

            t.waitForMs(250, function() {
                t.expect(PageMapUtil.getAvailableRanges(feeder)).toEqual([]);
            });

        });


        t.it("maintainIndexMap() - page not completely filled", function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                PageRange   = conjoon.cn_core.data.pageMap.PageRange,
                pageMap     = createPageMap(),
                map         = pageMap.map,
                range, fakeIndex;

            t.waitForMs(250, function() {

                range = [4, 5, 6];

                pageMap.removeAtKey(1);
                pageMap.removeAtKey(2);
                pageMap.removeAtKey(3);

                t.expect(pageMap.map[5].value.length).toBe(25)
                pageMap.map[5].value.splice(10, 5);
                t.expect(pageMap.map[5].value.length).toBe(20);

                t.expect(PageMapUtil.maintainIndexMap(PageRange.create(range), pageMap)).toBe(true);

            });

        });


        t.it("isLastPageLoaded() - one page, one record", function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                PageRange   = conjoon.cn_core.data.pageMap.PageRange,
                pageMap     = createPageMap({empty : true}),
                map         = pageMap.map,
                range, fakeIndex;

            t.waitForMs(250, function() {


                pageMap.addPage(1, [prop(1)]);
                pageMap.getStore().totalCount = 1;

                t.expect(map[1].value.length).toBe(1);

                t.expect(PageMapUtil.isLastPageLoaded(pageMap)).toBe(true);
            });

        });


        t.it("getLastPossiblePageNumber() - one page, one record", function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                PageRange   = conjoon.cn_core.data.pageMap.PageRange,
                pageMap     = createPageMap({empty : true}),
                map         = pageMap.map,
                range, fakeIndex;

            t.waitForMs(250, function() {


                pageMap.addPage(1, [prop(1)]);
                pageMap.getStore().totalCount = 1;

                t.expect(map[1].value.length).toBe(1);

                t.expect(PageMapUtil.getLastPossiblePageNumber(pageMap)).toBe(1);
            });

        });


        t.it("getLastPossiblePageNumber() - two pages, one record", function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                PageRange   = conjoon.cn_core.data.pageMap.PageRange,
                pageMap     = createPageMap({empty : true}),
                map         = pageMap.map,
                range, fakeIndex;

            t.waitForMs(250, function() {


                pageMap.addPage(1, [prop(1)]);
                pageMap.addPage(2, [prop(1)]);
                pageMap.getStore().totalCount = 26;

                t.expect(PageMapUtil.getLastPossiblePageNumber(pageMap)).toBe(2);
            });

        });


        t.it('storeIndexToPosition() - ignore total count', function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                pageMap = createPageMap(),
                invalid  = 1000000000;



            t.waitForMs(250, function() {

                let pos = PageMapUtil.storeIndexToPosition(invalid, pageMap, true);
                t.expect(pos.getPage()).toBe(40000001);
                t.expect(pos.getIndex()).toBe(0);
            });

        });

        t.it('storeIndexToRange() - ignore total count', function(t) {

            var exc, e,
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
                pageMap = createPageMap(),
                invalid  = 1000000000;



            t.waitForMs(250, function() {

                let start, end,
                    range = PageMapUtil.storeIndexToRange(invalid, invalid + 1, pageMap, true);

                t.expect(range.getStart().getPage()).toBe(40000001);
                t.expect(range.getStart().getIndex()).toBe(0);

                t.expect(range.getEnd().getPage()).toBe(40000001);
                t.expect(range.getEnd().getIndex()).toBe(1);
            });

        });



        t.it('getRangeForRecord() - works with proper pages array', function(t) {

            let exc, e,
                feeder      = createFeeder(),
                pageMap     = feeder.getPageMap(),
                PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil;

            t.waitForMs(250, function() {

                pageMap.removeAtKey(4);
                pageMap.removeAtKey(5);

                t.expect(pageMap).toBe(feeder.getPageMap());

                rec = pageMap.map[3].value[1];

                let range = PageMapUtil.getRangeForRecord(rec, feeder);

                t.expect(range).toEqual([1, 2, 3]);
            });

        });



})})})});
