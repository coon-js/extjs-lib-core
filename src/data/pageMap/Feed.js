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
 * A Feed represents a former entry of a PageMap that has be detached from it
 * to serve as a local data feeder for other pages, or that was created to be
 * filled with data to serve as a page at one point if enough data is available.
 * A feed can either exist at the beginning of a Page Range or at the end, and
 * this position is specified by either previous or next which are mutual exclusive
 * and point to the page for which the Feed was created, whereas
 *   let n be the index at which the feed was created
 *   #previous must be n - 1
 *   #next must be n + 1
 * but only one of these values can exist for a Feed, thus, a Feed has a left-hand
 * neighbour OR a right hand neighbour, but not both.
 *
 * Note, that during the lifetime of a Feed it is not guaranteed that the previous
 * or next page remains existing in a data collection (such as a PageMap's map)
 * as long as the Feed itself. The purpose of these properties is to give the
 * Feed information for which feeding direction it was created.
 *
 * @example
 *
 *      let feed = Ext.create('conjoon.cn_core.data.pageMap.Feed', {
 *          size : 25,
 *          next : 4
 *      });
 *
 *      let data = [
 *          Ext.create('Ext.data.Model', {id : '1'}),
 *          Ext.create('Ext.data.Model', {id : '2'}),
 *          Ext.create('Ext.data.Model', {id : '3'})
 *      ];
 *
 *      feed.fill(data);
 *
 *      let size = feed.getSize();
 *
 *      // note for how with #next set to 4, this Feed is assumed to represent
 *      // a page at the position 3, and data is available at its end
 *      console.log(feed.getAt(size - 1).getId()); // '3'
 *      console.log(feed.getAt(size - 2).getId()); // '2'
 *      console.log(feed.getAt(size - 3).getId()); // '1'
 *
 *      console.log(feed.getAt(size - 4)); // undefined
 *      console.log(feed.getAt(0)); // undefined
 */
Ext.define('conjoon.cn_core.data.pageMap.Feed', {


    mixins : [
        'conjoon.cn_core.data.pageMap.ArgumentFilter'
    ],


    config : {

        /**
         * @cfg {Number} size
         * The size of the feed, e.g. how many entries it can hold at once
         */
        size : undefined,

        /**
         * @cfg {Mixed} previous
         */
        previous : undefined,

        /**
         * @cfg {Mixed} next
         */
        next : undefined
    },


    /**
     * @type {array} data
     * @private
     */
    data : null,


    /**
     * Creates a new instance.
     *
     * @param {Object} cfg
     * @param {Number} cfg.size The size for this feed
     *
     * @throws if cfg.pageMap is not set
     */
    constructor : function(cfg) {

        var me = this;

        cfg = cfg || {};

        if (!cfg.hasOwnProperty('size')) {
            Ext.raise({
                msg : '\'size\' is required for this class',
                cfg : cfg
            });
        }

        if (!cfg.hasOwnProperty('previous') && !cfg.hasOwnProperty('next')) {
            Ext.raise({
                msg : '\'previous\' or \'next\' is required for this class',
                cfg : cfg
            });
        }

        if (cfg.hasOwnProperty('previous') && cfg.hasOwnProperty('next')) {
            Ext.raise({
                msg : 'either \'previous\' or \'next\' must be set, but not both',
                cfg : cfg
            });
        }

        me.initConfig(cfg);
    },


    /**
     * Returns true is this feed has undefined entries.
     *
     * @return {Boolean}
     */
    hasUndefined : function() {

        const me = this;

        return me.getSize() - me.data.length !== 0;
    },


    /**
     * This method fills a feed with data either at the start of the feed
     * (shifting data up) or the end of the feed (shifting data
     * down) based on the values specified for #previous and #next.
     * Data in records will be treated accordingly:
     * if #previous is defined, records will be popped and unshifted to the feed,
     * but if #next is defined, data will be shifted from the records and pushed
     * onto the feed, until the feed is full or no more data is available in records.
     *
     * @param {Array} an array of {Ext.data.Model}
     * @param {Boolean} reverseDirection true to force filling of the feed from
     * the opposite direction from where it would usually get filled
     *
     *
     * @return {Array} remaining records which fell out during adding the specified
     * records
     *
     * @throws
     * - if data is not an array of {Ext.data.Model}
     *
     * @see #insertAt
     */
    fill : function(records, reverseDirection = false) {

        const me      = this,
              size    = me.getSize(),
              isStart = reverseDirection === true
                        ? !!me.getPrevious()
                        : !me.getPrevious();


        if (isStart) {
            return me.insertAt(records, (size - 1), reverseDirection);
        }

        return me.insertAt(records, 0, reverseDirection);
    },


    /**
     * Tries to look up the specified record in this Feed.
     * Will return its index if found, otherwise -1. Records will be compared
     * using their id, first, than if they represent the same object.
     * Note:
     * =====
     * The index computed is the absolute index based on this Feed's size.
     *
     *
     * @param {Ext.data.Model} record
     *
     * @return {Number}
     *
     * @throws if record is not an instance of Ext.data.Model
     */
    indexOf : function(record) {

        const me      = this,
              isStart = !me.getPrevious();

        let index = - 1,
            i, rec;

        record = me.filterRecordValue(record);

        for (i = 0, len = me.data.length; i < len; i++) {
            rec = me.data[i];

            if (rec.getId() === record.getId() && rec === record) {
                index = i;
                break;
            }
        }

        if (index === -1) {
            return -1;
        }

        return isStart
               ? me.getSize() - (me.data.length - index)
               : index;
    },


    /**
     * Removes the entry at the specified index.
     * Note:
     * =====
     * Calling APIs should consider the fill order for Feeds depending on #previous
     * and #next. see #fill The index expected is the index based on the pageSize
     * and the fill-order. Counting starts left or right (i.e. beginning or end)
     * of the Feed.
     *
     * @param {Number} index
     *
     * @return undefined if the entry at the specified position was not defined,
     * otherwise the record that was removed
     *
     * @throws if index is less than 0 or greater than #size - 1
     */
    removeAt : function(index) {

        const me     = this,
              size    = me.getSize(),
              isStart = !me.getPrevious();

        index = me.filterIndexValue(index, size);

        if (isStart) {
            index = index  - (size - me.data.length);
        }

        if (!me.data[index]) {
            return undefined;
        }

        return me.data.splice(index, 1)[0];
    },


    /**
     * Replaces the record at the specified index with the specified record.
     *
     * @param {Number} index
     * @param {Ext.data.Model} record
     *
     * @return {Ext.data.Model} The record that was replaced
     *
     * @throws if the given index is not set in this target Feed
     */
    replaceWith : function(index, record) {

        const me     = this,
            size    = me.getSize(),
            isStart = !me.getPrevious();

        index  = me.filterIndexValue(index, size);
        record = me.filterRecordValue(record);

        if (isStart) {
            index = index  - (size - me.data.length);
        }

        if (!me.data[index]) {
            Ext.raise({
                msg   : "no record to replace at target index " + index,
                index : index
            });
        }

        let old = me.data[index];

        me.data[index] = record;

        return old;
    },

    
    /**
     * Inserts the specified records at the specified index, and returns any
     * records that are pushed out of the Feed. The Feed's bounds are denoted by
     * #size.
     * If the index computed based on the page this Feed is serving is undefined,
     * the data will be appended/prepended to the Feed.
     * The default behavior for this method is, that records fall out at the side
     * which is not serving a page, until reverseDirection is set to true
     * NOTE:
     * A feed that serves a next page grows to the left.
     *
     *  feed.getNext() === 2
     *  [23, 24, 25, 26]
     *    A   B   C   D
     *  feed.insertAt(24, X)
     *  [22, 23, 24, 25, 26]
     *   A   B   X   C   D
     *
     *
     * @param {Array} an array of {Ext.data.Model}  to insert
     * @param {Number} index The position in Feed where the entries should be added
     * @param {Boolean} reverseDirection true to force filling of the feed from
     * the opposite direction from where it would usually get filled
     *
     * @return an array with records that did not fit into the Feed anymore, or
     * an empty array if no record spill was caused by the insert operation
     *
     * @throws if index is less than 0 or greater than #size - 1
     */
    insertAt : function(records, index, reverseDirection = false) {

        const me      = this,
              size    = me.getSize(),
              data    = me.data,
              isStart = reverseDirection === true
                        ? !!me.getPrevious()
                        : !me.getPrevious();

        records = me.filterRecordsArray(records);
        index  = me.filterIndexValue(index, size);

        // copy so we do not slice and splice the original reference
        let tmp = [];
        for (let i = 0, len = records.length; i < len; i++) {
            tmp.push(records[i]);
        }
        records = tmp;

        if (isStart) { // 10, 25, 10 ->      10 -  15     // 5 - (25 - 10)
            index = index  - (size - me.data.length);
        }

        // 4 (24, 23, 22, 21) -> 20 ( => 4, 3, 2, 1, 0)
        // 12
        // 25 - 4 => 21

        if (!data[index]) {
            index = isStart
                    ? -1
                    : me.data.length;
        }


        let dataSpill = [];

        Array.prototype.splice.apply(data, [index + (isStart ? 1 : 0), 0].concat(records));

        let len = data.length;

        if (len > size) {
            dataSpill = isStart
                        ? data.splice(0, len - size)
                        : data.splice(size, len - size);
        }

        return dataSpill;
    },


    /**
     * Removes the specified number of records from either the start
     * or the end of the Feed, depending on #next and #previous.
     * This method is a convenient shortcut to popping/shifting data when the
     * feed should be used as a "feeder" for pages.
     * Bey default, data from Feeds that have a previous page are extracted from
     * the beginning, otherwise from the end. This is so that data can virtually
     * shift down into the direction where the sibling page they are serving
     * can be found.
     * The arguments reverseDirection lets you change this default behavior.
     *
     * @param {Number} count The number of data entries to extract
     * @param {Boolean} reverseDirection true to reverse the direction data
     * is usually extracted from
     *
     * @return {Array} an array with the records from this feed. The length
     * might be less than the requested number of data to extract if there are
     * not enough entries to satisfy "count"
     *
     * @throws if index is less than 1 or greater than page size
     */
    extract : function(count, reverseDirection = false) {

        const me      = this,
              size    = me.getSize(),
              isStart = reverseDirection === true
                        ? !!me.getPrevious()
                        : !me.getPrevious();

        count = parseInt(count, 10);

        if (!Ext.isNumber(count) || (count < 1 || count > size)) {
            Ext.raise({
                msg   : "'count' is out of bounds",
                count : count
            });
        }

        if (isStart) {
            recs = me.data.splice(Math.max(0, me.data.length - count), count);

            return recs;
        }

        recs = me.data.splice(0, count);

        return recs;
    },


    /**
     * Returns the entry in this feed at the given index. Counting starts at 0
     * for the first entry.
     * Note:
     * =====
     * Calling APIs should consider the fill order for Feeds depending on #previous
     * and #next. see #fill
     *
     * @param {Number} index
     *
     * @return undefined if the entry was not set, otherwise the Ext.data.Model
     *
     * @throws if index is less than 0 or greater than #size - 1
     */
    getAt : function(index) {

        const me      = this,
              size    = me.getSize(),
              isStart = !me.getPrevious();

        index = parseInt(index, 10);

        if (index < 0 || index > size -1) {
            Ext.raise({
                msg   : "'index' is out of bounds",
                index : index
            });
        }

        if (isStart) {
            return me.data[index  - (size - me.data.length)];
        }

        return me.data[index];
    },


    /**
     * Returns an array representation of this Feed.
     *
     * @return {Array}
     */
    toArray : function() {

        const me = this;

        return me.data;

    },


    /**
     * Counts the empty positions in this Feed.
     *
     * @return {Number}
     */
    getFreeSpace : function() {

        const me = this;

        return me.getSize() - me.data.length;
    },


    /**
     * Returns true if this Feed is completely empty.
     *
     * @return {Boolean}
     */
    isEmpty : function() {

        const me = this;

        return me.data.length === 0;
    },


// -------- apply*

    /**
     * Applies the size to this instance
     *
     * @param {Number} size
     *
     * @throws if size was already set, or if size is not a number or a number
     * less than 1
     */
    applySize : function(size) {

        const me = this;

        if (me.getSize() !== undefined) {
            Ext.raise({
                msg  : '\'size\' is already set',
                size : me.getSize()
            });
        }

        size = parseInt(size, 10);

        if (!Ext.isNumber(size) || size < 1) {
            Ext.raise({
                msg  : '\'size\' must be a number greater than 0',
                size : size
            });
        }

        me.data = [];

        return size;
    },


    /**
     * Applies the "previous" page number to this instance.
     *
     * Note:
     * =====
     * #previous and #next are mutual exclusive
     *
     * @param {Number} previous
     *
     * @throws if previous was already set, or if next was already set
     *
     * @see #next
     */
    applyPrevious : function(previous) {

        const me = this;

        return me.setPageHint('previous', previous);
    },


    /**
     * Applies the "next" page number to this instance.
     *
     * Note:
     * =====
     * #previous and #next are mutual exclusive
     *
     * @param {Number} next
     *
     * @throws if next was already set, or if previous was already set
     *
     * @see #previous
     */
    applyNext : function(next) {

        const me = this;

        return me.setPageHint('next', next);
    },


    /**
     * @private
     */
    setPageHint : function(type, value) {

        const me          = this,
              getter      = 'get' + type[0].toUpperCase() + type.substring(1),
              pend        = type === 'next' ? 'previous'  : 'next',
              pendGetter  = 'get' + pend[0].toUpperCase() + pend.substring(1),
              initializer = 'is' + type[0].toUpperCase() + type.substring(1) + 'Initializing';

        // abort here if the initializer for the mutual exclusive property
        // is currently running so it can safely apply undefined
        if (me[initializer]) {
            return;
        }

        if (me[getter]() !== undefined) {
            Ext.raise({
                msg   : '\'' + type + '\' is already set',
                value :me[getter]()
            });
        }

        if (me[pendGetter]() !== undefined) {
            Ext.raise({
                msg   : '\'' + pend + '\' is already set, cannot set both',
                value : me[pendGetter]()
            });
        }

        return me.filterPageValue(value);
    }


});