/**
 * coon.js
 * lib-cn_core
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/coon-js/lib-cn_core
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

/**
 * Utility mixin to be used for regular argument checks for PageMap related
 * functionality.
 *
 *
 */
Ext.define('coon.core.data.pageMap.ArgumentFilter', {

    requires : [
        'coon.core.data.pageMap.RecordPosition'
    ],

    /**
     * Throws an exception if the passed argument is not a number and less than
     * 1.
     *
     * @param {Mixed} page
     *
     * @return {Number}
     *
     * @throws if the passed argument is not a number and less than
     * 1.
     */
    filterPageValue : function(page) {

        page = parseInt(page, 10);

        if (!Ext.isNumber(page) || page < 1) {
            Ext.raise({
                msg  : '\'page\' must be a number greater than 0',
                page : page
            });
        }

        return page;
    },


    /**
     * Throws an exception if the passed argument is not an instance of
     * {Ext.data.PageMap}
     *
     * @param {Mixed} pageMap
     *
     * @return {Ext.data.PageMap}
     *
     * @throws if if the passed argument is not an instance of
     * {Ext.data.PageMap}
     */
    filterPageMapValue : function(pageMap) {

        if (!(pageMap instanceof Ext.data.PageMap)) {
            Ext.raise({
                msg     : '\'pageMap\' must be an instance of Ext.data.PageMap',
                pageMap : pageMap
            });
        }

        return pageMap;
    },


    /**
     * Throws an exception if the passed argument is not an instance of
     * {Ext.data.PageMap} or {coon.core.data.pageMap.PageMapFeeder}
     *
     * @param {Ext.data.PageMap|coon.core.data.pageMap.PageMapFeeder} value
     *
     * @return {Ext.data.PageMap|coon.core.data.pageMap.PageMapFeeder}
     *
     * @throws if if the passed argument is not an instance of
     * {Ext.data.PageMap} and not an instance of {coon.core.data.pageMap.PageMapFeeder}
     */
    filterPageMapOrFeederValue : function(value) {

        if (!(value instanceof Ext.data.PageMap) && !(value instanceof coon.core.data.pageMap.PageMapFeeder)) {
            Ext.raise({
                msg   : "'value' must be an instance of Ext.data.PageMap or coon.core.data.pageMap.PageMapFeeder",
                value : value
            });
        }

        return value;
    },


    /**
     * Throws an exception if the passed argument is not an instance of
     * {coon.core.data.pageMap.PageMapFeeder}
     *
     * @param {coon.core.data.pageMap.PageMapFeeder} value
     *
     * @return {coon.core.data.pageMap.PageMapFeeder}
     *
     * @throws if if the passed argument is not an instance of
     * {coon.core.data.pageMap.PageMapFeeder}
     */
    filterFeederValue : function(feeder) {

        if (!(feeder instanceof coon.core.data.pageMap.PageMapFeeder)) {
            Ext.raise({
                msg    : "'value' must be an instance of coon.core.data.pageMap.PageMapFeeder",
                feeder : feeder
            });
        }

        return feeder;
    },


    /**
     * Throws an exception if the passed argument is not an instance of
     * {Ext.data.Model}
     *
     * @param {Ext.data.Model} record
     *
     * @return {Ext.data.Model}
     *
     * @throws if if the passed argument is not an instance of
     * {Ext.data.Model}
     */
    filterRecordValue : function(record) {

        if (!(record instanceof Ext.data.Model)) {
            Ext.raise({
                msg    : "'record' must be an instance of Ext.data.Model",
                record : record
            });
        }

        return record;
    },


    /**
     * Throws an exception if the passed argument is not an instance of
     * {coon.core.data.pageMap.RecordPosition}
     *
     * @param {coon.core.data.pageMap.RecordPosition} position
     * @param {Number} The page size to compare the index of the position to.
     * A values less than or equal to 0 skips this check
     *
     * @return {coon.core.data.pageMap.RecordPosition}
     *
     * @throws if if the passed argument is not an instance of
     * {coon.core.data.pageMap.RecordPosition}, or if pageSize is not a number
     *
     * @see #filterIndexValue
     */
    filterRecordPositionValue : function(position, pageSize = 0) {

        const me = this;

        if (!(position instanceof coon.core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg      : "'position' must be an instance of coon.core.data.pageMap.RecordPosition",
                position : position
            });
        }

        me.filterIndexValue(position.getIndex(), pageSize);

        return position;

    },


    /**
     * Filters the index value and checks if it is not greater than or equal to
     * size, if size is not 0.
     *
     * @param {Number} index
     * @param {Number} size
     *
     * @return {Number}
     *
     * @throws if index is not a number, or is size is not a number, or if index
     * is greater than or equal to size, if size is greater than 0
     */
    filterIndexValue :  function(index, size = 0) {

        index = parseInt(index, 10);

        size = parseInt(size, 10);

        if (!Ext.isNumber(size)) {
            Ext.raise({
                msg  : "'size' must be a number",
                size : size
            });
        }

        if (!Ext.isNumber(index) || index < 0 || (size > 0 && index >= size)) {
            Ext.raise({
                msg   : "'index' is out of bounds; index: " + index + "; size: " + size,
                index : index
            });
        }

        return index;
    },


    /**
     * Checks if the passed arguments is a none-empty array of {Ext.data.Model}.
     *
     * @param {Array} records
     *
     * @return {Array} records
     *
     * @throws if records is empty, or if any entry is not an instance of
     * {Ext.data.Model}
     */
    filterRecordsArray : function(records) {

        if (!Ext.isArray(records) || records.length === 0) {
            Ext.raise({
                msg     : '\'records\' must be a none-empty array',
                records : records
            });

        } else {
            Ext.Array.forEach(records, function(value) {
                if (!(value instanceof Ext.data.Model)) {
                    Ext.raise({
                        msg     : '\'records\' must be an array of Ext.data.Model instances',
                        records : records
                    });
                }
            });
        }

        return records;
    }



});

