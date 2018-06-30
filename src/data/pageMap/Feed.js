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
 * its role is specified in "position" which either equals to "start" or "end".
 * (see conjoon.cn_core.data.pageMap.Feed.POSITION_START and conjoon.cn_core.data.pageMap.Feed.POSITION_END).
 * The position of a Feed determines the direction from where it gets filled
 * and from where data gets removed.
 *
 * @example
 *
 *      let feed = Ext.create('conjoon.cn_core.data.pageMap.Feed', {
 *          size     : 25,
 *          position : conjoon.cn_core.data.pageMap.Feed.POSITION_START
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
 *      // note for how POSITION_START will start feeding the Feed at its end.
 *      console.log(feed.getAt(size - 1).getId()); // '3'
 *      console.log(feed.getAt(size - 2).getId()); // '2'
 *      console.log(feed.getAt(size - 3).getId()); // '1'
 *
 *      console.log(feed.getAt(size - 4)); // undefined
 *      console.log(feed.getAt(0)); // undefined
 *
 * Note:
 * =====
 * An empty feed is an array filled up with n (n = pageSize) undefined values.
 * This is available as soon as the Feed was created.
 */
Ext.define('conjoon.cn_core.data.pageMap.Feed', {

    statics : {
        /**
         * @type {Number}
         */
        POSITION_START : -1,

        /**
         * @type {Number}
         */
        POSITION_END : 1

    },

    config : {

        /**
         * @cfg {Number} size
         * The size of the feed, e.g. how many entries it can hold at once
         */
        size : undefined,

        /**
         * @cfg {Mixed} position
         */
        position : undefined
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

        if (!cfg.hasOwnProperty('position')) {
            Ext.raise({
                msg : '\'position\' is required for this class',
                cfg : cfg
            });
        }

        me.initConfig(cfg);

        me.data = new Array(me.getSize());
        me.data.fill(undefined, 0 , me.getSize());

    },


    /**
     * Returns true is this feed has undefined entries.
     *
     * @return {Boolean}
     */
    hasUndefined : function() {

        const me = this;

        return me.data[0] === undefined ||
               me.data[me.getSize() - 1] === undefined;
    },


    /**
     * This method fills a feed with data either at the start of the feed
     * (shifting data up) or the end of the feed (shifting data
     * down) based on the specified #position for this Feed.
     * Data in records will be treated accordingly to position of this Feed:
     * if the position is POSITION_END, records will be popped and unshifted to the feed,
     * if it is POSITION_START, data will be shifted from the records and pushed
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
              isStart = me.getPosition() === me.statics().POSITION_START;

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
            data.splice(0, recs.length);
            me.data = data.concat(recs);

            return records;
        }

        recs = records.splice(Math.max(0, records.length - free), free);
        data.splice(size - recs.length, recs.length);
        Array.prototype.unshift.apply(me.data, recs);

        return records;
    },


    /**
     * Removes the specified number of records from either the start
     * (#POSITION_END) or the end (#POSITION_START) of the Feed.
     * This method is a convenient shortcut to popping/shifting data when the
     * feed should be used as a "feeder" for pages.
     * Freed positions will be marked explicitely as undefined in this feed.
     *
     * @param {Number} count The number of data entries to extract
     *
     * @return {Array} an array with the records from this feed. The length
     * might be less than the requested number of data to extract if there are
     * not enough "defined" entries to satisfy "count"
     *
     * @throws if index is less than 1 or greater than page size
     */
    extract : function(count) {

        const me      = this,
              size    = me.getSize(),
              isStart = me.getPosition() === me.statics().POSITION_START;

        count = parseInt(count, 10);

        if (count < 1 || count > size) {
            Ext.raise({
                msg   : "'count' is out of bounds",
                count : count
            });
        }

        let replace = (new Array(count)).fill(undefined, 0, count);

        if (isStart) {
            recs = me.data.splice(size - count, count);
            Array.prototype.unshift.apply(me.data, replace);

            return recs;
        }

        recs = me.data.splice(0, count);
        me.data = me.data.concat(replace);

        return recs;
    },


    /**
     * Returns the entry in this feed at the given index. Counting starts at 0
     * for the first entry.
     * Note:
     * =====
     * the index is the absolute value of an entry in the Feed, so calling APIs
     * should consider the #position this Feed was created with.
     *
     * @param {Number} index
     *
     * @return undefined if the entry was not set, otherwise the Ext.data.Model
     *
     * @throws if index is less than 0 or greater than #size - 1
     */
    getAt : function(index) {

        const me   = this,
              size = me.getSize();

        index = parseInt(index, 10);

        if (index < 0 || index > size -1) {
            Ext.raise({
                msg   : "'index' is out of bounds",
                index : index
            });
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
     * Counts the empty positions in this Feed depending on its position.
     * (POSITION_START will start counting at the beginning of the data,
     * POSITION_END will start at the end of the data).
     *
     * @param {Number} direction
     *
     */
    getFreeSpace : function() {

        const me      = this,
              statics = me.statics(),
              isStart = me.getPosition() === statics.POSITION_START,
              size    = me.getSize();

        let free = 0, i;

        switch (isStart) {

            case true:
                for (i = 0; i < size; i++) {
                    if (me.data[i] !== undefined) {
                        break;;
                    }
                    free++;
                }
                break;

            default:
                for (i = size - 1; i >= 0; i--) {
                    if (me.data[i] !== undefined) {
                        break;
                    }
                    free++;
                }
                break;

        }

        return free;
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


        return size;
    },


    /**
     * Applies the position to this instance
     *
     * @param {Mixed} position
     *
     * @throws if position was already set, or if position does not equal to
     * #POSITION_START or #POSITION_END
     */
    applyPosition : function(position) {

        const me      = this,
            statics = me.statics();

        if (me.getPosition() !== undefined) {
            Ext.raise({
                msg      : '\'position\' is already set',
                position : me.getPosition()
            });
        }


        if ([statics.POSITION_START,
            statics.POSITION_END].indexOf(position) === -1) {
            Ext.raise({
                msg      : '\'position\' must be POSITION_START or POSITION_END',
                position : position
            });
        }


        return position;
    }


});