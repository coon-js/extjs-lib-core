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
        'conjoon.cn_core.data.pageMap.Operation',
        'conjoon.cn_core.data.pageMap.IndexLookup'
    ],

    mixins  : [
        'conjoon.cn_core.data.pageMap.ArgumentFilter',
        'Ext.mixin.Observable'
    ],


    /**
     * @event cn_core-pagemapfeeder-pageremoveveto
     * This event is triggered if any beforepageremove-listener returned false
     * and vetoed the removal of a page. This is only processed, when this
     * PageMapFeeder's #removePageAt()-method is used for removing pages.
     * If no listener for this event is registered, an exception will be thrown,
     * raising the issue that unexpectedly the removal of a page was vetoed.
     * @param {conjoon.cn_core.data.pageMap.PageMapFeeder} this
     * @param {Number} page
     */

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
     * @type {conjoon.cn_core.data.pageMap.IndexLookup} lookup
     * @private
     */
    indexLookup : null,


    /**
     * @type {Object} feed
     * @private
     */
    feed : null,


    /**
     * Flag for suspending sanitizing of Feeds and Pages
     * @type {Boolean}
     */
    sanitizerSuspended : false,

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

        me.mixins.observable.constructor.call(this);

        me.feed = {};
    },


    /**
     * Resets this feeder to a reusable state.
     *
     * @private
     */
    reset : function() {
        const me = this;

        me.feed               = {};
        me.sanitizerSuspended = false;
    },

    /**
     * Applies the pageMap to this instance. Installs #reset as callback
     * for the clear-event of the PageMap.
     *
     * @param {Ext.data.PageMap} PageMap
     *
     * @throws if pageMap was already set, or if pageMap is not an instance of
     * {Ext.data.PageMap}
     */
    applyPageMap : function(pageMap) {

        const me = this;

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

        // we need to register the listener for the store's clear event,
        // since onPageMapClear in BufferedStores calls  data.clearListeners();,
        // which would remove our listener for the clear event of the PageMap
        // (ExtJS 6.2.0)
        let store = pageMap.getStore();
        if (!store || !(store instanceof Ext.data.BufferedStore)) {
            Ext.raise({
                msg     : "'pageMap' must be configured with a valid store",
                pageMap : pageMap
            });
        }

        store.on('clear', me.reset, me);

        return pageMap;
    },


    /**
     * Overridden to detach callback for PageMap's store "clear" event.
     * @inheritdoc
     */
    destroy :  function() {

        const me = this;

        me.getPageMap().getStore().un('clear', me.reset, me);

        me.callParent(arguments);
    },


    /**
     * Makes sure the specified record is moved to a new position after an
     * update operation. The record must already belong to this Feeder's
     * PageMap or Feeds.
     *
     * @param {Ext.data.Model} record
     *
     * @return {conjoon.cn_core.data.pageMap.Operation}
     */
    update : function(record) {

        const me             = this,
              pageMap        = me.getPageMap(),
              lookup         = me.getIndexLookup(),
              RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition,
              op             = Ext.create('conjoon.cn_core.data.pageMap.Operation', {
                  type : conjoon.cn_core.data.pageMap.Operation.MOVE
              }),
              createResult = function(cfg) {
                  cfg.record = record;
                  op.setResult(cfg);
                  return op;
              },
              updateTotalCount = function() {
                  let store = pageMap.getStore();
                  store.totalCount = store.getTotalCount() + 1;
              };

        me.filterRecordValue(record);

        // check first if  indexLookup returns an array. We do not have to
        // recompute anything then and can call directly the move-operation
        let pos = lookup.findInsertIndex(record, me);
        if (Ext.isArray(pos)) {
            return me.moveRecord(record, RecordPosition.create(pos));
        }

        let remFirst = me.removeRecord(record);
        if (!remFirst.getResult().success) {
            updateTotalCount();
            return createResult({success : false});
        }

        let from  = remFirst.getResult().from,
            index = lookup.findInsertIndex(record, me);

        if (Ext.isArray(index)) {
            pos = RecordPosition.create(index);
        } else {
            updateTotalCount();
            return createResult({success : false, from : from});
        }


        return me.addRecord(record, pos);
    },


    /**
     * Removes the specified record.
     * Alias for #removeRecord
     *
     * @param {Ext.data.Model} record
     *
     * @returns {*|conjoon.cn_core.data.pageMap.Operation|Object}
     */
    remove : function(record) {
        const me = this;

        return me.removeRecord(record);
    },


    /**
     * Adds the specified record sorted into the PageMap or Feeds.
     * Makes sure any pages are created if needed.
     *
     * @param {Ext.data.Model} record
     *
     * @return {conjoon.cn_core.data.pageMap.Operation}
     */
    add : function(record) {

        const me             = this,
              pageMap        = me.getPageMap(),
              map            = pageMap.map,
              PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
              lookup         = me.getIndexLookup(),
              lastPossPage   = PageMapUtil.getLastPossiblePageNumber(pageMap),
              RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition,
              op             = Ext.create('conjoon.cn_core.data.pageMap.Operation', {
                  type : conjoon.cn_core.data.pageMap.Operation.ADD
              }),
              createResult = function(cfg) {
                  op.setResult(cfg);
                  return op;
              };

        me.filterRecordValue(record);

        let index      = lookup.findInsertIndex(record, me),
            pos        = null,
            createPage = false;

        if (Ext.isArray(index)) {
            pos = RecordPosition.create(index);

            if (lastPossPage === pos.getPage() - 1 && !map[pos.getPage()]) {
                createPage = true;
            }

        } else if (index === 1) {
            if (pageMap.getCount() === 0) {
                createPage = true;
                pos        = RecordPosition.create(1, 0);
            } else {

                // would be normally done by addRecord, but we do not enter
                // this method
                let store = pageMap.getStore();
                store.totalCount = store.getTotalCount() + 1;

                return createResult({
                    success : false,
                    record  : record
                })
            }
        }

        if (createPage) {
            pageMap.add(pos.getPage(), []);
        }

        return me.addRecord(record, pos);
    },


    /**
     * Moves the record from the specified from-position to the specified to
     * position. The result of this operation is encapsulated in the returning
     * conjoon.cn_core.data.pageMap.Operation-object.
     * Feeds will be considered in this implementation. If the record positions
     * can be found in the same page range, PageMapUtil's moveRecord will
     * be called.
     *
     * @param {conjoon.cn_core.data.pageMap.RecordPosition} from
     * @param {conjoon.cn_core.data.pageMap.RecordPosition} to
     *
     * @return {conjoon.cn_core.data.pageMap.Operation}
     *
     * @throws if record is not part of the PageMap of this Feeder, of if the
     * record is not part of any Feed.
     *
     * @see conjoon.cn_core.data.pageMap.PageMapUtil#moveRecord
     *
     * @private
     */
    moveRecord : function(record, to) {

        const me          = this,
              pageMap     = me.getPageMap(),
              PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
              Operation   = conjoon.cn_core.data.pageMap.Operation,
              op          = Ext.create(Operation, {
                  type : Operation.MOVE
              }),
              result = {};

        to        = me.filterRecordPositionValue(to, pageMap.getPageSize());
        result.to = to;

        // check if record is part of PageMap or Feeds
        let from = PageMapUtil.findRecord(record, me);

        if (!from) {
            Ext.raise({
                msg    : "'record' cannot be found in PageMap and cannot be found in Feeds",
                record : record
            });
        }

        result.from   = from;
        result.record = record;

        let targetPage  = to.getPage();

        if (!pageMap.peekPage(targetPage) && !me.getFeedAt(targetPage)) {
            Ext.raise({
                msg : "the page of the requested position does not exist; page: " + targetPage,
                to  : to
            });
        }

        let pageRangeFrom = PageMapUtil.getPageRangeForRecord(record, me);

        if (pageRangeFrom.contains(to)) {
            if (PageMapUtil.moveRecord(from, to, me)) {
                result.success = true;
            } else {
                result.success = false;
            }

            op.setResult(result);

            return op;
        }

        // suspend sanitizer
        me.sanitizerSuspended = true;

        let tmp = Ext.create('Ext.data.Model');
        // insert dummy record so we dont have to work on recomputing indexes
        // due to missing original record  - replaceWith()
        me.replaceWith(from, tmp);
        me.addRecord(record, to);
        me.removeRecord(tmp);

        me.sanitizerSuspended = false;

        me.sanitizeFeedsForPage(Math.min(to.getPage(), from.getPage()), null, true);

        result.success = true;
        op.setResult(result);
        return op;
    },


    /**
     * Adds the specified record to the specified to-position, and shifts data
     * accordingly.
     * This implementation considers feeds and will shift data to it if
     * applicable.
     * The position may be a position in the map itself or in an existing Feed.
     * Calling this method will automatically update the totalCount of the PageMap.
     *
     * @param {Ext.data.Model} record
     * @param {conjoon.cn_core.data.pageMap.RecordPosition} to
     *
     * @return {conjoon.cn_core.data.pageMap.Operation} The operation with the
     * result, which hints to the state of this PageMap.
     *
     * @throws if the requested page or the requested Feed does not exist
     *
     * @private
     */
    addRecord : function(record, to) {

        const me           = this,
            pageMap      = me.getPageMap(),
            map          = pageMap.map,
            ADD          = me.statics().ACTION_ADD,
            op           = Ext.create('conjoon.cn_core.data.pageMap.Operation', {
                type : conjoon.cn_core.data.pageMap.Operation.ADD
            }),
            pageSize       = pageMap.getPageSize(),
            Util           = conjoon.cn_core.Util,
            PageRange      = conjoon.cn_core.data.pageMap.PageRange,
            PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
            RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition,
            maintainRanges = [],
            createResult = function(cfg) {
                op.setResult(cfg);
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
                    if (previousPage &&
                        ((me.getFeedAt(previousPage) && !me.canServeFromFeed(previousPage, currentPage)) ||
                        (feed.getPrevious() !== previousPage))) {
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

        me.sanitizeFeedsForPage(page, me.statics().ACTION_ADD, true);

        let store = pageMap.getStore();
        store.totalCount = store.getTotalCount() + 1;

        return createResult({
            success : true,
            record  : record,
            to      : to
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
     * This method will automatically update the PageMap's totalCount, even if
     * the record to remove was not found.
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
     * @return {conjoon.cn_core.data.pageMap.Operation}
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
              op           = Ext.create('conjoon.cn_core.data.pageMap.Operation', {
                  type : conjoon.cn_core.data.pageMap.Operation.REMOVE
              }),
              Util           = conjoon.cn_core.Util,
              PageRange      = conjoon.cn_core.data.pageMap.PageRange,
              PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
              maintainRanges = [],
              createResult = function(cfg) {
                  op.setResult(cfg);
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

                      // there migt be edge cases where a page right next to the
                      // feed is not used for this feeder!
                      if (page.getNext(recordsAreFromPage) && currentRecords && currentRecords.length) {
                          page.fill(currentRecords);
                      }
                  }

                  return tmp;
              },
              updateStoreCount = function() {
                  let store = pageMap.getStore();
                  store.totalCount = store.getTotalCount() - 1;
              };


        let position = PageMapUtil.findRecord(record, me);

        if (!position) {
            updateStoreCount();
            return createResult({
                success : false,
                record  : record
            });
        }

        let page        = position.getPage(),
            index       = position.getIndex(),
            feedIndexes = me.prepareForAction(page, REMOVE);

        if (feedIndexes === null && page !== PageMapUtil.getLastPossiblePageNumber(pageMap)) {
            updateStoreCount();
            return createResult({
                success : false,
                record  : record,
                from    : position
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
        if (PageMapUtil.getRecordAt(position, me) !== record) {

            Ext.raise({
                msg    : Ext.String.format(
                    "Unexpected error: record is not available at page {0} and index {1} anymore",
                    page, index),
                record : record
            });
        }

        // do the shift. we're not on th last page here
        let records = null;
        if (feedIndexes) {
            let lower   = feedIndexes[0][0];

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
        }

        // change Feed or page, depending where the record was found
        let feed = me.getFeedAt(page),
            remRec;
        if (!feed) {
            remRec = map[page].value.splice(index, 1);
            if (records) {
                map[page].value.push(records[0]);
            }
            delete pageMap.indexMap[remRec[0].internalId];
            maintainRanges.push(page);
        } else {
            feed.removeAt(index);
            if (records) {
                feed.fill(records);
            }
        }

        Ext.Array.each(Util.groupIndices(maintainRanges),
            function(range) {

                PageMapUtil.maintainIndexMap(
                    PageRange.createFor(range[0], range[range.length - 1]), pageMap
                );
            }
        );

        me.sanitizeFeedsForPage(page, me.statics().ACTION_REMOVE, true);

        updateStoreCount();

        return createResult({
            success : true,
            record  : record,
            from    : position
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
     * This method does not remove explicitely empty pages if the method is not
     * called during the finalizing process of sanitizing.
     *
     *
     * @param {Number} page
     * @param {Boolean} finalizing Whether this call is at the end of an
     * add/update/remove operation
     *
     * @return {Boolean} true when sanitizing processed, otherwise false, e.g.
     * if no Feed and no page exist at the specified position
     *
     * @private
     */
    sanitizeFeedsForPage : function(page, action = null, finalizing = false) {

        const me          = this,
              pageMap     = me.getPageMap(),
              PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
              feeds       = me.feed,
              ADD         = me.statics().ACTION_ADD,
              REMOVE      = me.statics().ACTION_REMOVE;

        if (me.sanitizerSuspended === true) {
            return false;
        }

        if (finalizing !== true && [ADD, REMOVE].indexOf(action) === -1) {
            Ext.raise({
                msg    : '\'action\' must be any of ACTION_ADD or ACTION_REMOVE when finalizing',
                action : action
            });
        }

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

            // [..13] (14:13) [15] (16 : 17)
            // 15 remove two pages close to each other
            if (action === ADD) {
                if (!pageMap.peekPage(index - 1) &&
                    me.getFeedAt(index + 1) &&
                    (!me.getFeedAt(index - 1) || me.getFeedAt(index - 1).getNext() !== index) &&
                    me.getFeedAt(index + 1).getPrevious() === index){
                    me.removePageAt(index);
                    me.removeFeedAt(i + 1);
                }
            } else if (action === REMOVE) {
                if (!pageMap.peekPage(index + 1) &&
                    me.getFeedAt(index - 1) &&
                    (!me.getFeedAt(index + 1) || me.getFeedAt(index + 1).getPrevious() !== index) &&
                    me.getFeedAt(index - 1).getNext() === index) {
                    me.removePageAt(index);
                    me.removeFeedAt(i - 1);
                }
            }

            // remove single pages
            if (!pageMap.peekPage(index - 1) && !pageMap.peekPage(index + 1)
                && !me.hasPreviousFeed(index) && !me.hasNextFeed(index)) {
                me.removePageAt(index);
            }
        }

        // if this sanitizing was called as part of a finalizing process,
        // we remove any empty page if applicable
        if (finalizing === true) {
            // remove empty pages
            if (!me.hasPreviousFeed(page) && !me.hasNextFeed(page) &&
                pageMap.peekPage(page) && !pageMap.peekPage(page).value.length) {
                me.removePageAt(page);
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
        // we have to re-use the data length in case we are
        // swapping from a page that was the last page and which is currently
        // being emptied
        for (var i = 0, len = data.length; i < len; i++) {
            feedData.push(data[i]);
        }

        // removeAtKey should clear the indexMap for the registered records and
        // their internalIds
        me.removePageAt(page);


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

            if (!isAdd && range[end - 1] && foundIndex === found.length - 1) {
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

            // we may only create the upper bounds with range[end] +1 if there
            // is no page following immediately
            grp.push(
                isAdd && !me.getFeedAt(range[end]) && (!found[foundIndex + 1] || found[foundIndex + 1][0] !== range[end] + 1)
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
     * i.e. all data indices are filled with data, or the page is a feed with the
     * (assumed) last possible page number.
     *
     * @param {Number} page
     *
     * @return {Boolean} true if the feed at the specified index exists and
     * could be reused as a page, otherwise false.
     *
     * @throws any exception from #filterPageValue
     */
    isPageCandidate : function(page) {

        const me          = this,
              PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil;

        let feed;

        page = me.filterPageValue(page);
        feed = me.getFeedAt(page);

        if (feed && (!feed.hasUndefined()
            || page === PageMapUtil.getLastPossiblePageNumber(me.getPageMap()))) {
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

        return page > 1 && (me.getFeedAt(page - 1) !== null &&
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
                    if (Math.abs(range[1] - range[0]) === 1) {
                        if (!isAdd) {
                            createAndSwap(range[1], range[0]);
                        } else {
                            createAndSwap(range[0], range[1]);
                        }
                    } else {
                        createAndSwap(range[0], range[0] + 1);
                        createAndSwap(range[1], range[1] - 1);
                    }
                } else {
                    // one page, the next Feed following must serve it
                    createAndSwap(range[0], range[0] - 1);
                }

            });
        });

        return feedIndexes;
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
    },


    /**
     * Replaces the record at the specified position with the specified record.
     * This method considers feeds. If the record was found in the PageMap,
     * the indexMap's entry for the replaced record will be updated, too.
     *
     * @param {conjoon.cn_core.data.pageMap.RecordPosition} position
     * @param {Ext.data.Model} record
     *
     * @return {Ext.data.Model} The record that was replaced
     *
     * @throws if the position does not represent an existing record
     */
    replaceWith : function(position, record) {

        const me      = this,
              pageMap = me.getPageMap(),
              map     = pageMap.map;

        position  = me.filterRecordPositionValue(position, pageMap.getPageSize());
        record    = me.filterRecordValue(record);

        let page  = position.getPage(),
            index = position.getIndex(),
            feed  = me.getFeedAt(page);

        if (!map[page] && !feed) {
            Ext.raise({
                msg      : "the requested position's page does not exist in the " +
                           "PageMAp and does not exist in Feeds",
                position : position
            });
        }

        if (feed) {
            return feed.replaceWith(index, record);
        }

        let old = map[page].value[index];
        map[page].value[index] = record;
        pageMap.indexMap[record.internalId] = pageMap.indexMap[old.internalId];
        delete pageMap.indexMap[old.internalId];

        return old;
    },


    /**
     * Returns the IndexLookup to use with this PageMapFeeder.
     * Creates an instance of {conjoon.cn_core.data.pageMap.IndexLookup} if
     * the IndexLookup is not otherwise already set.
     *
     * @return {conjoon.cn_core.data.pageMap.IndexLookup}
     */
    getIndexLookup : function() {

        const me = this;

        if (!me.indexLookup) {
            me.indexLookup = Ext.create('conjoon.cn_core.data.pageMap.IndexLookup');
        }

        return me.indexLookup;
    },


    /**
     * Wraps calls to Ext.data.PageMap#removeAtKey and throws an exception if
     * any beforepageremove-listener vetoed removing the page, and no callback
     * for #cn_core-pagemapfeeder-pageremoveveto was found. Otherwise, the event
     * is triggered.
     *
     * @param {Number} page
     *
     * @throws if the page could not be removed.
     */
    removePageAt : function(page) {

        const me      = this,
              pageMap = me.getPageMap();


        pageMap.removeAtKey(page);

        if (pageMap.peekPage(page)) {

            if (!me.hasListener('cn_core-pagemapfeeder-pageremoveveto')) {
                Ext.raise({
                    msg  : "someone unexpectedly vetoed removing the page at " + page +
                           ", and no listener is registered for handling this.",
                    page : page
                })
            } else {
                me.fireEvent('cn_core-pagemapfeeder-pageremoveveto', me, page);
            }

        }
    }


});