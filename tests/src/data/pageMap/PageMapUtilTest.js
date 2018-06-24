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
    };


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('conjoon.cn_core.fixtures.sim.ItemSim', function(){
    t.requireOk('conjoon.cn_core.data.pageMap.PageMapUtil', function() {


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
            t.expect(exc.msg.toLowerCase()).toContain('seems not to be a member');

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


        t.it('getRecordAt()', function(t) {
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

                t.expect(PageMapUtil.getRecordAt(impossiblePosition, pageMap)).toBe(null);
            })
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
                t.expect(exc.msg.toLowerCase()).toContain('from');

                try {PageMapUtil.moveRecord(sourcePosition, null, pageMap);} catch (e) {exc = e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
                t.expect(exc.msg.toLowerCase()).toContain('to');

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



    })})});
