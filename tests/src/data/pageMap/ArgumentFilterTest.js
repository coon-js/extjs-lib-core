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

describe('conjoon.cn_core.data.pageMap.ArgumentFilterTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------


    /**
     * filterPageValue
     */
    t.it('filterPageValue()', function (t) {
        let exc, e,
            filter = Ext.create('conjoon.cn_core.data.pageMap.ArgumentFilter');
        try {
            filter.filterPageValue();
        } catch (e) {
            exc = e
        }
        ;
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be a number");
        t.expect(exc.msg.toLowerCase()).toContain("page");
        exc = undefined;

        t.expect(filter.filterPageValue('1')).toBe(1);
        t.expect(filter.filterPageValue(432)).toBe(432);

    });


    /**
     * filterPageMapValue
     */
    t.it('filterPageMapValue()', function (t) {
        let exc, e, pageMap,
            filter = Ext.create('conjoon.cn_core.data.pageMap.ArgumentFilter');
        try {
            filter.filterPageMapValue();
        } catch (e) {
            exc = e
        }
        ;
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");
        t.expect(exc.msg.toLowerCase()).toContain("pagemap");
        exc = undefined;

        pageMap = Ext.create('Ext.data.PageMap');

        t.expect(filter.filterPageMapValue(pageMap)).toBe(pageMap);
    });


    /**
     * filterRecordValue
     */
    t.it('filterRecordValue()', function (t) {
        let exc, e, arg,
            filter = Ext.create('conjoon.cn_core.data.pageMap.ArgumentFilter');
        try {
            filter.filterRecordValue();
        } catch (e) {
            exc = e
        }
        ;
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");
        t.expect(exc.msg.toLowerCase()).toContain("model");
        exc = undefined;

        arg = Ext.create('Ext.data.Model');

        t.expect(filter.filterRecordValue(arg)).toBe(arg);
    });


    /**
     * filterRecordPositionValue
     */
    t.it('filterRecordPositionValue()', function (t) {
        let exc, e, arg,
            filter = Ext.create('conjoon.cn_core.data.pageMap.ArgumentFilter');
        try {
            filter.filterRecordPositionValue();
        } catch (e) {
            exc = e
        }
        ;
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");
        t.expect(exc.msg.toLowerCase()).toContain("recordposition");
        exc = undefined;

        try {
            filter.filterRecordPositionValue(conjoon.cn_core.data.pageMap.RecordPosition.create(3, 4), 'B');
        } catch (e) {
            exc = e
        }
        ;
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be a number");
        t.expect(exc.msg.toLowerCase()).toContain("size");
        exc = undefined;

        try {
            filter.filterRecordPositionValue(conjoon.cn_core.data.pageMap.RecordPosition.create(3, 4), 4);
        } catch (e) {
            exc = e
        }
        ;
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("out of bounds");
        t.expect(exc.msg.toLowerCase()).toContain("index");
        exc = undefined;


        arg = conjoon.cn_core.data.pageMap.RecordPosition.create(3, 1000000);
        t.expect(filter.filterRecordPositionValue(arg, 0)).toBe(arg);

        arg = conjoon.cn_core.data.pageMap.RecordPosition.create(3, 1000000);
        t.expect(filter.filterRecordPositionValue(arg)).toBe(arg);

        arg = conjoon.cn_core.data.pageMap.RecordPosition.create(3, 4);
        t.expect(filter.filterRecordPositionValue(arg, 25)).toBe(arg);
    });


    /**
     * filterRecordValue
     */
     t.it('filterIndexValue()', function(t) {
         let exc, e, arg,
             filter = Ext.create('conjoon.cn_core.data.pageMap.ArgumentFilter');
         try{filter.filterIndexValue();}catch (e) {exc = e};
         t.expect(exc).toBeDefined();
         t.expect(exc.msg).toBeDefined();
         t.expect(exc.msg.toLowerCase()).toContain("out of bounds");
         t.expect(exc.msg.toLowerCase()).toContain("index");
         exc = undefined;

         try{filter.filterIndexValue(3, 'B');}catch (e) {exc = e};
         t.expect(exc).toBeDefined();
         t.expect(exc.msg).toBeDefined();
         t.expect(exc.msg.toLowerCase()).toContain("must be a number");
         t.expect(exc.msg.toLowerCase()).toContain("size");
         exc = undefined;

         try{filter.filterIndexValue(4, 4);}catch (e) {exc = e};
         t.expect(exc).toBeDefined();
         t.expect(exc.msg).toBeDefined();
         t.expect(exc.msg.toLowerCase()).toContain("out of bounds");
         t.expect(exc.msg.toLowerCase()).toContain("size");
         exc = undefined;


         arg = [3, 0];
         t.expect(filter.filterIndexValue.apply(filter, arg)).toBe(arg[0]);

         arg = [3, 100000];
         t.expect(filter.filterIndexValue.apply(filter, arg)).toBe(arg[0]);


         arg = [3, 4];
         t.expect(filter.filterIndexValue.apply(filter, arg)).toBe(arg[0]);
     });


    /**
     * filterRecordsArray
     */
    t.it('filterRecordsArray()', function(t) {
        let exc, e, arg,
            filter = Ext.create('conjoon.cn_core.data.pageMap.ArgumentFilter');
        try{filter.filterRecordsArray();}catch (e) {exc = e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("empty");
        t.expect(exc.msg.toLowerCase()).toContain("records");
        exc = undefined;

        try{filter.filterRecordsArray([]);}catch (e) {exc = e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("empty");
        t.expect(exc.msg.toLowerCase()).toContain("records");
        exc = undefined;

        try{filter.filterRecordsArray([4]);}catch (e) {exc = e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("instances");
        t.expect(exc.msg.toLowerCase()).toContain("records");
        exc = undefined;


        arg = [Ext.create('Ext.data.Model')];
        t.expect(filter.filterRecordsArray(arg)).toBe(arg);



    });

});