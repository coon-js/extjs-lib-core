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
 * accross page ranges.
 *
 *
 */
Ext.define('conjoon.cn_core.data.pageMap.IndexLookup', {

    requires : [
        'conjoon.cn_core.data.pageMap.PageMapUtil'
    ],

    config : {

        /**
         * @cfg {Ext.data.PageMap} pageMap
         * The PageMap this sorter operates with.
         */
        pageMap : null

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

        if (!cfg.hasOwnProperty('pageMap')) {
            Ext.raise({
                msg : '\'pageMap\' is required for this class',
                cfg : cfg
            });
        }

        this.initConfig(cfg);

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




    cmpFuncHelper : function(val1, val2) {

        return val1 < val2
            ? -1
            : val1 === val2
            ? 0
            : 1;
    },


    /**
     * Same values: Presedence is given the newly inserted record.
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
     *
     *
     * @param record
     * @returns -1 if the record should be inserted in a a PageRange which
     * is not currently loaded in he PageMap, and which is assumed to exist "before"
     * all available PageRanges
     */
    findInsertIndex : function(record) {

        var me             = this,
            PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil,
            pageMap        = me.getPageMap(),
            map            = pageMap.map,
        // guaranteed to be only one sorter
            sorters        = pageMap.getStore().getSorters(),
            target         = null,
            isBeginning    = PageMapUtil.isFirstPageLoaded(pageMap),
            lastPageLoaded = PageMapUtil.isLastPageLoaded(pageMap),
            lastPage       = PageMapUtil.getLastPossiblePageNumber(pageMap),
            pageIterate,
            values, property,
            direction, cmpRecord, cmp, cmpFunc,
            firstPage;

        // iterate through maps
        // insert at map n
        // shift records through pages
        // update indexMap
        if (!sorters || sorters.length != 1) {
            return [1, 0];
        }

        property  = sorters.getAt(0).getProperty();
        direction = sorters.getAt(0).getDirection();

        cmpFunc = record.getField(property)
            ? record.getField(property).compare
            : me.cmpFuncHelper;

        for (var i in map) {

            if (!map.hasOwnProperty(i)) {
                continue;
            }

            pageIterate = parseInt(i, 10) ;
            firstPage   = firstPage ? firstPage : pageIterate;

            values = map[i].value;

            for (var a = 0, lena = values.length; a < lena; a++) {
                cmpRecord = values[a];

                cmp = cmpFunc(record.get(property), cmpRecord.get(property));

                // -1 less, 0 equal, 1 greater
                switch (direction) {
                    case 'ASC':
                        if (cmp === 0) {
                            return [pageIterate, a];
                        } else if (cmp === -1) {

                            if (a === 0) {
                                if (firstPage === 1 && pageIterate >= 1) {
                                    return [pageIterate, a];
                                } else {
                                    return null;
                                }
                            }

                            return [pageIterate, a];
                        }
                        break;
                    default:

                        if (cmp === 0) {
                            return [pageIterate, a];
                        } else if (cmp === 1) {
                            if (firstPage !== 1 &&  !map.hasOwnProperty(pageIterate - 1)) {
                                return -1;
                            }
                            return [pageIterate, a];
                        } else if (cmp === -1 && a === lena - 1 && lastPage === pageIterate) {
                            // if we have reached the very end, we use the
                            // last possible index as the isert index
                            return [pageIterate, a];
                        }
                        break;
                }
            }
        }

        return 1;

    }


});