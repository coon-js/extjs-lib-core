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
 * Base implementation for a strategy for looking up indices in PageMaps
 * accross page ranges, including Feeds of PagemapFeeder's.
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
        'conjoon.cn_core.data.pageMap.PageMapUtil',
        'conjoon.cn_core.data.pageMap.PageMapFeeder'
    ],

    config : {

        /**
         * @cfg {conjoon.cn_core.data.pageMap.PageMapFeeder} pageMapFeeder
         * The PageMap Feeder this lookup operates with.
         */
        pageMapFeeder : null,

        /**
         * @cfg {Function} cmpFunc The compare-function that will be used
         * for comparing record-values when looking for an insert index.
         * This method will be used if no compare-function is defined for the
         * field of the value that's being compared.
         * The compare function takes three arguments:
         * @param {Mixed} val1 the value of the current record being iterated
         * through in the PageNMap
         * @param {Mixed} val2 the value of the record for which an index is looked
         * up
         * @param {String} The name of the field that is compared
         */
        compareFunction : function (val1, val2, field) {
            return val1 < val2
                   ? -1
                   : val1 === val2
                     ? 0
                     : 1;
        }
    },


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

        cfg = cfg || {};

        if (!cfg.hasOwnProperty('pageMapFeeder')) {
            Ext.raise({
                msg : '\'pageMapFeeder\' is required for this class',
                cfg : cfg
            });
        }

        this.initConfig(cfg);

    },


    /**
     * Applies the pageMapFeeder to this instance
     *
     * @param {conjoon.cn_core.data.pageMap.PageMapFeeder} ageMapFeeder
     *
     * @throws if pageMapFeeder was already set, or if pageMapFeeder is not an instance of
     * {conjoon.cn_core.data.pageMap.PageMapFeeder}
     */
    applyPageMapFeeder : function(pageMapFeeder) {

        const me = this;

        if (me.getPageMapFeeder()) {
            Ext.raise({
                msg           : '\'pageMapFeeder\' is already set',
                pageMapFeeder : me.getPageMapFeeder()
            });
        }

        if (!(pageMapFeeder instanceof conjoon.cn_core.data.pageMap.PageMapFeeder)) {
            Ext.raise({
                msg           : '\'pageMapFeeder\' must be an instance of conjoon.cn_core.data.pageMap.PageMapFeeder',
                pageMapFeeder : pageMapFeeder
            });
        }

        return pageMapFeeder;
    },


    /**
     * The compare function that should be used for comparing values if no
     * compare function is defined for the record-field that is being compared.
     *
     * @param {Function} fn
     *
     * @throws if fn is not a function, or if the function was already set for
     * this instance
     */
    applyCompareFunction : function(fn) {

        var me = this;

        if (!Ext.isFunction(fn)) {
            Ext.raise({
                msg : 'the argument is not a function',
                fn  : fn
            });
        }

        if (me.getCompareFunction()) {
            Ext.raise({
                msg             : '\'compareFunction\' was already set',
                compareFunction : me.getCompareFunction()
            });
        }

        return fn;
    },


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
     * This implementation will use the compare fuction configured with this
     * instance. Presedence will be given to compare-function defined directly
     * in the data model of the records.
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
     *
     * @return {Mixed} A number if no concrete assumption about the insert index
     * can be made (-1 insert somewhere before available PageRanges, 1 somewhere
     * after, 0 somewhere inbetween), or an array containing page/index-position
     * of the record. This implementation will return min/max bounds if the record
     * can be inserted at the beginning or the very end of the PageRanges, and the
     * available PageRange represents the start/end of the available data.
     *
     *
     * @throws if more than one sorter was configured
     */
    findInsertIndex : function(record) {

        var me            = this,
            pageMap       = me.getPageMap(),
            pageMapFeeder = me.getPageMapFeeder(),
            PageMapUtil   = conjoon.cn_core.data.pageMap.PageMapUtil,
            sorters       = pageMap.getStore().getSorters(),
            ranges        = PageMapUtil.getAvailableRanges(pageMapFeeder),
            lastPage      = PageMapUtil.getLastPossiblePageNumber(pageMap),
            range, cmpFunc, property, dir, index, ignoreId, first, last,
            previousIndex;

        if (sorters.length > 1) {
            Ext.raise({
                msg     : 'there may only be one sorter currently configured for the PageMap\'s store',
                sorters : sorters
            });
        }

        property = sorters.getAt(0).getProperty();
        dir      = sorters.getAt(0).getDirection();

        cmpFunc = record.getField(property)
                  ? record.getField(property).compare
                  : me.getCompareFunction();

        ignoreId = pageMap.indexOf(record) >= 0 ||
                   pageMapFeeder.findInFeeds(record) !== null
                   ? record.getId()
                   : undefined;


        for (var i = 0, len = ranges.length; i < len; i++) {
            range = ranges[i];

            first = range.getFirst();
            last  = range.getLast();

            // returns -1, 0 or 1
            index = me.scanRangeForIndex(
                first, last, record.get(property),
                property, dir, cmpFunc, ignoreId
            );

            if (Ext.isArray(index)) {
                return index;
            }

            if (index === -1) {
                if (first === 1) {
                    return [1, 0];
                }

                if (previousIndex === 1) {
                    return 0;
                }
            }

            if (index === 1) {
                if (last === lastPage) {
                    return [lastPage, pageMap.getPageSize() - 1];
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
     *
     * @returns {Mixed}
     *
     * @private
     *
     * @throws if start or end or anything in between is not available as a page
     * in the queried PageMap
     */
    scanRangeForIndex : function(start, end, value, property, direction, cmpFunc, ignoreId) {

        var me            = this,
            pageMapFeeder = me.getPageMapFeeder(),
            map           = me.getPageMap().map,
            isOwnCmp      = (cmpFunc === me.getCompareFunction()),
            compareArgs, pageIterate, values, cmpRecord, cmp;

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

                compareArgs =  isOwnCmp
                               ? [value, cmpRecord.get(property), property]
                               : [value, cmpRecord.get(property)];

                cmp = cmpFunc.apply(null, compareArgs);

                switch (direction) {
                    // aufsteigend
                    case 'ASC':
                        if (cmp === 0) {
                            return [pageIterate, a];
                        } else if (cmp === -1) {

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
                        }
                        break;
                        // absteigend
                    default:

                        if (cmp === 0) {
                            return [pageIterate, a];
                        } else if (cmp === 1) {
                            if (a === 0 && pageIterate === start ||
                                (hasNext && feed.getFreeSpace() === a)) {
                                return -1;
                            }
                            return [pageIterate, a];
                        }
                        break;
                }
            }
        }

        return 1;
    },


    /**
     * Returns the PageMap the PageMapFeeder of this Lookup is configured with
     * @return {Ext.data.PageMap}
     *
     * @private
     */
    getPageMap : function() {
        const me = this;

        return me.getPageMapFeeder().getPageMap();
    }


});