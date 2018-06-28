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
 * A PageMapFeeder is responsible for shifting records in between PageRanges
 * to make sure a plugged view can show changes in the underlying BufferedStore
 * without the need of immediately reloading it.
 * It is important that the events of the BufferedStore, like the beforeprefetch
 * event, are considered properly, since the BufferedStore will periodically
 * request new page ranges from the PageMap.
 *
 *
 */
Ext.define('conjoon.cn_core.data.pageMap.PageMapFeeder', {

    requires : [
        'conjoon.cn_core.data.pageMap.PageRange',
        'conjoon.cn_core.data.pageMap.PageMapUtil',
        'conjoon.cn_core.Util',
        'conjoon.cn_core.data.pageMap.operation.Operation',
        'conjoon.cn_core.data.pageMap.operation.RemoveRequest',
        'conjoon.cn_core.data.pageMap.operation.ResultReason'
    ],

    config : {

        /**
         * @cfg {Ext.data.PageMap} pageMap
         * The PageMap this feeder operates with.
         */
        pageMap : null
    },

    /**
     * @type {Object} feeder
     * @private
     */
    feeder : null,


    /**
     * @type {Array} recycledFeeds
     * @private
     */
    recycledFeeds : null,


    /**
     * Creates a new instance.
     *
     * @param {Object} cfg
     * @param {Ext.data.PageMap} cfg.pageMap The PageMap this instance will
     * operate on.
     *
     * @throws if cfg.pageMap is not set
     */
    constructor : function(cfg) {

        var me = this;

        cfg = cfg || {};

        if (!cfg.hasOwnProperty('pageMap')) {
            Ext.raise({
                msg : '\'pageMap\' is required for this class',
                cfg : cfg
            });
        }

        me.initConfig(cfg);

        me.feeder           = {};
        me.recycledFeeds = [];

    },


    /**
     * Applies the pageMap to this instance
     *
     * @param {Ext.data.PageMap} PageMap
     *
     * @throws if pageMap was already set, or if pageMap is not an instance of
     * {Ext.data.PageMap}
     */
    applyPageMap : function(pageMap) {

        var me = this;

        if (me.getPageMap()) {
            Ext.raise({
                msg     : '\'pageMap\' is already set',
                pageMap : me.getPageMap()
            });
        }

        if (!(pageMap instanceof Ext.data.PageMap)) {
            Ext.raise({
                msg     : '\'pageMap\' must be an instance of Ext.data.PageMap',
                pageMap : pageMap
            });
        }


        return pageMap;
    },


    /**
     * Moves the record from the specified from-position to the specified to
     * position. The result of this operation is encapsulated in the returning
     * conjoon.cn_core.data.pageMap.Operation-object.
     * Feeds will be considered if either from or to do not exist in the actual
     * PageMap's map: if from and to can be found in current pages swapped to the
     * feeder, this positions will be used if they are safe to use.
     *
     * @param {conjoon.cn_core.data.pageMap.RecordPosition} from
     * @param {conjoon.cn_core.data.pageMap.RecordPosition} to
     *
     * @return {conjoon.cn_core.data.pageMap.Operation}
     */
    moveRecord : function(from, to) {


    },


    /**
     * Note:
     * Calling APIs should consider the totalCount change of a BufferedStore
     * which might be using the PageMap-
     *
     * Adds the specified record to the specified to-position, and shifts data
     * either beyond or after the to-position.
     * This implementation considers feeds and will shift data to it if
     * applicable.
     * The position will only be used for existing maps in PageMap, not for
     * feeds.
     * Shifted records will create pages if the shifting does not end in an
     * already existing feed.
     * If the shifting ends in an existing feed and the the feed will be filled
     * up to pageSize, a page will be created for it.
     * If shifting ends up in a recycled feed, the feed will be re-created again.
     *
     * @param {Ext.data.Model} record
     * @param {conjoon.cn_core.data.pageMap.RecordPosition} to
     * @param {Number} direction
     *
     * @return {conjoon.cn_core.data.pageMap.Operation} The operation with the
     * result, which hints to the state of this PageMap.
     */
    addRecord : function(record, to, direction) {


    },


    /**
     * Note:
     * Calling APIs should consider the totalCount change of a BufferedStore
     * which might be using the PageMap-
     *
     * Removes the specified record.
     * The empty space in the PageMap's map will be refeed by this feeder,
     * by a call to #feedPage.
     * The result of this operation will be available in the returned
     * {conjoon.cn_core.data.pageMap.Operation}-object.
     * If the record was not found in the PageMap's map, current feeders will be
     * searched for it by comparing id-values (feeders do not hold references to
     * the original records anymore9.
     *
     * @param {Ext.data.Model} record The record to remove
     * @param {Number} direction -1 for feed-data from before this record's
     * position, 1 for feed data from after this record's position.
     *
     * @return {conjoon.cn_core.data.pageMap.Operation} The operation with the
     * result, which hints to the state of this PageMap.
     *
     * @throws if record is not an instance of {Ext.data.Model}, or any exception
     * thrown by #feedPage
     */
    removeRecord : function(record, direction) {

        var me          = this,
            PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
            pageMap, index, op, position, page, pageIndex, map,
            ResultReason, feed;


        if (!(record instanceof Ext.data.Model)) {
            Ext.raise({
                msg    : '\'record\' must be an instance of Ext.data.Model',
                record : record
            });
        }

        ResultReason = conjoon.cn_core.data.pageMap.operation.ResultReason;
        pageMap      = me.getPageMap();
        index        = pageMap.indexOf(record);

        op = Ext.create('conjoon.cn_core.data.pageMap.operation.Operation', {
            request : Ext.create('conjoon.cn_core.data.pageMap.operation.RemoveRequest')
        });

        // look in feeds
        if (index === -1) {
            for (var i in me.feeder) {
                if (page !== undefined) {
                    break;
                }
                for (var a = 0, lena = me.feeder[i].length; a < lena; a++) {
                    if (me.feeder[i][a].getId() === record.getId()) {
                        page      = i;
                        pageIndex = a;
                        break;
                    }
                }
            }

            // found. splice, recycle if necessary and return
            if (page !== undefined) {
                me.feeder[page].splice(pageIndex, 1);

                // recycles the feeder if necessary
                if (me.feeder[page].length == 0) {
                    me.recycleFeeder(page);
                }

                op.setResult(Ext.create('conjoon.cn_core.data.pageMap.operation.Result', {
                    success : true,
                    reason  : ResultReason.OK
                }));

                return op;
            }

        }

        // neither found in feeds nor regular map, return
        if (index === -1 && page === undefined) {
            op.setResult(Ext.create('conjoon.cn_core.data.pageMap.operation.Result', {
                success : false,
                reason  : ResultReason.RECORD_NOT_FOUND
            }));

            return op;
        }


        position  = PageMapUtil.storeIndexToPosition(index, pageMap);
        map       = pageMap.map;
        page      = position.getPage();
        pageIndex = position.getIndex();

        map[page].value.splice(pageIndex, 1);

        me.feedPage(page, direction);

        op.setResult(Ext.create('conjoon.cn_core.data.pageMap.operation.Result', {
            success : true,
            reason  : ResultReason.OK
        }));

        return op;

    },


    /**
     * Feeds the page as the specified position with either data from a feed
     * after "page" or before "page". Feeders will be created if necessary and
     * possible. The amount of items taken from the feeder equal to the PageMaps
     * pageSize - the page target's length.
     * This implementation will take care of creating feeders until the demands
     * of the target page can be satisfied, which means that this method will
     * create feeds or move existing ones to the recycle bin in necessary.
     *
     * @param {Number} page
     * @param {Number} direction
     * @param {String} 
     *

     * @throws if page is not a number or less than 1, or if direction is not -1
     * or 1, or if the target page does not exist,
     */
    feedPage : function(page, direction) {

        var me             = this,
            pageMap        = me.getPageMap(),
            map            = pageMap.map,
            PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
            PageRange      = conjoon.cn_core.data.pageMap.PageRange,
            maintainRanges = [],
            index, targetLength, items, feed, range, start, end;

        if (!Ext.isNumber(page) || (page < 1)) {
            Ext.raise({
                msg  : '\'page\' must be a number greater than 0',
                page : page
            });
        }

        if (!Ext.isNumber(direction) || (direction !== 1 && direction !== -1)) {
            Ext.raise({
                msg       : '\'direction\' must be -1 or 1',
                direction : direction
            });
        }

        if (!map[page]) {
            Ext.raise({
                msg  : '\'page\' does not exist in the PageMap',
                page : page
            });
        }

        targetLength = pageMap.getPageSize() - map[page].value.length;

        while (targetLength > 0) {

            index = me.createFeeder(page, direction);

            if (index === -1) {
                Ext.raise({
                    msg   : 'could not satisfy feeding demands for page',
                    page  : page,
                    index : index
                });
            }

            range = PageMapUtil.getPageRangeForPage(page, pageMap);
            range = range.toArray();
            if (direction === 1) {
                range = range.slice(range.indexOf(page), range.length)
            } else {
                range = range.slice(0, range.indexOf(page) + 1);
            }

            maintainRanges = maintainRanges.concat(range);
            maintainRanges.indexOf(index) !== -1 &&
                maintainRanges.splice(maintainRanges.indexOf(index), 1);

            start = range[0];
            end   = range[range.length - 1];

            feed = me.feeder[index];

            if (direction === 1) {
                // feed from the bottom of the last feed
                items = feed.splice(
                    0,
                    Math.min(targetLength, feed.length)
                );

                if (feed.length == 0) {
                    me.recycleFeeder(index);
                }

                for (var i = start; i < end; i++) {
                    map[i].value = map[i].value.concat(map[i + 1].value.splice(
                        0, items.length));
                }

                map[end].value = map[end].value.concat(items);
            } else if (direction === -1) {

                // feed from the top of the first feed
                items = feed.splice(
                    Math.max(0, feed.length - targetLength),
                    Math.min(targetLength, feed.length)
                );

                if (feed.length == 0) {
                    me.recycleFeeder(index);
                }

                for (var i = start; i < end; i++) {

                    Array.prototype.unshift.apply(
                        map[i + 1].value,
                        map[i].value.splice(
                            map[i].value - items.length, items.length
                        )
                    );
                }

                Array.prototype.unshift.apply(map[start].value, items);
            }

            targetLength -= items.length;

        }

        maintainRanges = conjoon.cn_core.Util.groupIndices(maintainRanges);

        for (var i = 0, len = maintainRanges.length; i < len; i++) {

            PageMapUtil.maintainIndexMap(
                PageRange.createFor(
                    maintainRanges[i][0],
                    maintainRanges[i][maintainRanges[i].length - 1]
                ),
                pageMap
            )
        }
    },


    /**
     * Will create a new feeder for the specified page and the specified direction
     * (-1 for feeding from data behind the specified page, 1 for feeding from a
     * page after the specified page).
     *
     * @param {Number} page
     * @param {Number} direction
     *
     * @return {Number} the target index of the feeder created, or -1 if no
     * feeder can be used
     *
     * @throws if page is not a number or less than 1, or if direction is not -1
     * or 1
     */
    createFeeder : function(page, direction) {

        var me = this, index;

        direction = parseInt(direction, 10);
        page      = parseInt(page, 10);

        if (!Ext.isNumber(page) || (page < 1)) {
            Ext.raise({
                msg  : '\'page\' must be a number greater than 0',
                page : page
            });
        }

        if (!Ext.isNumber(direction) || (direction !== 1 && direction !== -1)) {
            Ext.raise({
                msg       : '\'direction\' must be -1 or 1',
                direction : direction
            });
        }

        index = me.findFeederIndexForPage(page, direction);

        if (index === -1) {
            return -1;
        }

        if (!me.feeder[index]) {
            me.swapMapToFeeder(index);
        }

        return index;

    },


    /**
     * Moves the feeder for the specified page to the recycle bin, e.g. the feeder
     * is empty and cannot satisfy pages which needs to be fed, but is marked so any
     * prefetch observer can veto its loading.
     *
     * @param {Number} page
     *
     * @throws if page is not a number or less than 1, or if the feeder for the
     * specified page does not exist, or if the feeder still has entries or if the
     * feeder is already marked for recycling
     */
    recycleFeeder : function(page) {

        var me = this;

        page = parseInt(page, 10);

        if (!Ext.isNumber(page) || (page < 1)) {
            Ext.raise({
                msg  : '\'page\' must be a number greater than 0',
                page : page
            });
        }

        if (!me.feeder[page]) {
            Ext.raise({
                msg  : 'the feeder for the specified \'page\' does not exist',
                page : page
            });
        }

        if (me.feeder[page].length) {
            Ext.raise({
                msg  : 'the feeder for the specified \'page\' is not empty',
                page : page
            });
        }

        if (me.recycledFeeds.indexOf(page) !== -1) {
            Ext.raise({
                msg  : 'the feeder for the specified \'page\' is already marked for recycling',
                page : page
            });
        }

        me.recycledFeeds.push(page);
        delete me.feeder[page];
    },


    /**
     * Clears this feeder. Should be called whenever the PageMap is re-initialized,
     * for example during a complete reload of the BufferedStore which is using
     * the PageMap.
     *
     */
    clear : function() {

        var me = this;

        me.feeder        = {};
        me.recycledFeeds = [];
    },

    /**
     * Swaps the specified page in the page map. The feeder for the page must not
     * exist already since it gets created here.
     * This method will remove the page out of the pageMap.
     *
     * @param {Number} page
     *
     * @private
     *
     * @throws if page is not a number or less than 1, or if the page was already
     * marked as recycled, or if the page is not existing, or if the feeder for
     * the page already exists.
     */
    swapMapToFeeder : function(page) {

        var me      = this,
            pageMap = me.getPageMap(),
            map     = pageMap.map,
            feed, data;

        page = parseInt(page, 10);

        if (!Ext.isNumber(page) || (page < 1)) {
            Ext.raise({
                msg  : '\'page\' must be a number greater than 0',
                page : page
            });
        }

        if (me.recycledFeeds.indexOf(page) !== -1) {
            Ext.raise({
                msg  : '\'page\' is already marked for recycling, cannot use',
                page : page
            })
        }

        if (!map[page]) {
            Ext.raise({
                msg  : '\'page\' does not exist in page map',
                page : page
            })
        }

        if (me.feeder[page]) {
            Ext.raise({
                msg  : 'the feeder for the specified \'page\' already exists',
                page : page
            })
        }

        feed = [];
        data = pageMap.map[page].value;

        for (var i = 0, len = pageMap.getPageSize(); i < len; i++) {
            feed.push(data[i].clone());
        }

        me.feeder[page] = feed;

        // this will clear the indexMap for the registered records and
        // their internalIds

        pageMap.removeAtKey(page);
    },


    /**
     * Tries to look up the feeder index for the specified page.
     * It is possible that this method returns the index of a page which also
     * exist in a PageMap. In this case, an immediate swapping from the source
     * page to the feeder should be triggered by the API.
     * This method will determine the existing PageRange for the specified page.
     * "direction" can be used to specify where the feeder should be looked up,
     * e.g. -1 for the start of the page range, 1 for the end of the page range.
     * This method also considers that beyond the first or last page
     * (depending on direction) might exist a feeder which can be used. This
     * method is guaranteed to never return a feederIndex which equals to the
     * specified page, since this means that in the specified direction no
     * feeder exists which couls possibly be used.
     *
     * @param {Number} page
     * @param {Number} direction
     *
     * @return {Number} The index of the feeder to use, which might exist or
     * might not exist. It is safe to use the feeder at the index or to
     * create it if it does not already exist
     *
     * @private
     *
     * @throws if any of the specified arguments do not satisfy the parameter
     * conditions, or if conjoon.data.pageMap.PageMapUtil#getPageRangeForPage
     * throws an exception
     */
    findFeederIndexForPage : function(page, direction) {

        var me      = this,
            pageMap = me.getPageMap(),
            map     = pageMap.map,
            feeder  = me.feeder,
            start, end, direction,
            range, cmp, feederIndex = -1;

        direction = parseInt(direction, 10);
        page      = parseInt(page, 10);

        if (!Ext.isNumber(page) || (page < 1)) {
            Ext.raise({
                msg  : '\'page\' must be a number greater or equal to 1',
                page : page
            });
        }

        if (!Ext.isNumber(direction) || (direction !== 1 && direction !== -1)) {
            Ext.raise({
                msg       : '\'direction\' must be -1 or 1',
                direction : direction
            });
        }

        range = conjoon.cn_core.data.pageMap.PageMapUtil.getPageRangeForPage(page, pageMap);

        if (range === null) {
            // no pageRange found
            return -1;

        }

        start = range.getFirst();
        end   = range.getLast();

        // let's walk up and find a possible feeder index
        if (direction > 0) {
            cmp = end;
            while (map[cmp]) {
                end = cmp;
                cmp++;
            }
            // adjust start to the page range next to the requested page,
            // including the page itself. e.g.
            //    page : 5
            //    pageRange : [1, 2, 3, 4, 5, 6, 7, 8, 9]
            for (var i = end + 1; i >= start; i--) {
                if (me.canUseFeederAt(i)) {
                    feederIndex =  i;
                    break;
                }
            }
        } else {
            cmp = start;
            while (map[cmp]) {
                start = cmp;
                cmp--;
            }
            for (var i = Math.max(start - 1, 1); i <= end; i++) {
                if (me.canUseFeederAt(i)) {
                    feederIndex =  i;
                    break;
                }
            }
        }


        if (feederIndex === page) {
            return -1;
        }

        return feederIndex;
    },


    /**
     * Returns true if the feeder can be used or if can be created safely, i.e.
     * if it is not part of the pending collector already. It will also return
     * true, if the feeder is already existing (NOT marked for recycling). It
     * will return false if the pageMap.map for the page is not existing, after
     * the previous tests did not satisfy their conditions..
     *
     * @param {Number} page
     *
     * @return {Boolean}
     *
     * @private
     *
     * @throws if page is not a number or less than 1, or if a feeder was found
     * for which the PageMap still exists
     */
    canUseFeederAt : function(page) {

        var me      = this,
            page    = parseInt(page, 10),
            pageMap = me.getPageMap();

        if (!Ext.isNumber(page) || page < 1) {
            Ext.raise({
                msg   : '\'page\' must be a number greater than 0',
                page  : page
            });
        }

        if (me.isFeedMarkedForRecycling(page)) {
            return false;
        }

        if (me.feeder[page]) {
            if (pageMap.map[page]) {
                Ext.raise({
                    msg   : 'a feeder for \'page\' exists, but the page exists ' +
                            'also in the PageMap',
                    page  : page
                });
            }
            return true;
        }

        if (!pageMap.map[page]) {
            return false;
        }

        return true;
    },


    /**
     * Returns true if the specified page is marked for recycling. A page
     * marked for recycling must not yet be fetched again and must be vetoed
     * by the beforeprefetch event of the BufferedStore if applicable.
     * A feed marked for recycling is usually an emptied feed and should
     * be reloaded IF the representing page is requested in the view again.
     *
     * @param {Number} page
     *
     * @throws if the feed is marked for recycling and the page exists in the
     * pageMap
     */
    isFeedMarkedForRecycling : function(page) {

        var me      = this,
            pageMap = me.getPageMap();

        page = parseInt(page, 10);

        if (!Ext.isNumber(page) || page < 1) {
            Ext.raise({
                msg   : '\'page\' must be a number greater than 0',
                page  : page
            });
        }

        if (me.recycledFeeds.indexOf(page) === -1) {
            return false;
        }

       if (pageMap.map[page]) {
           Ext.raise({
               msg  : 'the feed for the specified \'page\' is marked for recycling, ' +
                      'but still exists in the PageMap',
               page : page
           })
       }

        return true;
    }





});