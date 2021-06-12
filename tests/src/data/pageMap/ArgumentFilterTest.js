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


    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------
    t.requireOk("coon.core.data.pageMap.PageMapFeeder", function (){

        /**
     * filterPageValue
     */
        t.it("filterPageValue()", (t) => {
            let exc,
                filter = Ext.create("coon.core.data.pageMap.ArgumentFilter");
            try {
                filter.filterPageValue();
            } catch (e) {
                exc = e;
            }
            
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be a number");
            t.expect(exc.msg.toLowerCase()).toContain("page");
            exc = undefined;

            t.expect(filter.filterPageValue("1")).toBe(1);
            t.expect(filter.filterPageValue(432)).toBe(432);

        });


        /**
     * filterPageMapValue
     */
        t.it("filterPageMapValue()", (t) => {
            let exc, pageMap,
                filter = Ext.create("coon.core.data.pageMap.ArgumentFilter");
            try {
                filter.filterPageMapValue();
            } catch (e) {
                exc = e;
            }
            
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");
            t.expect(exc.msg.toLowerCase()).toContain("pagemap");
            exc = undefined;

            pageMap = Ext.create("Ext.data.PageMap");

            t.expect(filter.filterPageMapValue(pageMap)).toBe(pageMap);
        });


        /**
     * filterRecordValue
     */
        t.it("filterRecordValue()", (t) => {
            let exc, arg,
                filter = Ext.create("coon.core.data.pageMap.ArgumentFilter");
            try {
                filter.filterRecordValue();
            } catch (e) {
                exc = e;
            }
            
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");
            t.expect(exc.msg.toLowerCase()).toContain("model");
            exc = undefined;

            arg = Ext.create("Ext.data.Model");

            t.expect(filter.filterRecordValue(arg)).toBe(arg);
        });


        /**
     * filterRecordPositionValue
     */
        t.it("filterRecordPositionValue()", (t) => {
            let exc, arg,
                filter = Ext.create("coon.core.data.pageMap.ArgumentFilter");
            try {
                filter.filterRecordPositionValue();
            } catch (e) {
                exc = e;
            }
            
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");
            t.expect(exc.msg.toLowerCase()).toContain("recordposition");
            exc = undefined;

            try {
                filter.filterRecordPositionValue(coon.core.data.pageMap.RecordPosition.create(3, 4), "B");
            } catch (e) {
                exc = e;
            }
            
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be a number");
            t.expect(exc.msg.toLowerCase()).toContain("size");
            exc = undefined;

            try {
                filter.filterRecordPositionValue(coon.core.data.pageMap.RecordPosition.create(3, 4), 4);
            } catch (e) {
                exc = e;
            }
            
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("out of bounds");
            t.expect(exc.msg.toLowerCase()).toContain("index");
            exc = undefined;


            arg = coon.core.data.pageMap.RecordPosition.create(3, 1000000);
            t.expect(filter.filterRecordPositionValue(arg, 0)).toBe(arg);

            arg = coon.core.data.pageMap.RecordPosition.create(3, 1000000);
            t.expect(filter.filterRecordPositionValue(arg)).toBe(arg);

            arg = coon.core.data.pageMap.RecordPosition.create(3, 4);
            t.expect(filter.filterRecordPositionValue(arg, 25)).toBe(arg);
        });


        /**
     * filterRecordValue
     */
        t.it("filterIndexValue()", (t) => {
            let exc, arg,
                filter = Ext.create("coon.core.data.pageMap.ArgumentFilter");
            try{filter.filterIndexValue();}catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("out of bounds");
            t.expect(exc.msg.toLowerCase()).toContain("index");
            exc = undefined;

            try{filter.filterIndexValue(3, "B");}catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be a number");
            t.expect(exc.msg.toLowerCase()).toContain("size");
            exc = undefined;

            try{filter.filterIndexValue(4, 4);}catch (e) {exc = e;}
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
        t.it("filterRecordsArray()", (t) => {
            let exc, arg,
                filter = Ext.create("coon.core.data.pageMap.ArgumentFilter");
            try{filter.filterRecordsArray();}catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("empty");
            t.expect(exc.msg.toLowerCase()).toContain("records");
            exc = undefined;

            try{filter.filterRecordsArray([]);}catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("empty");
            t.expect(exc.msg.toLowerCase()).toContain("records");
            exc = undefined;

            try{filter.filterRecordsArray([4]);}catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("instances");
            t.expect(exc.msg.toLowerCase()).toContain("records");
            exc = undefined;


            arg = [Ext.create("Ext.data.Model")];
            t.expect(filter.filterRecordsArray(arg)).toBe(arg);
        });


        /**
     * filterPageMapOrFeederValue
     */
        t.it("filterPageMapOrFeederValue()", (t) => {
            let exc, pageMap,
                filter = Ext.create("coon.core.data.pageMap.ArgumentFilter");

            try {filter.filterPageMapOrFeederValue();} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");
            t.expect(exc.msg.toLowerCase()).toContain("value");
            exc = undefined;

            pageMap = Ext.create("Ext.data.PageMap", {store: Ext.create("Ext.data.BufferedStore")});
            t.expect(filter.filterPageMapOrFeederValue(pageMap)).toBe(pageMap);

            let feeder = Ext.create("coon.core.data.pageMap.PageMapFeeder", {
                pageMap: pageMap
            });
            t.expect(filter.filterPageMapOrFeederValue(feeder)).toBe(feeder);
        });


        /**
     * filterFeederValue
     */
        t.it("filterFeederValue()", (t) => {
            let exc, pageMap,
                filter = Ext.create("coon.core.data.pageMap.ArgumentFilter");

            try {filter.filterFeederValue();} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");
            t.expect(exc.msg.toLowerCase()).toContain("feeder");
            exc = undefined;

            pageMap = Ext.create("Ext.data.PageMap", {store: Ext.create("Ext.data.BufferedStore")});
            let feeder = Ext.create("coon.core.data.pageMap.PageMapFeeder", {
                pageMap: pageMap
            });
            t.expect(filter.filterFeederValue(feeder)).toBe(feeder);
        });

    });


});