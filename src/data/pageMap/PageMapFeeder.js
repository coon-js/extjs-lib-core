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

        const me = this;

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

        // we expect the ranges to be used to compute from/to index, so we
        // must make sure they stay as expected
        // suspendSanitizer
        //remRec
        //addRec
        // resuleSanitizer

    },


    /**
     * Adds the specified record to the specified to-position, and shifts data
     * accordingly.
     * This implementation considers feeds and will shift data to it if
     * applicable.
     * The position may be a position in the map itself or in an existing Feed.
     *
     * @param {Ext.data.Model} record
     * @param {conjoon.cn_core.data.pageMap.RecordPosition} to
     *
     * @return {conjoon.cn_core.data.pageMap.Operation} The operation with the
     * result, which hints to the state of this PageMap.
     *
     * @throws if the requested page or the requested Feed does not exist
     */
    addRecord : function(record, to) {

        const me           = this,
            pageMap      = me.getPageMap(),
            map          = pageMap.map,
            ADD          = me.statics().ACTION_ADD,
            op           = Ext.create('conjoon.cn_core.data.pageMap.operation.Operation', {
                request : Ext.create('conjoon.cn_core.data.pageMap.operation.AddRequest')
            }),
            pageSize       = pageMap.getPageSize(),
            Util           = conjoon.cn_core.Util,
            PageRange      = conjoon.cn_core.data.pageMap.PageRange,
            PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
            ResultReason   = conjoon.cn_core.data.pageMap.operation.ResultReason,
            RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition,
            maintainRanges = [],
            createResult = function(cfg) {
                op.setResult(Ext.create(
                    'conjoon.cn_core.data.pageMap.operation.Result',
                    cfg
                ));
                return op;
            };

        let page, index;

        record = me.filterRecordValue(record);
        to     = me.filterRecordPositionValue(to, pageSize);

        page  = to.getPage();
        index = to.getIndex();

        if (!pageMap.peekPage(page) && !me.getFeedAt(page)) {
            Ext.raise({
                msg : "the requested 'page' does not exist in PageMap and does not exist in Feeds",
                page : page
            });
        }

        let feedIndexes = me.prepareForAction(page, ADD);

        let lower   = feedIndexes[0][0],
            records = [record];

        // fill up range before targetPage
        if (page < lower) {
            feedIndexes[0].unshift(page);
        }

        let insertIndex = index,
            internalId, previousPage;

        Ext.Array.each(feedIndexes, function(range) {

            let currentPage = range[0],
                end         = range.length === 1 ? range[0] : range[1];

            while (currentPage <= end) {

                let feed = me.getFeedAt(currentPage);

                // targetPage found
                if (currentPage === page) {
                    insertIndex = index;
                } else {
                    insertIndex = 0;
                }

                if (!feed) {
                    map[currentPage].value.splice(insertIndex, 0, records[0]);
                    maintainRanges.push(currentPage);
                    records = map[currentPage].value.splice(pageSize, 1);
                } else {
                    if (previousPage && me.getFeedAt(previousPage) &&
                        !me.canServeFromFeed(previousPage, currentPage)) {
                        records = [];
                    }
                    if (records.length) {
                        // spill from before
                        internalId = records[0].internalId;
                        records = feed.insertAt(records, insertIndex, !!feed.getNext());
                    } else {
                        // simply extract
                        records = feed.extract(1);
                    }
                    if (internalId) {
                        delete pageMap.indexMap[internalId];
                    }
                }

                previousPage = currentPage;
                currentPage++;
            }
        });


        Ext.Array.each(Util.groupIndices(maintainRanges),
            function(range) {

                PageMapUtil.maintainIndexMap(
                    PageRange.createFor(range[0], range[range.length - 1]), pageMap
                );
            }
        );

        me.sanitizeFeedsForPage(page);

        return createResult({
            success : true,
            reason  : ResultReason.OK
        });

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
     * Note:
     * Calling APIs should consider the totalCount change of a BufferedStore
     * which might be using the PageMap of this Feeder.
     *
     *
     *  // - RANGE       = [1, 2] [4, 5] [8, 9 , 10, 11]
     *  // - REM (1, 1)  =  [1] (2:1) (3:4) [4] (5:4) (7:8) [8, 9, 10] (11:10)
     *
     *  // computed feed indexes [[2], [3, 5], [7, 11]]
     *
     * @param {Ext.data.Model} record
     *
     * @return {conjoon.cn_core.data.pageMap.operation.Operation}
     *
     * @throws if the target page does not exist,
     *
     * @private
     */
    removeRecord : function(record) {

        const me           = this,
              pageMap      = me.getPageMap(),
              map          = pageMap.map,
              REMOVE       = me.statics().ACTION_REMOVE,
              op           = Ext.create('conjoon.cn_core.data.pageMap.operation.Operation', {
                  request : Ext.create('conjoon.cn_core.data.pageMap.operation.RemoveRequest')
              }),
              Util           = conjoon.cn_core.Util,
              PageRange      = conjoon.cn_core.data.pageMap.PageRange,
              PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
              ResultReason   = conjoon.cn_core.data.pageMap.operation.ResultReason,
              maintainRanges = [],
              createResult = function(cfg) {
                  op.setResult(Ext.create(
                      'conjoon.cn_core.data.pageMap.operation.Result',
                      cfg
                  ));
                  return op;
              },
              shiftToLeft = function(currentPage, currentRecords, recordsAreFromPage) {

                  let isPage = !!pageMap.peekPage(currentPage),
                      page   = isPage
                               ? pageMap.peekPage(currentPage).value
                               : me.getFeedAt(currentPage),
                      tmp;

                  if (isPage) {
                      maintainRanges.push(currentPage);
                      tmp = page.splice(0, 1);
                      if (currentRecords && currentRecords.length) {
                          page.push(currentRecords[0]);
                      }
                  } else {

                      if (!page.getNext()) {
                          tmp = page.extract(1);
                      } else {
                          // since we are going through the data from left to right,
                          // a feed that has a next page marks the beginning of a range
                          // and for us the end. We extract at the left side to make
                          // sure adding data from the right side shifts data properly
                          // down
                          if (page.getFreeSpace() === 0) {
                              tmp = page.extract(1, true);
                          }
                      }

                      // identify currentRecords. If swapped from a previous feed,
                      // check if we can reuse then
                      if (me.getFeedAt(recordsAreFromPage)) {
                          if (!me.canServeFromFeed(recordsAreFromPage, currentPage)) {
                              return tmp;
                          }  else {
                              // override fill direction as it would usually get filled
                              // according to its previous / next settings.
                              // since we are walking from right to left, we have to fill
                              // the feed from right
                              if (page.getPrevious() && currentRecords && currentRecords.length) {
                                  page.fill(currentRecords, true);
                                  return tmp;
                              }
                          }
                      }

                      if (currentRecords && currentRecords.length) {
                          page.fill(currentRecords);
                      }
                  }

                  return tmp;
              };


        let recordIndex = pageMap.indexOf(record),
            position    = recordIndex !== -1 ? PageMapUtil.storeIndexToPosition(recordIndex, pageMap) : null;
            position    = position
                          ? position
                            // look in feeds
                          : me.findInFeeds(record);

        if (!position) {
            return createResult({
                success : false,
                reason  : ResultReason.RECORD_NOT_FOUND
            });
        }

        let page        = position.getPage(),
            index       = position.getIndex(),
            feedIndexes = me.prepareForAction(page, REMOVE);

        if (feedIndexes === null) {
            return createResult({
                success : false,
                reason  : ResultReason.FEED_INDEXES_NOT_AVAILABLE
            });
        }

        // let's catch edge cases here in case sanitizing removed the
        // page the record was previously found at.
        // this can happen if the record was found on a single page
        // which gets removed during sanitizing
        // usually, sanitizing does not remove existing pages
        // it only removes pages- if any - that are to the right of the page
        // for which an action was requested. However, the pagemap *MIGHT*
        // have been updated from an HttpRequest (Prefetch BufferedStore),
        // or from any other hostile API
        if (me.getRecordAt(page, index) !== record) {

            Ext.raise({
                msg    : Ext.String.format(
                    "Unexpected error: record is not available at page {0} and index {1} anymore",
                    page, index),
                record : record
            });
        }

        let lower   = feedIndexes[0][0],
            records = null;

        // fill up range before targetPage
        if (page + 1 < lower) {
            feedIndexes[0].unshift(page + 1);
        }

        // start at last range and walk down in reverse ordder
        Ext.Array.each(feedIndexes.reverse(), function(range) {
            let start = range[0],
                end   = range[range.length - 1];

            do {
                records = shiftToLeft(end, records, end + 1 ? end + 1 : -1);
            } while (end-- > start);
        });

        // change Feed or page, depending where the record was found
        let feed = me.getFeedAt(page),
            remRec;
        if (!feed) {
            remRec = map[page].value.splice(index, 1)
            map[page].value.push(records[0]);
            delete pageMap.indexMap[remRec[0].internalId];
            maintainRanges.push(page);
        } else {
            remRec = feed.removeAt(index);
            feed.fill(records);
        }

        Ext.Array.each(Util.groupIndices(maintainRanges),
            function(range) {

                PageMapUtil.maintainIndexMap(
                    PageRange.createFor(range[0], range[range.length - 1]), pageMap
                );
            }
        );

        me.sanitizeFeedsForPage(page);

        return createResult({
            success : true,
            reason  : ResultReason.OK
        });
    },


    /**
     * Sanitizes this feeders' data for the specified page and related ranges.
     * It makes sure of the following:
     *
     * - feeds that have a neighbour page which would violate the rule not to
     * have one ( [10] (11:12) [12]) are removed
     * - feeds that don't have a neighbour page are removed,
     *
     * @param {Number} page
     *
     * @return {Boolean} true when sanitizing processed, otherwise false, e.g.
     * if no Feed and no page exist at the specified position
     *
     * @private
     */
    sanitizeFeedsForPage : function(page) {

        const me          = this,
              pageMap     = me.getPageMap(),
              PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
              feeds       = me.feed;

        page = me.filterPageValue(page);

        if (!me.getFeedAt(page) && !pageMap.peekPage(page)) {
            return false;
        }

        let currentPageRange = PageMapUtil.getPageRangeForPage(page, pageMap, true),
            rightRange       = PageMapUtil.getRightSidePageRangeForPage(page, pageMap, true),
            index, range, i, free = -1;

        // go through all feeds and swap pageCandidates to map
        // precedence is given already existing pages since they
        // have possibly been added during a prefetch from the BufferedStore,
        // if any
        for (i in me.feed) {

            i = me.filterPageValue(i);
            if (me.isPageCandidate(i)) {
                if (pageMap.peekPage(i)) {
                    me.removeFeedAt(i);
                } else {
                    me.swapFeedToMap(i);
                }
            } else  if (me.getFeedAt(i).isEmpty()) {
                me.removeFeedAt(i);
            }
        }

        range = currentPageRange !== null ? currentPageRange : [];
        range = range.concat(rightRange !== null ? rightRange : []);

        range.splice(0, range.indexOf(page) + 1);

        // remove all single pages
        for (i = 0, len = range.length; i < len; i++) {
            index = range[i];

            if (!pageMap.peekPage(index - 1) && !pageMap.peekPage(index + 1)
                && !me.hasPreviousFeed(index) && !me.hasNextFeed(index)) {
                pageMap.removeAtKey(index);
            }
        }

        return true;
    },


    /**
     * Removes the Feed at the specified position. Will silently return with false
     * if the feed could not be found at the specified position.
     *
     * @param {Number} page
     *
     * @return {Boolean} true if the Feed was found and removed, otherwise
     * false if no Feed was found at the specified page.
     *
     * @private
     */
    removeFeedAt : function(page) {

        const me = this;

        page = me.filterPageValue(page);

        if (!me.getFeedAt(page)) {
            return false;
        }

        delete me.feed[page];

        return true;
    },


    /**
     * Swaps the specified Feed back to the page map and removes the Feed afterwards.
     * The PageMap's map must not exist. This method does not check if the
     * Feed to swap is a page candidate.
     *
     * @param {Number} page
     *
     * @private
     *
     * @throws if the page is already existing, or if the Feed does not exist
     */
    swapFeedToMap : function(page) {

        const me       = this,
              pageMap  = me.getPageMap(),
              map      = pageMap.map;

        let feed, feedData, data;

        page = me.filterPageValue(page);

        if (pageMap.peekPage(page)) {
            Ext.raise({
                msg  : '\'page\' does still exist in page map',
                page : page
            });
        }

        feed = me.getFeedAt(page);

        if (!feed) {
            Ext.raise({
                msg  : 'the feed for the specified \'page\' does not exist',
                page : page
            });
        }

        feedData = me.getFeedAt(page).toArray();

        data = [];

        // mirror the data
        for (var i = 0, len = feedData.length; i < len; i++) {
            data.push(feedData[i]);
        }

        me.removeFeedAt(page);
        pageMap.addPage(page, data);


        return feed;
    },


    /**
     * Swaps the specified page in the page map. The feed for the page must not
     * exist already since it gets created here.
     * This method will remove the page out of the pageMap before the Feed gets
     * created.
     *
     * @param {Number} page
     * @param {Number} targetPage The next page this Feed should serve
     *
     * @return {conjoon.cn_core.data.pageMap.Feed}
     *
     * @private
     *
     * @throws if the page is not existing, or if the feed for
     * the page already exists, or if #createFeedAt throws
     */
    swapMapToFeed : function(page, targetPage) {

        const me       = this,
              pageMap  = me.getPageMap(),
              map      = pageMap.map;

        let feed, feedData, data;

        page       = me.filterPageValue(page);
        targetPage = me.filterPageValue(targetPage);


        if (!pageMap.peekPage(page)) {
            Ext.raise({
                msg  : '\'page\' does not exist in page map',
                page : page
            });
        }

        if (me.getFeedAt(page)) {
            Ext.raise({
                msg  : 'the feed for the specified \'page\' already exists and is not empty',
                page : page
            });
        }

        feedData = [];
        // no getter so we don't trigger LRU implementation of PageMap
        data = pageMap.peekPage(page).value;

        // mirror the data
        for (var i = 0, len = pageMap.getPageSize(); i < len; i++) {
            feedData.push(data[i]);
        }

        // removeAtKey should clear the indexMap for the registered records and
        // their internalIds
        pageMap.removeAtKey(page);

        feed = me.createFeedAt(page, targetPage);
        feed.fill(feedData);

        return feed;
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
     * This method should always be called together with #sanitizeFeedsForPage which
     * automatically removes Feeds and pages which cannot be used for the current operation
     * at the specified page, since during the last Feed creation pages might have
     * been added which violate Feed-creation rules
     * [3, 4] (5) [7, 8] -> loads page 6 ->  [3, 4] (5:4) [6, 7, 8] Feed 5 must be
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

        const me                    = this,
              ADD                   = me.statics().ACTION_ADD,
              REMOVE                = me.statics().ACTION_REMOVE,
              pageMap               = me.getPageMap(),
              isAdd                 = action === ADD,
              isAlreadyMarkedAsFeed = function(indexes, page) {

                  for (let i = 0, len = indexes.length; i < len; i++) {
                      if (indexes[i][0] === page || indexes[i][1] === page) {
                          return true;
                      }
                  }

                  return false;
              };

        page = me.filterPageValue(page);

        if ([ADD, REMOVE].indexOf(action) === -1) {
            Ext.raise({
                msg    : '\'action\' must be any of ACTION_ADD or ACTION_REMOVE',
                action : action
            });
        }

        // no chance for feeding
        if (!isAdd && (!pageMap.peekPage(page + 1) && !me.getFeedAt(page + 1))) {
            return null;
        }

        let found   = me.groupWithFeedsForPage(page),
            indexes = [], grp, end;

        if (found === null) {
            return null;
        }

        Ext.Array.each(found, function(range, foundIndex) {

            grp = [];
            end = range.length - 1;

            if (!isAdd && foundIndex === found.length - 1) {
                if (me.getFeedAt(range[end - 1])) {
                    return;
                }
            }

            if (range.indexOf(page) !== -1) {
                if (isAdd && range.indexOf(page) === end) {
                    if (!me.getFeedAt(page)) {
                        indexes.push([page + 1]);
                    } else if (range.length === 1) {
                        indexes.push([page]);
                    }
                }
            } else {
                grp.push(
                    isAdd || me.getFeedAt(range[0]) || isAlreadyMarkedAsFeed(indexes, range[0] - 1)
                        ? range[0]
                        : range[0] - 1
                );
            }

            if (range.length === 1) {
                return;
            }

            grp.push(
                isAdd && !me.getFeedAt(range[end])
                    ? range[end] + 1
                    : range[end]
            );

            if (grp.length) {
                indexes.push(grp);
            }

        });


        return indexes;
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
     * The Feed's previous or next value is specified in targetPage
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
     * - if no neighbour page could be found based on neighbourPage
     * - if an existing feed's previous or next value does not equal to the
     * newly computed values
     */
    createFeedAt : function(page, targetPage) {

        const me       = this,
              pageMap  = me.getPageMap(),
              pageSize = pageMap.getPageSize();

        let feed, position;

        page       = me.filterPageValue(page);
        targetPage = me.filterPageValue(targetPage);

        if (Math.abs(targetPage - page) !== 1) {
            Ext.raise({
                msg        : "\'targetPage\' value must be 1 less or more than \'page\'.",
                targetPage : targetPage,
                page       : page
            });

        }

        if (pageMap.peekPage(page)) {
            Ext.raise({
                msg  : "Unexpected page at " + page,
                page : pageMap.peekPage(page)
            });
        }

        if (!pageMap.peekPage(page - 1) && !pageMap.peekPage(page + 1)) {
            Ext.raise({
                msg  : "Feed for the requested \'page\' must have at least one neighbour page",
                page : pageMap.peekPage(page)
            });
        }

        switch (true) {

            case targetPage - page < 0:
                position = ['previous', targetPage];
                break;

            case targetPage - page > 0:
                position = ['next', targetPage];
                break;
        }

        feed = me.getFeedAt(page);

        if (feed) {
            if ((position[0] === 'previous' && feed.getPrevious() !== position[1]) ||
                (position[0] === 'next' && feed.getNext() !== position[1])) {
                Ext.raise({
                    msg      : Ext.String.format("The computed previous/next values for the existing " +
                               "feed do not match is current values. Requested: {0}: {1}; " +
                               "available: {2}, {3}",
                                position[0], position[1],
                                feed.getPrevious() ? 'previous' : 'next',
                                feed.getPrevious() ? feed.getPrevious() : feed.getNext()),
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

    },


    /**
     * Returns true if the page has a feed at its left side.
     *
     * @param {Number} page
     *
     * @returns {Boolean}
     */
    hasPreviousFeed : function(page) {

        const me = this;

        page = me.filterPageValue(page);

        return (me.getFeedAt(page - 1) !== null &&
               me.getFeedAt(page - 1).getNext() === page);
    },


    /**
     * Returns true if the page has a feed at its right side.
     *
     * @param {Number}  page
     *
     * @returns {Boolean}
     */
    hasNextFeed : function(page) {

        const me = this;

        page = me.filterPageValue(page);

        return (me.getFeedAt(page + 1) !== null &&
               me.getFeedAt(page + 1).getPrevious() === page);
    },


    /**
     * Returns page ranges depending on the feeds and pages available.
     * Feeds will be treated as regular pages and considered accordingly when
     * ranges get computed.
     * The specified page is included in the range.
     *
     *  @example
     *
     *          // [1, 2] (3:2) (4:5)[5](6:5) [8, 9] (10:9)
     *          // groupWithFeedsForPage(1)
     *          // -> [1, 2, 3] [4, 5, 6] [8, 9 10]
     *
     *          // [1, 2] (3:2) (4:5)[5](6:5) [8, 9] (10:9)
     *          // groupWithFeedsForPage(3)
     *          // -> [3] [4, 5, 6] [8, 9 10]
     *
     *          // [1, 2] (3:2) (4:5)[5](6:5) [8, 9] (10:9)
     *          // groupWithFeedsForPage(7)
     *          // -> null
     *
     * @param {Number} page
     *
     * @returns {Array|null} an array of ranges or null if no range could
     * be determined
     *
     * @private
     *
     * #see #groupWithFeeds
     */
    groupWithFeedsForPage : function(page) {

        const me = this;

        return me.groupWithFeeds(page);
    },


    /**
     * Returns page ranges depending on the feeds and pages available.
     * Feeds will be treated as regular pages and considered accordingly when
     * ranges get computed.
     * If a page is specified, only the right side ranges of this page, including
     * the page itself, are considered.
     *
     *  @example
     *
     *          // [1, 2] (3:2) (4:5)[5](6:5) [8, 9] (10:9)
     *          // groupWithFeedsForPage(1)
     *          // -> [1, 2, 3] [4, 5, 6] [8, 9 10]
     *
     *          // [1, 2] (3:2) (4:5)[5](6:5) [8, 9] (10:9)
     *          // groupWithFeedsForPage(3)
     *          // -> [3] [4, 5, 6] [8, 9 10]
     *
     *          // [1, 2] (3:2) (4:5)[5](6:5) [8, 9] (10:9)
     *          // groupWithFeedsForPage(7)
     *          // -> null
     *
     * @param {Number} page
     *
     * @returns {Array|null} an array of ranges or null if no range could
     * be determined
     *
     * @private
     */
    groupWithFeeds : function(page = 0) {

        const me      = this,
            pageMap = me.getPageMap(),
            range   = [],
            found   = [],
            current = [];

        if (page !== 0) {
            page = me.filterPageValue(page);

            if (!pageMap.peekPage(page) && !me.getFeedAt(page)) {
                return null;
            }
        }


        for (var i in pageMap.map) {
            i = parseInt(i, 10);
            if (i >= page) {
                range.push(i);
            }
        }

        for (var i in me.feed) {
            i = parseInt(i, 10);
            if (i >= page) {
                range.push(i);
            }
        }

        // no feeds, no pages -> return
        if (!range.length) {
            return null;
        }

        range.sort(function(a, b){return a-b});

        for (var i = 0, len = range.length; i < len; i++) {
            let feed        = me.getFeedAt(range[i]),
                currentPage = range[i];

            if (i === len - 1 || (feed && feed.getPrevious()) ||
                (range[i + 1] - 1 !== currentPage) ||
                (me.getFeedAt(range[i + 1]) && me.getFeedAt(range[i + 1]).getPrevious() !== currentPage) ) {
                current.push(range[i]);
                found.push(current.splice(0, current.length));
                continue;
            }

            current.push(range[i]);
        }

        return found;
    },


    /**
     * Prepares this feeder by sanitizing pages and feeds for the requested
     * operation. Feeds will be created if necessary.
     *
     * @param {Number} page
     * @param {Mixed} ation
     *
     * @return {Array} returns the ranges that were created to indicate feed
     * positions, or null if preparing the feeder failed
     *
     * @throws if action does not equal to #ACTION_ADD and #ACTION_REMOVE
     *
     * @private
     */
    prepareForAction : function(page, action) {

        const me      = this,
              ADD     = me.statics().ACTION_ADD,
              REMOVE  = me.statics().ACTION_REMOVE,
              pageMap = me.getPageMap(),
              isAdd   = action === ADD;

        page = me.filterPageValue(page);

        if ([ADD, REMOVE].indexOf(action) === -1) {
            Ext.raise({
                msg    : '\'action\' must be any of ACTION_ADD or ACTION_REMOVE',
                action : action
            });
        }

        me.sanitizeFeedsForPage(page, action);
        let feedIndexes = me.findFeedIndexesForActionAtPage(page, action);

        if (feedIndexes === null) {
            return null;
        }

        let createAndSwap = function(at, targetPage) {
                if (pageMap.peekPage(at)) {
                    me.swapMapToFeed(at, targetPage);
                }
                me.createFeedAt(at, targetPage);
            },
            length, end;

        Ext.Array.each(feedIndexes, function(range, feedIndex) {
            Ext.Array.each(range, function(currentPage, rangeIndex) {
                length = range.length,
                end    = range[range.length - 1];

                if (length > 1) {
                    createAndSwap(range[0], range[0] + 1);
                    createAndSwap(range[1], range[1] - 1);
                } else {
                    // one page, the next Feed following must serve it
                    createAndSwap(range[0], range[0] - 1);
                }

            });
        });

        return feedIndexes;
    },


    /**
     * Tries to look up the record in the available Feeds and returns the
     * RecordPosition if found, otherwise null.
     *
     * @param {Ext.data.Model} record
     *
     * @return {conjoon.cn_core.data.pageMap.RecordPosition|null}
     *
     * @see conjoon.cn_core.data.pageMap.Feed#indexOf
     *
     * @throws if record is not an instance of {Ext.data.Model}
     */
    findInFeeds : function(record) {

        const me    = this,
              feeds = me.feed;

        if (!(record instanceof Ext.data.Model)) {
            Ext.raise({
               msg    : "'record' must be an instance of Ext.data.Model",
               record : record
            });
        }

        let feed, index;

        for (feed in feeds) {
            index = feeds[feed].indexOf(record);

            if (index !== -1) {
                return Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                    page  : feed,
                    index : index
                });
            }
        }

        return null;
    },


    /**
     * Returns the record found at the specified page and the specified index.
     * The record is searched in the PageMap and in the existing Feeds, and
     * returned if found.
     *
     * @param {Number} page The page in the PageMap or the Feeds to query
     * @param {Number} index The index where the record should be retrieved from
     *
     * @return {Ext.data.Model|undefined} Returns the record found at the position,
     * otherwise undefined if either record or position do not exist.
     *
     * @private
     *
     * @throws if page or index are not valid
     */
    getRecordAt : function(page, index) {

        const me          = this,
              pageMap     = me.getPageMap(),
              map         = pageMap.map;

        page  = me.filterPageValue(page);
        index = parseInt(index, 10);

        if (index < 0 || index > pageMap.getPageSize()) {
            Ext.raise({
                msg   : Ext.String.format("'index' {0} is out of bounds"),
                index : index
            });
        }

        let pageAt = map[page];

        // look in page
        if (pageAt && pageAt.value[index]) {
            return pageAt.value[index];
        }

        // ... and not found. So s.ok in feed

        let feed = me.getFeedAt(page);

        if (feed && feed.getAt(index)) {
            return feed.getAt(index);
        }

        return undefined;
    },


    /**
     * Returns true if the feed at fromIndex might pass its data down to a
     * page or Feed at toIndex.
     * This is usually true if the page at toIndex is served from the Feed at
     * toIndex has n-x entries (with 0 < x  <= n) and the Feed at fromIndex has
     * n entries, where n is pageSize. This gives a direct neighbour feed the
     * chance to be filled
     * up completely to be re-created as a page again.
     * This method will silently return false if neither feeds nor pages at
     * toIndex  exist.
     * The method also checks if the feed has enough data items to serve a
     * neighbour page(!).
     * This method is usually needed when the API needs to check if two
     * independent Feeds can serve one another to make one Feed a page again.
     * Returns false if the specified page numbers are no direct neighbours.
     *
     * @param {Number} fromIndex
     * @param {Number} toIndex
     *
     * @return {Boolean}
     *
     *
     *
     * @throws if the feed at fromINdex does not exist.
     *
     * @private
     */
    canServeFromFeed : function(fromIndex, toIndex) {

        const me       = this,
              pageMap  = me.getPageMap();

        fromIndex = me.filterPageValue(fromIndex);
        toIndex   = me.filterPageValue(toIndex);

        let feed = me.getFeedAt(fromIndex);

        if (!feed) {
            Ext.raise({
                msg       : "The Feed at 'fromIndex' " + fromIndex + " does not exist.",
                fromIndex : fromIndex
            });
        }

        if (Math.abs(fromIndex - toIndex) !== 1) {
            return false;
        }

        if (pageMap.peekPage(toIndex) && feed.getFreeSpace() < feed.getSize()) {
            if (feed.getPrevious() === toIndex || feed.getNext() === toIndex) {
                return true;
            }
        }

        let targetFeed = me.getFeedAt(toIndex);

        if (!targetFeed) {
            return false;
        }

        if (targetFeed.getFreeSpace() > 0 && feed.getFreeSpace() === 0) {
            return true;
        }

        return false;
    }


});