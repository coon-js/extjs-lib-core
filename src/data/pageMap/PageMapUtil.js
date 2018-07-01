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
 * This class provides various methods for convenient access to {Ext.data.PageMap}s
 * of {Ext.data.BufferedStore}s such as moving records or determining the
 * (buffered/available) page ranges a record sits in.
 * Note:
 * Implementations are not view related and do not trigger a re-rendering of any
 * attached view.
 *
 */
Ext.define('conjoon.cn_core.data.pageMap.PageMapUtil', {

    singleton : true,

    mixins : [
        'conjoon.cn_core.data.pageMap.ArgumentFilter'
    ],

    requires : [
        'conjoon.cn_core.Util',
        'conjoon.cn_core.data.pageMap.RecordPosition',
        'conjoon.cn_core.data.pageMap.PageRange',
        'conjoon.cn_core.data.pageMap.IndexRange'
    ],


    /**
     * Computes the expected RecordPosition representing the given store index.
     * The index is not guaranteed to hold a record.
     *
     * @param {Number} position
     * @param {Ext.data.PageMap} pageMap
     *
     * @return {conjoon.cn_core.data.pageMap.RecordPosition}
     *
     * @throws if position less than 0, or if pageMap is not an instance of
     * {Ext.data.PageMap} or if index is greater than the total count of the
     * PageMap's store
     */
    storeIndexToPosition : function(index, pageMap) {

        const me = this;

        index = !Ext.isNumber(index) ? -1 : parseInt(index, 10);

        if (index < 0 ) {
            Ext.raise({
                msg   : '\'index\' must be a number greater than -1',
                index : index
            });
        }

        pageMap = me.filterPageMapValue(pageMap);

        if (index >= pageMap.getStore().getTotalCount()) {
            Ext.raise({
                msg        : '\'index\' of position exceeds the total count of the PageMap\'s store',
                totalCount : pageMap.getStore().getTotalCount(),
                index      : index
            });
        }

        return Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
            page  : Math.floor(index /  pageMap.getPageSize()) + 1,
            index : index % pageMap.getPageSize()
        });
    },



    /**
     * Computes the expected store index of the record represented by position.
     * The index is not guaranteed to hold a record.
     *
     * @param {conjoon.cn_core.data.pageMap.RecordPosition} position
     * @param {Ext.data.PageMap} pageMap
     *
     * @return {Number}
     *
     * @throws if position is not an instance of {conjoon.cn_core.data.pageMap.RecordPosition},
     * or if pageMap is not an instance of {Ext.data.PageMap}, or if the index in
     * exceeds the pageSize - 1
     */
    positionToStoreIndex : function(position, pageMap) {

        const me = this;

        if (!(position instanceof conjoon.cn_core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg      : '\'position\' must be an instance of conjoon.cn_core.data.pageMap.RecordPosition',
                position : position
            });
        }

        pageMap = me.filterPageMapValue(pageMap);

        if (position.getIndex() >= pageMap.getPageSize()) {
            Ext.raise({
                msg      : '\'index\' of position exceeds the configured pageSize of the pageMap',
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
     * @param {conjoon.cn_core.data.pageMap.RecordPosition} from
     * @param {conjoon.cn_core.data.pageMap.RecordPosition} to
     * @param {Ext.data.PageMap} pageMap
     *
     * @return {Boolean} true if the record was successfully moved, otherwise
     * false
     *
     * @throws if from or to are no instance of {conjoon.cn_core.data.pageMap.RecordPosition},
     * if pageMap is not an instance of {Ext.data.PageMap} or if from and to
     * are not within the same PageRange or any of the source or target records could not
     * be found
     */
    moveRecord : function(from, to, pageMap) {

        const me = this;

        let fromRecord,
            toRecord,
            fromRange,
            toRange,
            map,
            toPage, fromPage;

        if (!(from instanceof conjoon.cn_core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg  : '\'from\' must be an instance of conjoon.cn_core.data.pageMap.RecordPosition',
                from : from
            });
        }

        if (!(to instanceof conjoon.cn_core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg : '\'to\' must be an instance of conjoon.cn_core.data.pageMap.RecordPosition',
                to  : to
            });
        }

        pageMap = me.filterPageMapValue(pageMap);

        // if from and to are equal we do no further checks and return true
        if (from.equalTo(to)) {
            return true;
        }

        fromRecord = me.getRecordAt(from, pageMap);
        toRecord   = me.getRecordAt(to, pageMap);
        fromRange  = fromRecord ? me.getPageRangeForRecord(fromRecord, pageMap) : null;
        toRange    = toRecord   ? me.getPageRangeForRecord(toRecord, pageMap) : null;

        if (!fromRange || !toRange) {
            Ext.raise({
                msg       : 'could not determine the ranges of the records being moved',
                fromRange : fromRange,
                toRange   : toRange
            });
        }

        if (!toRange.equalTo(fromRange)) {
            Ext.raise({
                msg       : 'source- and target-positions are not in the same page range',
                fromRange : fromRange,
                toRange   : toRange
            });
        }

        map      = pageMap.map;
        toPage   = to.getPage();
        fromPage = from.getPage();

        map[toPage].value.splice(to.getIndex(), 0, fromRecord);

        if (toPage === fromPage && from.getIndex() > to.getIndex()) {
            map[fromPage].value.splice(from.getIndex() + 1, 1);
        } else {
            map[fromPage].value.splice(from.getIndex(), 1);
        }

        // if toPage is less or greater than fromPage, we have to unshift/push
        // records to neighbour pages
        if (toPage < fromPage) {
            for (var i = toPage; i < fromPage; i++) {
                map[i + 1].value.unshift(map[i].value.pop());
            }
        } else if (toPage > fromPage){ // toPage > fromPage
            for (var i = toPage; i > fromPage; i--) {
                map[i - 1].value.push(map[i].value.shift());
            }
        }

        me.maintainIndexMap(conjoon.cn_core.data.pageMap.PageRange.createFor(
            Math.min(fromPage, toPage),
            Math.max(fromPage, toPage)
        ), pageMap);
        return true;
    },


    /**
     * Maintains the indexMap index for the PageMaps index map so the view is
     * able to properly reference records once the position of data has
     * been changed due to moving / removing data.
     *
     * @param {conjoon.cn_core.data.pageMap.PageRange} pageRange the page range
     * for which re-computing the index map should occur
     * @param {Ext.data.PageMap}  the PageMap which indexMap should be updated
     *
     * @throws if pageMap is not an instance of {Ext.data.PageMap}, or if pageRange
     * is not an instance of {conjoon.cn_core.data.pageMap.PageRange}, or if any
     * map in the specified pageRange does not exist
     */
    maintainIndexMap : function(pageRange, pageMap){

        const me = this;

        let pageSize, storeIndex, start, end, indexMap,values, page;

        if (!(pageRange instanceof conjoon.cn_core.data.pageMap.PageRange)) {
            Ext.raise({
                msg       : '\'pageRange\' must be an instance of conjoon.cn_core.data.pageMap.PageRange',
                pageRange : pageRange
            });
        }

        pageMap = me.filterPageMapValue(pageMap);

        pageSize   = pageMap.getPageSize(),
        storeIndex = (pageRange.getFirst() - 1) * pageSize,
        start      = pageRange.getFirst()
        end        = pageRange.getLast(),
        indexMap   = pageMap.indexMap;

        for (var i = start; i <= end; i++) {

            page = pageMap.map[i];

            if (!page) {
                Ext.raise({
                    msg  : 'the index for the specified PageRange does not exist in the PageMap',
                    page : i
                });
            }

            values = page.value;
            for (var a = 0, lena = pageSize; a < lena; a++) {
                indexMap[values[a].internalId] = storeIndex++;
            }
        }

    },


    /**
     * Returns the record found at the specified position in the specified
     * pageMap. Returns null if not found.
     *
     * @param {conjoon.cn_core.data.pageMap.RecordPosition} position
     * @param {Ext.data.PageMap} pageMap
     *
     * @return {Ext.data.Model}
     *
     * @throws if position is not an instance of {conjoon.cn_core.data.pageMap.RecordPosition},
     * or if pageMap is not an instance of {Ext.data.PageMap}
     */
    getRecordAt : function(position, pageMap) {

        const me = this;

        let map, page, index;

        if (!(position instanceof conjoon.cn_core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg      : '\'position\' must be an instance of conjoon.cn_core.data.pageMap.RecordPosition',
                position : position
            });
        }

        pageMap = me.filterPageMapValue(pageMap);

        map   = pageMap.map;
        page  = position.getPage();
        index = position.getIndex();

        return map[page] && map[page].value[index]
               ? map[page].value[index]
               : null;
    },


    /**
     * Returns the list of pages which are direct neighbours for the page the
     * record is found in.
     *
     * @param {Ext.data.Model} record
     * @param {Ext.data.PageMap} pageMap
     *
     * @return {conjoon.cn_core.data.pageMap.PageRange}
     *
     * @see conjoon.cn_core.Util.listNeighbours
     *
     * @throws if pageMap is not an instance of {Ext.data.PageMap}, or if record
     * is not an instance of {Ext.data.Model}, or if record is not found in the
     * pageMap.
     */
    getPageRangeForRecord : function(record, pageMap) {

        return Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
            pages : this.getRangeForRecord(record, pageMap)
        });

    },


    /**
     * Returns the list of pages which are greater than or equal to the page the
     * record is a member of. Only direct neighbours are considered.
     *
     * @param {Ext.data.Model} record
     * @param {Ext.data.PageMap} pageMap
     *
     * @return {conjoon.cn_core.data.pageMap.PageRange}
     *
     * @see conjoon.cn_core.Util.listNeighbours
     *
     * @throws if pageMap is not an instance of {Ext.data.PageMap}, or if record
     * is not an instance of {Ext.data.Model}, or if record is not found in the
     * pageMap.
     */
    getRightSideRange : function(record, pageMap) {

        const me      = this,
            range   = me.getRangeForRecord(record, pageMap),
            pagePos = pageMap.getPageFromRecordIndex(pageMap.indexOf(record)),
            filter  = function(value){
                          return value >= pagePos;
                      };

        return Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
            pages: range.filter(filter)
        });
    },


    /**
     * Private helper to determine the neighbour pages for a record.
     *
     * @private
     */
    getRangeForRecord : function(record, pageMap) {

        const me = this;

        let page, pages;

        if (!(record instanceof Ext.data.Model)) {
            Ext.raise({
                msg    : '\'record\' must be an instance of Ext.data.Model',
                record : record
            });
        }

        pageMap = me.filterPageMapValue(pageMap);

        if (pageMap.indexOf(record) == -1) {
            Ext.raise({
                msg     : '\'record\' seems not to be a member of \'pageMap\'',
                record  : record,
                pageMap : pageMap
            });
        }

        page  = pageMap.getPageFromRecordIndex(pageMap.indexOf(record));
        pages = [];

        for (var i in pageMap.map) {
            pages.push(i);
        }

        return conjoon.cn_core.Util.listNeighbours(pages, page);


    },

    /**
     * Returns the right side PageRanges for the specified page, not including the
     * range this page can be found in.
     *
     * @param {Number} page
     * @param {Ext.data.PageMap} pageMap
     *
     * @return conjoon.cn_core.data.pageMap.PageRange
     */
    getRightSidePageRangeForPage : function(page, pageMap) {

        const me   = this;

        let found = [],
            range, tmp, fill = false;

        pageMap = me.filterPageMapValue(pageMap);
        page    = me.filterPageValue(page);

        range = me.getAvailablePageRanges(pageMap);
        for (var i = 0, len = range.length; i < len; i++) {
            tmp = range[i].toArray();

            if (fill === true) {
                found.push(Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
                    pages : tmp
                }));
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
     *
     * @return conjoon.cn_core.data.pageMap.PageRange
     *
     * @throws if page is not a number, or if pageMap is not an instance of
     * {Ext.data.PageMap}, or if multiple ranges where found
     */
    getPageRangeForPage : function(page, pageMap) {

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
                msg   : '\'range\' has more than one entry for page',
                range : range,
                page  : page
            });
        }

        return Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
            pages : found[0]
        });
    },


    /**
     * Returns an array of {conjoon.cn_core.data.pageMap.PageRange}s currently
     * loaded in the pageMap.
     *
     * @param {Ext.data.PageMap} pageMap
     *
     * @return {Array} An array which entries consists of {conjoon.cn_core.data.pageMap.PageRange}
     * entries, ordered from lowest to highest pageRange.
     *
     * @throws if pageMap is not an instance of {Ext.data.PageMap}
     */
    getAvailablePageRanges : function(pageMap) {

        const me = this;

        let ranges       = [],
              pageRanges = [];

        pageMap = me.filterPageMapValue(pageMap);

        for (var i in pageMap.map) {
            ranges.push(i);
        }

        ranges = conjoon.cn_core.Util.groupIndices(ranges);
        for (var i = 0, len = ranges.length; i < len; i++) {
            pageRanges.push(Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
                pages : ranges[i]
            }))
        };

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
    isFirstPageLoaded : function(pageMap) {

        const me = this;

        pageMap = me.filterPageMapValue(pageMap);

        return !!pageMap.map[1]
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
    isLastPageLoaded : function(pageMap) {

        const me = this;

        pageMap = me.filterPageMapValue(pageMap);

        const pageRanges = me.getAvailablePageRanges(pageMap),
              store      = pageMap.getStore(),
              pageSize   = pageMap.getPageSize(),
              lastPage   = pageRanges[pageRanges.length - 1].getLast();

        return (pageSize * lastPage) === store.getTotalCount();
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
    getLastPossiblePageNumber : function(pageMap) {

        const me = this;

        let store, pageSize;

        pageMap = me.filterPageMapValue(pageMap);

        store    = pageMap.getStore();
        pageSize = pageMap.getPageSize();

        return Math.floor(store.getTotalCount() / pageSize);
    },


    /**
     * Returns the conjoon.cn_core.data.pageMap.IndexRange representing start
     * and end.
     *
     * @param {Number} start
     * @param {Number} end
     * @param {Ext.data.PageMap} pageMap
     *
     * @return {conjoon.cn_core.data.pageMap.IndexRange}
     *
     * @throws if pageMap is not an instance of {Ext.data.PageMap}, if start
     * or end are less than 0 or not a number, if start is less than end
     * or any other exception thrown by #storeIndexToPosition, or by the
     * constructor of IndexRange
     */
    storeIndexToRange : function(start, end, pageMap) {

        const me = this;

        pageMap = me.filterPageMapValue(pageMap);

        if (!Ext.isNumber(start) || !Ext.isNumber(end)) {
            Ext.raise({
                msg   : '\'start\' and \'end\' must be a number.',
                start : start,
                end   : end
            })
        }
        start = parseInt(start, 10);
        end   = parseInt(end, 10);

        if (start < 0 || end < 0) {
            Ext.raise({
                msg   : '\'start\' and \'end\' must be greater than or equal to 0',
                start : start,
                end   : end
            })
        }

        if (start > end) {
            Ext.raise({
                msg   : '\'start\' must be less than or equal to \'end\'',
                start : start,
                end   : end
            })
        }

        start = me.storeIndexToPosition(start, pageMap);
        end   = me.storeIndexToPosition(end, pageMap);

        return Ext.create('conjoon.cn_core.data.pageMap.IndexRange', {
            start : start,
            end   : end
        });
    }

});