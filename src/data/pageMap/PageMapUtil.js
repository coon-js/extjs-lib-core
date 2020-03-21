/**
 * coon.js
 * lib-cn_core
 * Copyright (C) 2017-2020 Thorsten Suckow-Homberg https://github.com/coon-js/lib-cn_core
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
 * This class provides various methods for convenient access to {Ext.data.PageMap}s
 * of {Ext.data.BufferedStore}s such as moving records or determining the
 * (buffered/available) page ranges a record sits in.
 * Note:
 * Implementations are not view related and do not trigger a re-rendering of any
 * attached view.
 *
 */
Ext.define("coon.core.data.pageMap.PageMapUtil", {

    singleton : true,

    mixins : [
        "coon.core.data.pageMap.ArgumentFilter"
    ],

    requires : [
        "coon.core.Util",
        "coon.core.data.pageMap.RecordPosition",
        "coon.core.data.pageMap.PageRange",
        "coon.core.data.pageMap.IndexRange"
    ],


    /**
     * Computes the expected RecordPosition representing the given store index.
     * The index is not guaranteed to hold a record.
     *
     * @param {Number} position
     * @param {Ext.data.PageMap} pageMap
     * @param {Boolean} ignoreTotalCount true to not check whether any index exceeds
     * the current totalCount of the underlying store
     *
     * @return {coon.core.data.pageMap.RecordPosition}
     *
     * @throws if position less than 0, or if pageMap is not an instance of
     * {Ext.data.PageMap} or if index is greater than the total count of the
     * PageMap's store
     */
    storeIndexToPosition : function (index, pageMap, ignoreTotalCount = false) {

        const me = this;

        index = !Ext.isNumber(index) ? -1 : parseInt(index, 10);

        if (index < 0 ) {
            Ext.raise({
                msg   : "'index' must be a number greater than -1",
                index : index
            });
        }

        pageMap = me.filterPageMapValue(pageMap);

        if (!ignoreTotalCount && index >= pageMap.getStore().getTotalCount()) {
            Ext.raise({
                msg        : "'index' of position exceeds the total count of the PageMap's store",
                totalCount : pageMap.getStore().getTotalCount(),
                index      : index
            });
        }

        return Ext.create("coon.core.data.pageMap.RecordPosition", {
            page  : Math.floor(index /  pageMap.getPageSize()) + 1,
            index : index % pageMap.getPageSize()
        });
    },


    /**
     * Computes the expected store index of the record represented by position.
     * The index is not guaranteed to hold a record.
     *
     * @param {coon.core.data.pageMap.RecordPosition} position
     * @param {Ext.data.PageMap} pageMap
     *
     * @return {Number}
     *
     * @throws if position is not an instance of {coon.core.data.pageMap.RecordPosition},
     * or if pageMap is not an instance of {Ext.data.PageMap}, or if the index in
     * exceeds the pageSize - 1
     */
    positionToStoreIndex : function (position, pageMap) {

        const me = this;

        if (!(position instanceof coon.core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg      : "'position' must be an instance of coon.core.data.pageMap.RecordPosition",
                position : position
            });
        }

        pageMap = me.filterPageMapValue(pageMap);

        if (position.getIndex() >= pageMap.getPageSize()) {
            Ext.raise({
                msg      : "'index' of position exceeds the configured pageSize of the pageMap",
                pageSize : pageMap.getPageSize(),
                position : position
            });
        }

        return ((position.getPage() - 1) * pageMap.getPageSize()) +
                position.getIndex();
    },


    /**
     * Moves the record from the specified from-position to the specified to-
     * position. The positions must be within the same PageRange.
     * This method will maintain indexes so that indexOf-of the PageMap
     * continues to work.
     * If pageMapOrFeeder is an instance of coon.core.data.pageMap.PageMapFeeder,
     * moving a record will also work in a PageRange that has Feeds.
     *
     *
     *       @example
     *       // map:  1 : ['a', 'b' , 'c', 'd']
     *       //       2 : ['e', 'f' , 'g', 'h']
     *       //       3 : ['i', 'j' , 'K', 'l']
     *
     *       // move([3, 2], [1, 0], map);
     *
     *       // map:  1 : ['K', 'a', 'b' , 'c']
     *       //       2 : ['d', 'e', 'f' , 'g']
     *       //       3 : [ 'h', 'i', 'j', 'l']
     *
     * Note:
     * This implmentation will shift records across pages, so that the targetPsoition
     * for the record being moved migth not represent the position of the record
     * in the PageMap "after" the move operation finished!
     *
     * @example
     *       // note how the record D is missing at its source position when being
     *       // moved, thus following data is being shifted down. The resulting
     *       // position of D is not [3, 1], but [3, 0]
     *       // !However, THE INDEX IS NOT IMPORTANT, neighbour-data is important
     *       // since this implementation is a utility function for re-ordering!
     *       data.
     *       // map:  1 : ['a', 'b' , 'c', 'D']
     *       //       2 : ['e', 'f' , 'g', 'h']
     *       //       3 : ['i', 'j' , 'k', 'l']
     *
     *       // move([1, 3], [3, 1], map);
     *
     *       // map:  1 : ['a', 'b', 'c' , 'e']
     *       //       2 : ['f', 'g', 'h' , 'i']
     *       //       3 : [ 'D', 'j', 'k', 'l']
     *
     *
     *
     * @param {coon.core.data.pageMap.RecordPosition} from
     * @param {coon.core.data.pageMap.RecordPosition} to
     * @param {Ext.data.PageMap|coon.core.data.pageMap.PageMapFeeder} pageMapOrFeeder
     *
     * @return {Boolean} true if the record was successfully moved, otherwise
     * false
     *
     * @throws if from or to are no instance of {coon.core.data.pageMap.RecordPosition},
     * if pageMap is not an instance of {Ext.data.PageMap} or if from and to
     * are not within the same PageRange or any of the source or target records could not
     * be found
     */
    moveRecord : function (from, to, pageMapOrFeeder) {

        const me = this;

        let fromRecord,
            toRecord,
            fromRange,
            toRange,
            map,
            toPage, fromPage, pageMap, feeder, fromIndex, toIndex;

        from            = me.filterRecordPositionValue(from);
        to              = me.filterRecordPositionValue(to);
        pageMapOrFeeder = me.filterPageMapOrFeederValue(pageMapOrFeeder);

        // if from and to are equal we do no further checks and return true
        if (from.equalTo(to)) {
            return true;
        }

        fromRecord = me.getRecordAt(from, pageMapOrFeeder);
        toRecord   = me.getRecordAt(to, pageMapOrFeeder);
        fromRange  = fromRecord ? me.getPageRangeForRecord(fromRecord, pageMapOrFeeder) : null;
        toRange    = toRecord   ? me.getPageRangeForRecord(toRecord, pageMapOrFeeder) : null;

        if (!fromRange || !toRange) {
            Ext.raise({
                msg       : "could not determine the ranges of the records being moved",
                fromRange : fromRange,
                toRange   : toRange
            });
        }

        if (!toRange.equalTo(fromRange)) {
            Ext.raise({
                msg       : "source- and target-positions are not in the same page range",
                fromRange : fromRange,
                toRange   : toRange
            });
        }

        toPage    = to.getPage();
        fromPage  = from.getPage();
        fromIndex = from.getIndex();
        toIndex   = to.getIndex();

        pageMap = pageMapOrFeeder instanceof Ext.data.PageMap
            ? pageMapOrFeeder
            : pageMapOrFeeder.getPageMap();

        feeder = pageMapOrFeeder instanceof Ext.data.PageMap
            ? null
            : pageMapOrFeeder;

        map = pageMap.map;

        let fromFeed      = feeder ? feeder.getFeedAt(fromPage) : null,
            toFeed        = feeder ? feeder.getFeedAt(toPage)   : null,
            maintainPages = [];

        // remove first from feeds / pages
        if (fromFeed) {
            fromFeed.removeAt(fromIndex);
        } else {
            map[fromPage].value.splice(fromIndex, 1);
            maintainPages.push(fromPage);
        }

        // in case toPage was greater than fromPage (e.g. 4 -> 7)
        for (let i = toPage; i > fromPage; i--) {
            let feed = feeder ? feeder.getFeedAt(i) : null,
                pop  = feed ? feed.extract(1) : map[i].value.shift();

            pop = feed ? pop[0] : pop;

            if (!feed) {
                maintainPages.push(i);
            }

            let targetFeed = feeder ? feeder.getFeedAt(i - 1) : null,
                targetPage = !targetFeed ? map[i - 1].value : null;

            if (pop) {
                targetFeed ? targetFeed.fill([pop]) : targetPage.push(pop);
            }
        }

        // ... else (e.g. 5 -> 2) 2, 3, 4, 5
        for (let i = toPage; i < fromPage; i++) {
            let feed = feeder ? feeder.getFeedAt(i) : null,
                pop  = feed ? feed.extract(1) : map[i].value.pop();

            pop = feed ? pop[0] : pop;

            if (!feed) {
                maintainPages.push(i);
            }

            let targetFeed = feeder ? feeder.getFeedAt(i + 1) : null,
                targetPage = !targetFeed ? map[i + 1].value : null;

            if (pop) {
                targetFeed ? targetFeed.fill([pop]) : targetPage.unshift(pop);
            }
        }

        if (toFeed) {
            toFeed.insertAt([fromRecord], toIndex);
        } else {

            if ((fromPage === toPage && fromIndex < toIndex) || fromPage < toPage) {
                toIndex--;
            }

            map[toPage].value.splice(Math.max(0, toIndex), 0, fromRecord);
        }

        if (maintainPages.length) {
            me.maintainIndexMap(coon.core.data.pageMap.PageRange.createFor(
                Math.min(...maintainPages),
                Math.max(...maintainPages)
            ), pageMap);

        }

        return true;
    },


    /**
     * Maintains the indexMap index for the PageMaps index map so the view is
     * able to properly reference records once the position of data has
     * been changed due to moving / removing data.
     *
     * @param {coon.core.data.pageMap.PageRange} pageRange the page range
     * for which re-computing the index map should occur
     * @param {Ext.data.PageMap}  the PageMap which indexMap should be updated
     *
     * @return {Boolean} true
     *
     * @throws if pageMap is not an instance of {Ext.data.PageMap}, or if pageRange
     * is not an instance of {coon.core.data.pageMap.PageRange}, or if any
     * map in the specified pageRange does not exist
     */
    maintainIndexMap : function (pageRange, pageMap){

        const me = this;

        let pageSize, storeIndex, start, end, indexMap,values, page;

        if (!(pageRange instanceof coon.core.data.pageMap.PageRange)) {
            Ext.raise({
                msg       : "'pageRange' must be an instance of coon.core.data.pageMap.PageRange",
                pageRange : pageRange
            });
        }

        pageMap = me.filterPageMapValue(pageMap);

        pageSize   = pageMap.getPageSize(),
        storeIndex = (pageRange.getFirst() - 1) * pageSize,
        start      = pageRange.getFirst();
        end        = pageRange.getLast(),
        indexMap   = pageMap.indexMap;

        for (var i = start; i <= end; i++) {

            page = pageMap.map[i];

            if (!page) {
                Ext.raise({
                    msg  : "the index for the specified PageRange does not exist in the PageMap",
                    page : i
                });
            }

            values = page.value;
            // go for values.length instead of PageSize since pages might no be
            // completely filled (e.g. last page, first page growing etc.)
            for (var a = 0, lena = values.length; a < lena; a++) {
                indexMap[values[a].internalId] = storeIndex++;
            }
        }

        return true;

    },


    /**
     * Returns the direct neighbour left to the record at the specified position.
     * Returns null if there is no neighbour record available.
     *
     * @param {coon.core.data.pageMap.RecordPosition} position
     * @param {Ext.data.PageMap|coon.core.data.pageMap.PageMapFeeder} pageMapOrFeeder
     * @param {Boolean} left true to return the left neighbour, false to return the
     * right neighbour
     *
     * @return {Ext.data.Model|undefined}
     *
     * @throws if position is not an instance of {coon.core.data.pageMap.RecordPosition},
     * or if pageMap is not an instance of {Ext.data.PageMap} and not an instance of
     * {coon.core.data.pageMap.PageMapFeeder}, or of the index of the specified
     * position is out of bounds
     */
    getNeighbour : function (position, pageMapOrFeeder, left = true) {

        const me = this;

        let neighbourIndex, neighbourPage,
            page, index, isPageMap, pageSize;

        pageMapOrFeeder = me.filterPageMapOrFeederValue(pageMapOrFeeder);

        isPageMap = pageMapOrFeeder instanceof Ext.data.PageMap;

        pageSize = (isPageMap)
            ? pageMapOrFeeder.getPageSize()
            : pageMapOrFeeder.getPageMap().getPageSize();

        position = me.filterRecordPositionValue(position, pageSize);
        page     = position.getPage();
        index    = position.getIndex();

        if (left) {
            neighbourIndex = index - 1 >= 0 ? index - 1 : pageSize - 1;
            neighbourPage  = index - 1 >= 0 ? page  : page - 1;
        } else {
            neighbourIndex = index + 1 < pageSize ? index + 1 : 0;
            neighbourPage  = index + 1 < pageSize ? page : page + 1;
        }

        return me.getRecordAt(
            coon.core.data.pageMap.RecordPosition.create(
                neighbourPage, neighbourIndex), pageMapOrFeeder);
    },


    /**
     * Returns the record found at the specified position in the specified
     * pageMap or feeder. Returns undefined if not found.
     *
     * @param {coon.core.data.pageMap.RecordPosition} position
     * @param {Ext.data.PageMap|coon.core.data.pageMap.PageMapFeeder} pageMapOrFeeder
     *
     * @return {Ext.data.Model|undefined}
     *
     * @throws if position is not an instance of {coon.core.data.pageMap.RecordPosition},
     * or if pageMap is not an instance of {Ext.data.PageMap} and not an instance of
     * {coon.core.data.pageMap.PageMapFeeder}, or of the index of the specified
     * position is out of bounds
     */
    getRecordAt : function (position, pageMapOrFeeder) {

        const me = this;

        let map, page, index, isPageMap, pageSize;

        pageMapOrFeeder = me.filterPageMapOrFeederValue(pageMapOrFeeder);

        isPageMap = pageMapOrFeeder instanceof Ext.data.PageMap;

        pageSize = (isPageMap)
            ? pageMapOrFeeder.getPageSize()
            : pageMapOrFeeder.getPageMap().getPageSize();

        position = me.filterRecordPositionValue(position, pageSize);
        page     = position.getPage();
        index    = position.getIndex();

        if (isPageMap) {
            map = pageMapOrFeeder.map;
        } else {
            map = pageMapOrFeeder.getPageMap().map;
        }

        if (map[page] && map[page].value[index]) {
            return map[page].value[index];
        }
        if (isPageMap) {
            return undefined;
        }

        // look in feeder
        let feed = pageMapOrFeeder.getFeedAt(page);

        if (feed && feed.getAt(index)) {
            return feed.getAt(index);
        }

        return undefined;
    },


    /**
     * Returns the list of pages which are direct neighbours for the page the
     * record is found in. If the second argument is an instance of PageMapFeeder,
     * Feeds will be considered when looking the position of the record up.
     *
     * @param {Ext.data.Model} record
     * @param {Ext.data.PageMap|coon.core.data.pageMap.PageMapFeeder} pageMap
     *
     * @return {coon.core.data.pageMap.PageRange}
     *
     *
     * @throws if pageMap is not an instance of {Ext.data.PageMap} or
     * {coon.core.data.pageMap.PageMapFeeder}, or if record is not an
     * instance of {Ext.data.Model}, or if the record cannot be found in the
     * current data set
     *
     * @see coon.core.Util.listNeighbours
     * @see #getRangeForRecord
     */
    getPageRangeForRecord : function (record, pageMapOrFeeder) {

        return Ext.create("coon.core.data.pageMap.PageRange", {
            pages : this.getRangeForRecord(record, pageMapOrFeeder)
        });

    },


    /**
     * Returns the list of pages which are greater than or equal to the page the
     * record is a member of. Only direct neighbours are considered.
     *
     * @param {Ext.data.Model} record
     * @param {Ext.data.PageMap} pageMap
     *
     * @return {coon.core.data.pageMap.PageRange}
     *
     * @see coon.core.Util.listNeighbours
     *
     * @throws if pageMap is not an instance of {Ext.data.PageMap}, or if record
     * is not an instance of {Ext.data.Model}, or if record is not found in the
     * pageMap.
     */
    getRightSideRange : function (record, pageMap) {

        const me      = this,
            range   = me.getRangeForRecord(record, pageMap),
            pagePos = pageMap.getPageFromRecordIndex(pageMap.indexOf(record)),
            filter  = function (value){
                return value >= pagePos;
            };

        return Ext.create("coon.core.data.pageMap.PageRange", {
            pages: range.filter(filter)
        });
    },


    /**
     * Private helper to determine the neighbour pages for a record.
     *
     * @private
     */
    getRangeForRecord : function (record, pageMapOrFeeder) {

        const me             = this,
            RecordPosition = coon.core.data.pageMap.RecordPosition;

        let page, pages, index, position, pageMap, feeder;

        if (!(record instanceof Ext.data.Model)) {
            Ext.raise({
                msg    : "'record' must be an instance of Ext.data.Model",
                record : record
            });
        }

        pageMapOrFeeder = me.filterPageMapOrFeederValue(pageMapOrFeeder);

        pages = [];

        if (pageMapOrFeeder instanceof Ext.data.PageMap) {
            pageMap = pageMapOrFeeder;
            index   = pageMapOrFeeder.indexOf(record);
            if (index !== -1) {
                page  = pageMapOrFeeder.getPageFromRecordIndex(pageMapOrFeeder.indexOf(record));
                position = RecordPosition.create(page, index);
            }
        } else {
            pageMap = pageMapOrFeeder.getPageMap();
            feeder  = pageMapOrFeeder;
            position = me.findRecord(record, feeder);
        }

        if (!position) {
            Ext.raise({
                msg             : "'record' cannot be found in current data sets",
                record          : record,
                pageMapOrFeeder : pageMapOrFeeder
            });
        }


        for (let i in pageMap.map) {
            pages.push(i);
        }

        if (feeder) {

            for (let i in feeder.feed) {
                pages.push(i);
            }

            let toPage     = position.getPage(),
                tmpPages   = coon.core.Util.listNeighbours(pages, toPage),
                finalPages = [], feed, prev, next, curr;

            for (let i = tmpPages.indexOf(toPage), len = tmpPages.length; i < len; i++) {
                curr = tmpPages[i];
                feed = feeder.getFeedAt(curr);

                if (feed) {
                    if (feed.getNext() === toPage + 1) {
                        finalPages.push(curr);
                        continue;
                    }

                    if (feed.getPrevious() >= toPage - 1) {
                        finalPages.push(curr);
                        break;
                    }
                }

                finalPages.push(curr);
            }


            for (let i = tmpPages.indexOf(toPage); i >= 0; i--) {
                curr = tmpPages[i];
                feed = feeder.getFeedAt(curr);

                if (feed) {
                    next = feed.getNext();
                    prev = feed.getPrevious();

                    if (next === toPage + 1) {
                        break;
                    }

                    if (tmpPages[i] !== toPage && prev < toPage ) {
                        break;
                    }

                    if (prev === toPage - 1) {
                        finalPages.push(curr);
                        continue;
                    }

                    if (next <= toPage + 1) {
                        finalPages.push(curr);
                        break;
                    }
                }

                finalPages.push(curr);
            }

            pages = finalPages;
        }


        return coon.core.Util.listNeighbours(pages, position.getPage());
    },

    /**
     * Returns the right side PageRanges for the specified page, not including the
     * range this page can be found in.
     *
     * @param {Number} page
     * @param {Ext.data.PageMap} pageMap
     * @param {Boolean=false} flat true to return the range as an ungrouped,
     * flat array in ascending order
     *
     * @return {coon.core.data.pageMap.PageRange|Array}
     */
    getRightSidePageRangeForPage : function (page, pageMap, flat = false) {

        const me   = this;

        let found = [],
            range, tmp, fill = false;

        pageMap = me.filterPageMapValue(pageMap);
        page    = me.filterPageValue(page);

        range = me.getAvailablePageRanges(pageMap);
        for (var i = 0, len = range.length; i < len; i++) {
            tmp = range[i].toArray();

            if (fill === true) {
                if (flat !== true) {
                    found.push(Ext.create("coon.core.data.pageMap.PageRange", {
                        pages : tmp
                    }));
                } else {
                    found = found.concat(tmp);
                }

            }
            if (!fill && tmp.indexOf(page) !== -1) {
                fill = true;
            }
        }

        if (!found.length) {
            return null;
        }

        return found;
    },

    /**
     * Returns the Page range where the specific page can be found in.
     * Returns null if no PageRange could be found.
     *
     * @param {Number} page
     * @param {Ext.data.PageMap} pageMap
     * @param {Boolean=false} flat true to return the range as an ungrouped,
     * flat array in ascending order
     *
     * @return {coon.core.data.pageMap.PageRange|Array}
     *
     * @throws if page is not a number, or if pageMap is not an instance of
     * {Ext.data.PageMap}, or if multiple ranges where found
     */
    getPageRangeForPage : function (page, pageMap, flat = false) {

        const me = this;

        let found = [],
            range, tmp;

        pageMap = me.filterPageMapValue(pageMap);
        page    = me.filterPageValue(page);

        range = me.getAvailablePageRanges(pageMap);
        for (var i = 0, len = range.length; i < len; i++) {
            tmp = range[i].toArray();
            if (tmp.indexOf(page) !== -1) {
                found.push(tmp);
            }
        }

        if (!found.length) {
            return null;
        }

        if (found.length > 1) {
            Ext.raise({
                msg   : "'range' has more than one entry for page",
                range : range,
                page  : page
            });
        }

        return flat !== true
            ? Ext.create("coon.core.data.pageMap.PageRange", {
                pages : found[0]
            })
            : found[0];
    },


    /**
     * Returns an array of {coon.core.data.pageMap.PageRange}s currently
     * loaded in the pageMap while considering the available Feeds in the passed
     * PageMapFeeder.
     *
     * @param {coon.core.data.pageMap.PageMapFeeder} pageMapFeeder
     *
     * @return {Array} An array which entries consists of {coon.core.data.pageMap.PageRange}
     * entries, ordered from lowest to highest pageRange.
     *
     * @throws if pageMap is not an instance of {Ext.data.PageMap}, or if pageMapFeeder
     * is not an instance of {coon.core.data.pageMap.PageMapFeeder}
     */
    getAvailableRanges : function (pageMapFeeder) {

        let ranges     = [],
            pageRanges = [];

        if (!(pageMapFeeder instanceof  coon.core.data.pageMap.PageMapFeeder)) {
            Ext.raise({
                msg           : "'pageMapFeeder' must be an instance of coon.core.data.pageMap.PageMapFeeder",
                pageMapFeeder : pageMapFeeder
            });
        }

        ranges = pageMapFeeder.groupWithFeeds();

        for (var i = 0, len = ranges ? ranges.length : -1; i < len; i++) {
            pageRanges.push(Ext.create("coon.core.data.pageMap.PageRange", {
                pages : ranges[i]
            }));
        }

        return pageRanges;
    },


    /**
     * Returns an array of {coon.core.data.pageMap.PageRange}s currently
     * loaded in the pageMap.
     *
     * @param {Ext.data.PageMap} pageMap
     *
     * @return {Array} An array which entries consists of {coon.core.data.pageMap.PageRange}
     * entries, ordered from lowest to highest pageRange.
     *
     * @throws if pageMap is not an instance of {Ext.data.PageMap}
     */
    getAvailablePageRanges : function (pageMap) {

        const me = this;

        let ranges     = [],
            pageRanges = [],
            i, len;

        pageMap = me.filterPageMapValue(pageMap);

        for (i in pageMap.map) {
            ranges.push(i);
        }

        ranges = coon.core.Util.groupIndices(ranges);
        for (i = 0, len = ranges.length; i < len; i++) {
            pageRanges.push(Ext.create("coon.core.data.pageMap.PageRange", {
                pages : ranges[i]
            }));
        }

        return pageRanges;
    },


    /**
     * Returns true if the first page is available in the PageMap,
     * otherwise false
     *
     * @param {Ext.data.PageMap} pageMap
     *
     * @returns {boolean}
     *
     * @throws if pageMap is not an instance of {Ext.data.PageMap}
     */
    isFirstPageLoaded : function (pageMap) {

        const me = this;

        pageMap = me.filterPageMapValue(pageMap);

        return !!pageMap.map[1];
    },


    /**
     * Returns true if the last page is available in the PageMap,
     * otherwise false
     *
     * @param {Ext.data.PageMap} pageMap
     *
     * @returns {boolean}
     *
     * @throws if pageMap is not an instance of {Ext.data.PageMap}
     */
    isLastPageLoaded : function (pageMap) {

        const me = this;

        pageMap = me.filterPageMapValue(pageMap);

        const pageRanges = me.getAvailablePageRanges(pageMap),
            store      = pageMap.getStore(),
            pageSize   = pageMap.getPageSize(),
            lastPage   = pageRanges[pageRanges.length - 1].getLast();

        return (pageSize * lastPage) >= store.getTotalCount();
    },


    /**
     * Returns the assumed number of the last page that could possibly be
     * loaded into the PageMap.
     *
     * @param {Ext.data.PageMap} pageMap
     *
     * @returns {Number}
     *
     * @throws if pageMap is not an instance of {Ext.data.PageMap}
     */
    getLastPossiblePageNumber : function (pageMap) {

        const me = this;

        let store, pageSize;

        pageMap = me.filterPageMapValue(pageMap);

        store    = pageMap.getStore();
        pageSize = pageMap.getPageSize();

        return Math.ceil(store.getTotalCount() / pageSize);
    },


    /**
     * Returns the coon.core.data.pageMap.IndexRange representing start
     * and end.
     *
     * @param {Number} start
     * @param {Number} end
     * @param {Ext.data.PageMap} pageMap
     * @param {Boolean} ignoreTotalCount true to not check whether any index exceeds
     * the current totalCount of the underlying store
     *
     * @return {coon.core.data.pageMap.IndexRange}
     *
     * @throws if pageMap is not an instance of {Ext.data.PageMap}, if start
     * or end are less than 0 or not a number, if start is less than end
     * or any other exception thrown by #storeIndexToPosition, or by the
     * constructor of IndexRange
     */
    storeIndexToRange : function (start, end, pageMap, ignoreTotalCount = false) {

        const me = this;

        pageMap = me.filterPageMapValue(pageMap);

        if (!Ext.isNumber(start) || !Ext.isNumber(end)) {
            Ext.raise({
                msg   : "'start' and 'end' must be a number.",
                start : start,
                end   : end
            });
        }
        start = parseInt(start, 10);
        end   = parseInt(end, 10);

        if (start < 0 || end < 0) {
            Ext.raise({
                msg   : "'start' and 'end' must be greater than or equal to 0",
                start : start,
                end   : end
            });
        }

        if (start > end) {
            Ext.raise({
                msg   : "'start' must be less than or equal to 'end'",
                start : start,
                end   : end
            });
        }

        start = me.storeIndexToPosition(start, pageMap, ignoreTotalCount);
        end   = me.storeIndexToPosition(end, pageMap, ignoreTotalCount);

        return Ext.create("coon.core.data.pageMap.IndexRange", {
            start : start,
            end   : end
        });
    },


    /**
     * Tries to find the record via the specified function. Arguments passed to
     * the function is the current record queried. The passed method needs to
     * return true to indicate a match. The method considers feeds.
     * Returns the Ext.data.Model if found, otherwise null.
     *
     * @param {Function} func
     * @param {coon.core.data.pageMap.PageMapFeeder} feeder
     *
     * @return {Ext.data.Model} Returns the found record if available in the
     * PageMap or the Feeds, otherwise null
     *
     * @throws if func is not a Function
     */
    getRecordBy : function (func, feeder) {

        const me = this;

        if (!Ext.isFunction(func)) {
            Ext.raise({
                msg  : "\"func\" must be a Function",
                func : func
            });
        }

        feeder = me.filterFeederValue(feeder);

        let pageMap = feeder.getPageMap(),
            map     = pageMap.map,
            page, a, i, len, lena;

        for (i in map) {
            page = map[i].value;

            for (a = 0, lena = page.length; a < lena; a++) {
                if (func.apply(null, [page[a]]) === true) {
                    return page[a];
                }
            }
        }

        const feeds = feeder.feed;

        let feed;

        for (feed in feeds) {
            page = feeds[feed].data;

            for (i = 0, len = page.length; i < len; i++) {
                if (func.apply(null, [page[i]]) === true) {
                    return page[i];
                }
            }
        }

        return null;

    },


    /**
     * Tries to find the record specified by the id in the specified feeder, considering
     * Feeds. Returns the Ext.data.Model if found,
     * otherwise null.
     *
     * @param {String} id
     * @param {coon.core.data.pageMap.PageMapFeeder} feeder
     *
     * @return {Ext.data.Model} Returns the found record if available in the
     * PageMap or the Feeds, otherwise null
     *
     * @see getRecordBy
     */
    getRecordById : function (id, feeder) {

        const me = this;

        return me.getRecordBy(function (rec) {
            if (rec.getId() === id) {
                return true;
            }
        }, feeder);

    },


    /**
     * Tries to find the specified record in the specified feeder, considering
     * Feeds. Returns the coon.core.data.pageMap.RecordPosition if found,
     * otherwise null.
     *
     * @param {Ext.data.Model} record
     * @param {coon.core.data.pageMap.PageMapFeeder} feeder
     *
     * @return {coon.core.data.pageMap.RecordPosition|null} Returns the
     * position of the record as a RecordPosition-object, otherwise false
     */
    findRecord : function (record, feeder) {

        const me = this;

        record = me.filterRecordValue(record);
        feeder = me.filterFeederValue(feeder);

        let pageMap = feeder.getPageMap(),
            index   = pageMap.indexOf(record);

        if (index !== -1) {
            return me.storeIndexToPosition(index, pageMap);
        }

        const feeds = feeder.feed;

        let feed;

        for (feed in feeds) {
            index = feeds[feed].indexOf(record);

            if (index !== -1) {
                return Ext.create("coon.core.data.pageMap.RecordPosition", {
                    page  : feed,
                    index : index
                });
            }
        }

        return null;
    }

});