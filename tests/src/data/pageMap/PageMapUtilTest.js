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
    };


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('conjoon.cn_core.fixtures.sim.ItemSim', function(){
    t.requireOk('conjoon.cn_core.data.pageMap.PageMapUtil', function() {


        

        t.it('getPageRangeForRecord() - exception Record', function(t) {

            var exc, e;

            try {
                conjoon.cn_core.data.pageMap.PageMapUtil.getPageRangeForRecord(null, new Ext.data.PageMap);
            } catch (e) {
                console.log(e);
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
                console.log(e);
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

                t.expect(PageMapUtil.moveRecord(sourcePosition, noPosition, pageMap)).toBe(false);

                pageMap.removeAtKey(2);

                t.expect(pageMap[2]).toBeUndefined();

                t.expect(PageMapUtil.moveRecord(sourcePosition, targetPosition, pageMap)).toBe(false);


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
                sourceRecord;// = map[12].value[4];

            // wait for storeload
            t.waitForMs(250, function() {
                sourceRecord = PageMapUtil.getRecordAt(sourcePosition, pageMap);

                t.expect(PageMapUtil.moveRecord(sourcePosition, targetPosition, pageMap)).toBe(true);

                for (var i = 0; i < 25; i++) {
                    t.expect(pageMap.map[1].value[i].getId()).toBe((i + 1) + '');
                }

            })
        });


        t.it('moveRecord() - same page', function(t) {

            var pageMap        = createPageMap(),
                map            = pageMap.map,
                sourcePage     = 1,
                sourceIndex    = 4,
                targetPage     = 1,
                targetIndex    = 0,
                PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
                sourcePosition = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : sourcePage,
                    index : sourceIndex
                }),
                targetPosition = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : targetPage,
                    index : targetIndex
                }),
                sourcePosition2 = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : 1,
                    index : 15
                }),
                targetPosition2 = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : 1,
                    index : 18
                }),
                sourcePosition3 = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : 1,
                    index : 19
                }),
                targetPosition3 = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : 1,
                    index : 12
                }),
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

                // 0 1 2 3 4 5 6 7 8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24
                // 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25

                // 0 1 2 3 [4] 5 6 7 8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24
                // 1 2 3 4 [5] 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25

                // 4 0 1 2 3 4 5 6 7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23
                // 5 1 2 3 4 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25

                // 0 1 2 3 4 5 6 7 8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24
                // 5 1 2 3 4 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25

                t.expect(PageMapUtil.moveRecord(sourcePosition, targetPosition, pageMap)).toBe(true);

                // 0 1 2 3 4 5 6 7 8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24
                // 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25

                // 0 1 2 3 4 5 6 7 8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24
                // 5 1 2 3 4 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25
                for (var i = 0; i < 25; i++) {
                    if (i == 0) {
                        t.expect(pageMap.map[1].value[i].getId()).toBe('5')
                    } else if (i <= 4) {
                        t.expect(pageMap.map[1].value[i].getId()).toBe((i) + '')
                    } else {
                        t.expect(pageMap.map[1].value[i].getId()).toBe((i + 1) + '');
                    }
                }

                t.diag('next move')
                t.expect(PageMapUtil.moveRecord(sourcePosition2, targetPosition2, pageMap)).toBe(true);

                // 0 1 2 3 4 5 6 7 8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24
                // 5 1 2 3 4 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25

                //                                           15
                // 0 1 2 3 4 5 6 7 8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24
                // 5 1 2 3 4 6 7 8 9 10 11 12 13 14 15 17 18 16 19 20 21 22 23 24 25

                for (var i = 0; i < 25; i++) {
                    if (i == 0) {
                        t.expect(pageMap.map[1].value[i].getId()).toBe('5')
                    } else if (i <= 4) {
                        t.expect(pageMap.map[1].value[i].getId()).toBe((i) + '')
                    } else if (i <= 14) {
                        t.expect(pageMap.map[1].value[i].getId()).toBe((i + 1) + '');
                    } else if (i <= 16) {
                        t.expect(pageMap.map[1].value[i].getId()).toBe((i + 2) + '');
                    } else if (i == 17) {
                        t.expect(pageMap.map[1].value[i].getId()).toBe('16');
                    } else {
                        t.expect(pageMap.map[1].value[i].getId()).toBe((i + 1) + '');
                    }
                }

                t.diag('next move')
                t.expect(PageMapUtil.moveRecord(sourcePosition3, targetPosition3, pageMap)).toBe(true);
                // 0 1 2 3 4 5 6 7 8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24
                // 5 1 2 3 4 6 7 8 9 10 11 12 13 14 15 17 18 16 19 20 21 22 23 24 25

                // 0 1 2 3 4 5 6 7 8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24
                // 5 1 2 3 4 6 7 8 9 10 11 12 20 13 14 15 17 18 16 19 21 22 23 24 25


                for (var i = 0; i < 25; i++) {
                    if (i == 0) {
                        t.expect(pageMap.map[1].value[i].getId()).toBe('5')
                    } else if (i <= 4) {
                        t.expect(pageMap.map[1].value[i].getId()).toBe((i) + '')
                    } else if (i <= 11) {
                        t.expect(pageMap.map[1].value[i].getId()).toBe((i + 1) + '');
                    } else if (i == 12) {
                        t.expect(pageMap.map[1].value[i].getId()).toBe('20');
                    }else if (i <= 15) {
                        t.expect(pageMap.map[1].value[i].getId()).toBe((i) + '');
                    } else if (i <= 17) {
                        t.expect(pageMap.map[1].value[i].getId()).toBe((i + 1) + '');
                    } else if (i == 18) {
                        t.expect(pageMap.map[1].value[i].getId()).toBe((16) + '');
                    } else if (i == 19) {
                        t.expect(pageMap.map[1].value[i].getId()).toBe((19) + '');
                    } else {
                        t.expect(pageMap.map[1].value[i].getId()).toBe((i + 1) + '');
                    }
                }
            })


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
                });

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
                });

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
                // 4 23 - 8 19
                console.log(pageMap.map);
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







})})});
