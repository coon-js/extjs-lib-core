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
 * Base implementation for a strategy for looking up indices in PageMaps
 * accross page ranges, including Feeds of PageMapFeeder's.
 *
 * Note:
 * For the best possible usage it is important that the compare function
 * represents sorting behavior of the backend in the best way possible.
 * The best place to implement this would be the compare-function of the
 * data fields in the data model of the record that are referenced by the used
 * PageMap and the records this instance operates on.
 */
Ext.define('conjoon.cn_core.data.pageMap.IndexLookup', {

    requires : [
        'conjoon.cn_core.data.pageMap.PageMapUtil'
    ],


    /**
     * Base implementation for finding the insert index of a record in the
     * PageMap this IndexLookup is configured with.
     *
     * Updating records:
     * This implementation checks if the current record is already part of the
     * page-map (id-comparison) and skips comparing it with itself if found.
     * When using this method, it is assumed that data belonging
     * to the PageMap has changed and a new position for the record based on the
     * changed value and the sorter of the PageMap's store has to be found.
     *
     * Adding record:
     * If the record currently does not belong to the PageMap, an insert index
     * is looked up. Classes using the return value are advised to properly
     * process it and add the record only if applicable.

     *
     *  @example
     *      // -1 is returned if the insert index is assumed to be
     *      // existing in a page range which is BEFORE all currently
     *      // loaded pages in the PageMap
     *      //
     *      // pageMap : {2 : [3, 4, 5],
     *      //            3 : [6, 7, 8]}
     *      // findInsertIndexInPagesForRecord(2)
     *      // returns -1, since no specific insert index could be found
     *
     *      // 1 is returned if the insert index is assumed to be existing in
     *      // a page range which is existing AFTER all currently loaded
     *      // pages in the PageMap.
     *      //
     *      // pageMap : {2 : [3, 4, 5],
     *      //            3 : [6, 7, 8]}
     *      // findInsertIndexInPagesForRecord(12)
     *      // returns 1, since no specific insert index could be found and
     *      // we assume more pages are existing, and any of the pages
     *      // after page 3 has a possible insert position for the record.
     *      //
     *      //
     *      //
     *      // pageMap : {2 : [3, 4, 5],
     *      //            4 : [9, 10, 11]}
     *      // findInsertIndexInPagesForRecord(7)
     *      // returns 0, since no concrete insert index was found and the
     *      // position is assumed to be existing somewhere in between loaded
     *      // pages
     *
     * @param record
     * @param {conjoon.cn_core.data.pageMap.PageMapFeeder} pageMapFeeder
     *
     * @return {Mixed} A number if no concrete assumption about the insert index
     * can be made (-1 insert somewhere before available PageRanges, 1 somewhere
     * after, 0 somewhere inbetween), or an array containing page/index-position
     * of the record. This implementation will return min/max bounds if the record
     * can be inserted at the beginning or the very end of the PageRanges, and the
     * available PageRange represents the start/end of the available data.
     * Feed indexes will only be considered if the record could fit in a current
     * range of records in a feed. If the record's position would be at the end
     * or beginning of a Feed, -1 or 1 wil be returned. If there is no data in
     * the PageMap, 1 will be returned. Calling APIs are advised to check for
     * PageMap data and add data accordingly.
     *
     *      *  @example
     *      // pageMap : {2    : [3, 4, 5],
     *      //           (3:2 ): [6, 7, 8]}
     *      // findInsertIndexInPagesForRecord(5.5)
     *      // returns 0

     *      // pageMap : {(1 : 2) : [   4, 5],
     *      //            2       : [6, 7, 8]}
     *      // findInsertIndexInPagesForRecord(3)
     *      // returns -1
     *      //
     *      //
     *      // pageMap : {(1   : [3, 4, 5],
     *      //            (2:1) : [6, 7, 8]}
     *      // findInsertIndexInPagesForRecord(9)
     *      // returns 1

     *
     * @throws if more than one sorter was configured
     */
    findInsertIndex : function(record, pageMapFeeder) {

        const me        = this,
            pageMap     = pageMapFeeder.getPageMap(),
            PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
            sorters     = pageMap.getStore().getSorters(),
            ranges      = PageMapUtil.getAvailableRanges(pageMapFeeder),
            lastPage    = PageMapUtil.getLastPossiblePageNumber(pageMap);

        let range, cmpFunc, property, dir, index, ignoreId, first, last,
            previousIndex, recordPosition;

        if (sorters.length != 1) {
            Ext.raise({
                msg     : 'there must be one sorter configured for the PageMap\'s store',
                sorters : sorters
            });
        }

        // no ranges -> no data.
        if (!ranges.length) {
            return 1;
        }

        property = sorters.getAt(0).getProperty();
        dir      = sorters.getAt(0).getDirection();

        if (!record.getField(property)) {
            Ext.raise({
                msg      : "Unexpected missing field definition: \""+property+"\"",
                property : property
            });
        }

        cmpFunc = record.getField(property).compare;

        recordPosition = PageMapUtil.findRecord(record, pageMapFeeder);
        ignoreId       = recordPosition
                         ? record.getId()
                         : undefined;


        for (var i = 0, len = ranges.length; i < len; i++) {
            range = ranges[i];

            first = range.getFirst();
            last  = range.getLast();

            // returns -1, 0 or 1
            index = me.scanRangeForIndex(
                first, last, record.get(property),
                property, dir, cmpFunc, ignoreId,
                pageMapFeeder, recordPosition
            );

            if (Ext.isArray(index)) {
                return index;
            }

            if (index === -1) {
                if (first === 1) {
                    let feed = pageMapFeeder.getFeedAt(first);
                    return feed
                           ? - 1
                           : [1, 0];
                }

                if (previousIndex === 1) {
                    return 0;
                }
            }

            if (index === 1) {

                if (last === lastPage) {
                    feed = pageMapFeeder.getFeedAt(last);

                    // check if we can add to a feed, but only if ignoreId is
                    // undefined, which means the lookup is not part of an
                    // update-lookup (data is shifted due to remove record first,
                    // then a new position can be computed without having to consider
                    // the existing record's id
                    if (ignoreId === undefined) {
                        if ((feed && feed.getFreeSpace() === 0) ||
                            (pageMap.map[last] && pageMap.map[last].value.length === pageMap.getPageSize())) {
                            return [last + 1, 0];
                        }
                    }

                    if ((feed && feed.getFreeSpace() > 0) ||
                        (pageMap.map[last] && pageMap.map[last].value.length < pageMap.getPageSize())) {
                        return [
                            last,
                            feed ? feed.getSize() - feed.getFreeSpace()
                                : pageMap.map[last].value.length
                        ];
                    }


                }
            }

            previousIndex = index;
        }

        return index;
    },


    /**
     * Returns -1 if the record is assumed to be inserted somewhere before start,
     * 1 if the record is assumed to be inserted somewhere after end, otherwise
     * an array containing the page of the insert position as the first index,
     * and the index of the insert position as the second index.
     *
     *   pageMap : {2 : [3, 4, 5],
     *             3 : [6, 7, 8]}
     *
     *   scanRangeForIndex(2, 3, 1, 'fieldname',   'ASC', fn) // returns -1
     *   scanRangeForIndex(2, 3, 9, 'fieldname',   'ASC', fn) // returns 1
     *   scanRangeForIndex(2, 3, 6.5, 'fieldname', 'ASC', fn) // returns [3, 1]
     *
     * @param {Number} start
     * @param {Number} end
     * @param {Mixed} value
     * @param {String} property
     * @param {String} direction
     * @param {Function} cmpFunc
     * @param {String} ignoreId the id of the record to ignore, if any. This is
     * useful when the compared record is already part of the PageMap and needs
     * to be moved to another position due to changes to some of its data
     * @param {conjoon.cn_core.data.pageMap.PageMapFeeder} pageMapFeeder
     * @param {conjoon.cn_core.data.pageMap.RecordPosition} recordPosition if available, the position of the
     * existing record (see ignoreId) that will be used for comparing neighbour records before determining
     * if moving a record should happen (which must not necessarily happen if two sibling records
     * share the same value)
     *
     * @returns {Mixed}
     *
     * @private
     *
     * @throws if start or end or anything in between is not available as a page
     * in the queried PageMap
     */
    scanRangeForIndex : function(start, end, value, property, direction, cmpFunc, ignoreId, pageMapFeeder, recordPosition) {

        const me  = this,
              map = pageMapFeeder.getPageMap().map,
              PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
              RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition;

        let pageIterate, cmpRecord, cmp,
            targetPosition, neighbour;

        for (var i = start; i <= end; i++) {
            if (!map.hasOwnProperty(i) && !pageMapFeeder.getFeedAt(i)) {
                Ext.raise({
                    msg  : 'page not available in PageMap and not available as Feed',
                    page : i,
                    map  : map
                })
            }
        }

        for (var i = start; i <= end; i++) {

            let feed    = pageMapFeeder.getFeedAt(i),
                lena    = feed ? feed.getSize() : map[i].value.length,
                hasNext = feed && feed.getNext();

            pageIterate = i;

            for (var a = 0; a < lena; a++) {

                cmpRecord = feed ? feed.getAt(a) : map[i].value[a];

                if (ignoreId !== undefined && cmpRecord && ignoreId === cmpRecord.getId() ||
                    // not the complete feed might be set
                    (feed && cmpRecord === undefined)) {
                    continue;
                }

                cmp = cmpFunc.apply(null, [value, cmpRecord.get(property)]);

                switch (true) {

                    case (cmp === 0):
                        // if we are looking for an index and compare tells us that the source
                        // value is treated equal with the target value, we will check if
                        // the NEXT neighbour (left or right, depending on the computed target position)
                        // is equal to the value of the source record.
                        // since we assume that the data we are browing is already ordered,
                        // we then assume that we do not need to move the record to a new
                        // position, since moving it would not actually change the
                        // requested order of values.

                        //  0:  1 (u)  ->  2       2 (u)
                        //  1:  2 (v)          =>  2 (v)
                        //  2:  3 (w)              3 (w)
                        //
                        // without this check, we would unneccessary change the order
                        // to v, u, w
                        //
                        // the same check applies for DESCENDING order
                        if (recordPosition) {
                            targetPosition = RecordPosition.create(pageIterate, a);

                            if (targetPosition.lessThan(recordPosition)) {
                                neighbour = PageMapUtil.getNeighbour(
                                    RecordPosition.create(
                                        recordPosition.getPage(), recordPosition.getIndex()),
                                    pageMapFeeder, true
                                );
                            } else if (targetPosition.greaterThan(recordPosition)) {
                                neighbour = PageMapUtil.getNeighbour(
                                    RecordPosition.create(
                                        recordPosition.getPage(), recordPosition.getIndex()),
                                    pageMapFeeder, false
                                );
                            }

                            if (neighbour && cmpFunc.apply(null, [value, neighbour.get(property)]) === 0) {
                                return [
                                    recordPosition.getPage(),
                                    recordPosition.getIndex()];
                            }
                        }

                        return [pageIterate, a];
                        break;

                    case (direction === 'ASC' && cmp === -1):

                        if (a === 0 ||
                            // it is an left hand feed with a
                            // next page, and the  value is less than the
                            // first found index
                            // also, return -1 if we have no place in the feed
                            (hasNext && feed.getFreeSpace() === a)
                        ) {
                            return -1;
                        }

                        // next always grows to left!
                        return [pageIterate, a - (hasNext ? 1 : 0)];
                        break;

                    case (direction === 'DESC' && cmp === 1):
                        if (a === 0 && pageIterate === start ||
                            (hasNext && feed.getFreeSpace() === a)) {
                            return -1;
                        }
                        return [pageIterate, a];
                        break;
                }

            }
        }

        return 1;
    }

});