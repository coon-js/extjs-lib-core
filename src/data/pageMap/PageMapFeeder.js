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
        'conjoon.cn_core.data.pageMap.Feed',
        'conjoon.cn_core.data.pageMap.PageRange',
        'conjoon.cn_core.data.pageMap.PageMapUtil',
        'conjoon.cn_core.Util',
        'conjoon.cn_core.data.pageMap.operation.Operation',
        'conjoon.cn_core.data.pageMap.operation.RemoveRequest',
        'conjoon.cn_core.data.pageMap.operation.ResultReason'
    ],

    mixins  : [
        'conjoon.cn_core.data.pageMap.ArgumentFilter'
    ],

    statics : {
        /**
         * @type {Number} ACTION_ADD
         */
        ACTION_ADD : 1,

        /**
         * @type {Number} ACTION_REMOVE
         */
        ACTION_REMOVE : -1
    },

    config : {

        /**
         * @cfg {Ext.data.PageMap} pageMap
         * The PageMap this feeder operates with.
         */
        pageMap : null
    },

    /**
     * @type {Object} feed
     * @private
     */
    feed : null,


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

        me.feed = {};
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
     * feed, this positions will be used if they are safe to use.
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
     * If the record was not found in the PageMap's map, current feeds will be
     * searched for it by comparing id-values (feeds do not hold references to
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
            for (var i in me.feed) {
                if (page !== undefined) {
                    break;
                }
                for (var a = 0, lena = me.feed[i].length; a < lena; a++) {
                    if (me.feed[i][a].getId() === record.getId()) {
                        page      = i;
                        pageIndex = a;
                        break;
                    }
                }
            }

            // found. splice, recycle if necessary and return
            if (page !== undefined) {
                me.feed[page].splice(pageIndex, 1);

                // recycles the feed if necessary
                if (me.feed[page].length == 0) {
                    me.recyclefeed(page);
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
        var ranges = PageMapUtil.getAvailablePageRanges(pageMap),
            right;

        for (var i = 0, len = ranges.length; right === undefined, i < len; i++) {
            if (ranges[i].toArray().indexOf(page) !== -1) {
                right = i + 1;
            }
        }


        if (right) {
            for (var i = right, len = ranges.length; i < len; i++) {
                var newPosForFeed = ranges[i].toArray()[0] - 1;
                me.createFeedAt(newPosForFeed, 1);
                var rec = map[ranges[i].toArray()[0]].value.splice(0, 1)[0].clone();
                me.fillFeed(newPosForFeed, [rec], 1)
                me.feedPage(ranges[i].toArray()[0], 1);
                if (me.feed[newPosForFeed].indexOf(undefined) === -1) {
                    me.getPageMap().addPage(newPosForFeed, me.feed[newPosForFeed]);
                    delete me.feed[newPosForFeed];
                }

            }
        }

        op.setResult(Ext.create('conjoon.cn_core.data.pageMap.operation.Result', {
            success : true,
            reason  : ResultReason.OK
        }));

        return op;

    },


    /**
     * Feeds the page as the specified position with either data from a feed
     * after "page" or before "page". feeds will be created if necessary and
     * possible. The amount of items taken from the feed equal to the PageMaps
     * pageSize - the page target's length.
     * This implementation will take care of creating feeds until the demands
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

            index = me.createFeed(page, direction);

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

            feed = me.feed[index];

            if (direction === 1) {
                // feed from the bottom of the last feed
                items = feed.splice(
                    0,
                    Math.min(targetLength, feed.length)
                );

                if (feed.length == 0) {
                    me.recycleFeed(index);
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
     * Will create a new feed for the specified page and the specified direction
     * (-1 for feeding from data behind the specified page, 1 for feeding from a
     * page after the specified page).
     *
     * @param {Number} page
     * @param {Number} direction
     *
     * @return {Number} the target index of the feed created, or -1 if no
     * feed can be used
     *
     * @throws if page is not a number or less than 1, or if direction is not -1
     * or 1
     */
    createFeed : function(page, direction) {

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

        index = me.findFeedIndexForPage(page, direction);

        if (index === -1) {
            return -1;
        }

        if (!me.feed[index]) {
            me.swapMapToFeed(index);
        }

        return index;

    },


    /**
     * Moves the feed for the specified page to the recycle bin, e.g. the feed
     * is empty and cannot satisfy pages which needs to be fed, but is marked so any
     * prefetch observer can veto its loading.
     *
     * @param {Number} page
     *
     * @throws if page is not a number or less than 1, or if the feed for the
     * specified page does not exist, or if the feeder still has entries or if the
     * feeder is already marked for recycling
     */
    recycleFeed : function(page) {

        var me = this;

        page = parseInt(page, 10);

        if (!Ext.isNumber(page) || (page < 1)) {
            Ext.raise({
                msg  : '\'page\' must be a number greater than 0',
                page : page
            });
        }

        if (!me.feed[page]) {
            Ext.raise({
                msg  : 'the feed for the specified \'page\' does not exist',
                page : page
            });
        }

        if (me.feed[page].length) {
            Ext.raise({
                msg  : 'the feed for the specified \'page\' is not empty',
                page : page
            });
        }

        if (me.hollowFeeds.indexOf(page) !== -1) {
            Ext.raise({
                msg  : 'the feed for the specified \'page\' is hollow',
                page : page
            });
        }

        me.hollowFeeds.push(page);
        delete me.feed[page];
    },


    /**
     * Clears this feeder. Should be called whenever the PageMap is re-initialized,
     * for example during a complete reload of the BufferedStore which is using
     * the PageMap.
     *
     */
    clear : function() {

        var me = this;

        me.feed        = {};
        me.hollowFeeds = [];
    },

    /**
     * Swaps the specified page in the page map. The feed for the page must not
     * exist already since it gets created here.
     * This method will remove the page out of the pageMap.
     *
     * @param {Number} page
     *
     * @private
     *
     * @throws if page is not a number or less than 1, or if the page was already
     * marked as recycled, or if the page is not existing, or if the feed for
     * the page already exists.
     */
    swapMapToFeed : function(page) {

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

        if (me.hollowFeeds.indexOf(page) !== -1) {
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

        if (me.feed[page]) {
            Ext.raise({
                msg  : 'the feed for the specified \'page\' already exists',
                page : page
            })
        }

        feed = [];
        data = pageMap.map[page].value;

        for (var i = 0, len = pageMap.getPageSize(); i < len; i++) {
            feed.push(data[i].clone());
        }

        me.feed[page] = feed;

        // this will clear the indexMap for the registered records and
        // their internalIds

        pageMap.removeAtKey(page);
    },


    /**
     * Looks up all affected indexes for the action and the specified page and
     * returns an array of ranges which hold the possible indexes in ascending
     * order. The indexes are candidates for feeds and it is possible that they
     * are still pages and not feeds yet. It is the responsibility of the calling
     * API to operate with the returned values accordingly.
     *
     * @example
     *      PageMap: [3, 4] [6, 7, 8]
     *      feeder.findFeedIndexesForActionAtPage(3, ACTION_ADD)
     *      // returns [[5], [6, 9]]
     *
     * Note:
     * =====
     * This method should always be called together with #invalidateFeeds which
     * automatically removes Feeds and pages which cannot be used for the current operation
     * at the specified page, since during the last Feed creation pages might have
     * been added which violate Feed-creation rules
     * [3, 4] (5) [7, 8] -> loads page 6 ->  [3, 4] (5) [6, 7, 8] Feed 5 must be
     * invalidated.
     *
     * @param {Number} page
     * @param {Mixed} action any of #ACTION_ADD / #ACTION_REMOVE
     *
     * @return {Array} an array with all indexes found that are affected by the
     * requested action, or null if no indexes could be found
     *
     * @private
     *
     * @throws if any of the specified arguments do not satisfy the parameter
     * conditions, or if conjoon.data.pageMap.PageMapUtil#getPageRangeForPage
     * throws an exception, or if page points to a Feed
     */
    findFeedIndexesForActionAtPage : function(page, action) {

        const me          = this,
              ADD         = me.statics().ACTION_ADD,
              REMOVE      = me.statics().ACTION_REMOVE,
              pageMap     = me.getPageMap(),
              PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil;

        page = me.filterPageValue(page);

        if ([ADD, REMOVE].indexOf(action) === -1) {
            Ext.raise({
                msg    : '\'action\' must be any of ACTION_ADD or ACTION_REMOVE',
                action : action
            });
        }

        if (me.getFeedAt(page)) {
            Ext.raise({
                msg  : "requested indexes for 'page' cannot be determined since " +
                       "the page is represented by a Feed",
                page : page
            });
        }

        let currentPageRange = PageMapUtil.getPageRangeForPage(page, pageMap),
            rightRange       = PageMapUtil.getRightSidePageRangeForPage(page, pageMap),
            indexes          = [],
            first, last, range,
            hasPreviousFeed = function(page) {
                return me.getFeedAt(page - 1) &&
                       me.getFeedAt(page - 1).getNext() === page;
            },
            hasNextFeed = function(page) {
                return me.getFeedAt(page + 1) &&
                    me.getFeedAt(page + 1).getPrevious() === page;
            };


        switch (action) {

            case ADD:

                if (!currentPageRange) {
                    return null;
                }
                indexes.push([currentPageRange.getLast() + 1]);

                if (rightRange) {

                    for (var i = 0, len = rightRange.length; i < len; i++) {
                        range = rightRange[i];
                        first = range.getFirst();
                        last  = range.getLast();
                        // single pages cannot be used
                        if (first !== last) {
                            indexes.push([
                                // can we feed from an existing Feed before first?
                                // if so, use it
                                hasPreviousFeed(first) ? first - 1 : first,
                                last + 1
                            ]);
                        } else if (hasPreviousFeed(first)) {
                            // we must consider feeds that embed the current page
                            // (11) [12] (13)
                            indexes.push([first - 1, last + 1]);
                        }
                    }
                }

                break;

            case REMOVE:

                if (!currentPageRange) {
                    return null;
                }

                // for the current page range, check if a feed exists at the end
                // of the range which we can use for feeding
                if (currentPageRange.getLast() === page) {
                    if (hasNextFeed(page)) {
                        indexes.push([page + 1]);
                    } else {
                        return null;
                    }

                } else {
                    indexes.push([currentPageRange.getLast()]);
                }

                if (rightRange) {
                    for (var i = 0, len = rightRange.length; i < len; i++) {
                        range = rightRange[i];
                        first = range.getFirst();
                        last  = range.getLast();
                        // single pages cannot be used
                        if (first !== last) {
                            indexes.push([
                                first - 1,
                                // for the upper index, we're looking for an existing
                                // Feed that actually serves the last page in this range
                                // we'll use this!
                                hasNextFeed(last) ? last + 1 : last
                            ]);
                        }
                    }
                }

                break;

        }


        return indexes.length ? indexes : null;


        return;

       /* var me      = this,
            pageMap = me.getPageMap(),
            map     = pageMap.map,
            feed  = me.feed,
            start, end, direction,
            range, cmp, feedIndex = -1;

        direction = me.filterDirectionValue(direction);
        page      = me.filterPageValue(page);

        range = conjoon.cn_core.data.pageMap.PageMapUtil.getPageRangeForPage(page, pageMap);

        if (range === null) {
            // no pageRange found
            return -1;
        }

        start = range.getFirst();
        end   = range.getLast();

        // let's walk up and find a possible feed index
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
                if (me.canUseFeedAt(i)) {
                    feedIndex =  i;
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
                if (me.canUseFeedAt(i)) {
                    feedIndex =  i;
                    break;
                }
            }
        }


        if (feedIndex === page) {
            return -1;
        }

        return feedIndex;*/
    },


    /**
     * Returns true if the feed can be used or if can be created safely, i.e.
     * if it is not part of the pending collector already. It will also return
     * true, if the feed is already existing (NOT marked for recycling). It
     * will return false if the pageMap.map for the page is not existing, after
     * the previous tests did not satisfy their conditions..
     * This method also considers the direction for either feeding from the top
     * or the bottom. A feed can be used for right-hand data if at least the
     * data-index for pageSize - 1 is set, and for left-hand data if at least the
     * data index 0 is set.
     * Depending on the direction, existing neighbour feeds will be considered
     * and the method will return false if a direct left-hand feed exists and
     * the direction is specified as 1, or a direct right-hand feed exists and
     * the direction is marked as -1.
     *
     * @param {Number} page
     * @param {Number} direction
     *
     * @return {Boolean}
     *
     * @private
     *
     * @throws if page is not a number or less than 1, or if a feed was found
     * for which the PageMap still exists
     */
    canUseFeedAt : function(page, direction) {

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

        if (me.feed[page]) {
            if (pageMap.map[page]) {
                Ext.raise({
                    msg   : 'a feed for \'page\' exists, but the page exists ' +
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
     * Adds records to the feed by adding data to the end or beginning of it.
     *
     * @param {Number} page The actual position of the feed
     * @param {Ext.data.Model|Array} records
     * @param {Number} direction
     *
     * @return {Array} an empty array if all records could be added to the feed,
     * or an array with the remaining records which did not fit in there anymore.
     * If records are returned, API calls should check whether the feed has become
     * a candidate for a new page. see #isPageCandidate.
     *
     * @throws if the feed does not exist, or any exception thrown by
     * conjoon.cn_core.data.pageMap.Feed#fill
     *
     * @see conjoon.cn_core.data.pageMap.Feed#fill
     */
    fillFeed : function(page, records) {

        const me = this;

        records = [].concat(records);

        page = me.filterPageValue(page);

        if (!me.feed[page]) {
            Ext.raise({
                msg  :  'the feed for the requested \'page\' does not exist',
                page : page
            });
        }

        return me.feed[page].fill(records);
    },


    /**
     * Creates an empty feed representing the specified page if it does not exist,
     * and returns it. If the feed already exists, the existing one will be
     * returned.
     * The Feed's previous and next values are computed automatically based on
     * the available neighbour pages.
     *
     * Example:
     *  (1) PageMap : [3, 4, 5], [7, 8, 9]
     *      remove(5) -> [3, 4], [7, 8, 9]
     *      createFeedAt(5) -> previous = 4, next : undefined
     *
     *  (2) PageMap : [3, 4, 5], [7, 8, 9]
     *      remove(3) -> [4, 5], [7, 8, 9]
     *      createFeedAt(4) -> previous = undefined, next : 5
     *
     *  (3) PageMap : [3, 4, 5], [7, 8, 9]
     *      createFeedAt(6) -> exception
     *
     *  (3) PageMap : [3, 4, 5], [7, 8, 9]
     *      createFeedAt(4) -> exception
     *
     * @param {Number} page
     *
     * @return {Array}
     *
     * @throws
     * - if the page still exists in the map
     * - if no neighbour page could be found
     * - if the feed would have two neighbour pages
     * - if an existing feed's previous or next value does not equal to the
     * newly computed values
     */
    createFeedAt : function(page) {

        const me       = this,
              pageMap  = me.getPageMap(),
              pageSize = pageMap.getPageSize();

        let feed, position;

        page = me.filterPageValue(page);

        if (pageMap.peekPage(page)) {
            Ext.raise({
                msg  : "Unexpected page at " + page,
                page : pageMap.peekPage(page)
            });
        }

        if (pageMap.peekPage(page - 1) && pageMap.peekPage(page + 1)) {
            Ext.raise({
                msg    : "Feed for the requested \'page\' must not have two neighbour pages",
                before : pageMap.peekPage(page - 1),
                after  : pageMap.peekPage(page + 1)
            });
        }

        if (!pageMap.peekPage(page - 1) && !pageMap.peekPage(page + 1)) {
            Ext.raise({
                msg  : "Feed for the requested \'page\' must have at least one neighbour page",
                page : pageMap.peekPage(page)
            });
        }

        switch (true) {

            case !!pageMap.peekPage(page - 1):
                position = ['previous', page - 1];
            break;

            case !!pageMap.peekPage(page + 1):
                position = ['next', page + 1];
                break;
        }

        feed = me.getFeedAt(page);

        if (feed) {
            if ((position[0] === 'previous' && feed.getPrevious() !== position[1]) ||
                (position[0] === 'next' && feed.getNext() !== position[1])) {
                Ext.raise({
                    msg      : "The computed previous/next values for the existing " +
                               "feed do not match is current values",
                    computed : position,
                    previous : feed.getPrevious(),
                    next     : feed.getNext()
                });
            }
        }

        if (!feed) {
            let cfg = {
                size : pageSize
            };
            if (position[0] === 'next') {
                cfg.next = position[1];
            } else {
                cfg.previous = position[1];
            }
            Ext.apply(cfg, {})
            feed = Ext.create('conjoon.cn_core.data.pageMap.Feed', cfg);

            me.feed[page] = feed;
        }

        return feed;
    },


    /**
     * Returns true if the feed at the specified index is a candidate for a page,
     * i.e. all data indices are filled with data.
     *
     * @param {Number} page
     *
     * @return {Boolean} true if the feed at the specified index exists and
     * could be reused as a page, otherwise false.
     *
     * @throws any exception from #filterPageValue
     */
    isPageCandidate : function(page) {

        const me = this;
        let feed;

        page = me.filterPageValue(page);
        feed = me.getFeedAt(page);

        if (feed && !feed.hasUndefined()) {
            return true;
        }

        return false;
    },


    /**
     * Returns the feed for the specified page. Returns null if no feed was
     * found.
     *
     * @param {Number} page
     *
     * @return {conjoon.cn_core.data.pageMap.Feed}
     *
     * @throws any exception thrown by #filterPageValue
     */
    getFeedAt : function(page) {

        const me = this;

        page = me.filterPageValue(page);

        return me.feed[page] ? me.feed[page] : null;

    }


});