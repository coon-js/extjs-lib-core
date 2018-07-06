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
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
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
     *
     * @return {Array} remaining records which could not be added to the feed
     * anymore are returned in an array, or an empty array if all data was added.
     *
     * @throws
     * - if data is not an array of {Ext.data.Model}
     */
    fill : function(records) {

        const me      = this,
              size    = me.getSize(),
              free    = me.getFreeSpace(),
              isStart = !me.getPrevious();

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

        let data = me.data,
            len  = records.length,
            recs;

        if (isStart) {
            recs = records.splice(0, free);
            me.data = data.concat(recs);

            return records;
        }

        recs = records.splice(Math.max(0, records.length - free), free);
        Array.prototype.unshift.apply(me.data, recs);

        return records;
    },


    /**
     * Removes the specified number of records from either the start
     * or the end of the Feed, depending on #next and #previous.
     * This method is a convenient shortcut to popping/shifting data when the
     * feed should be used as a "feeder" for pages.
     *
     * @param {Number} count The number of data entries to extract
     *
     * @return {Array} an array with the records from this feed. The length
     * might be less than the requested number of data to extract if there are
     * not enough entries to satisfy "count"
     *
     * @throws if index is less than 1 or greater than page size
     */
    extract : function(count) {

        const me      = this,
              size    = me.getSize(),
              isStart = !me.getPrevious();

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

        me.data = new Array();

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