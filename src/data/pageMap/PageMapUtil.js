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
 *
 */
Ext.define('conjoon.cn_core.data.pageMap.PageMapUtil', {

    singleton : true,

    requires : [
        'conjoon.cn_core.Util',
        'conjoon.cn_core.data.pageMap.RecordPosition',
        'conjoon.cn_core.data.pageMap.PageRange'
    ],


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

        var me = this;

        if (!(position instanceof conjoon.cn_core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg      : '\'position\' must be an instance of conjoon.cn_core.data.pageMap.RecordPosition',
                position : position
            });
        }

        if (!(pageMap instanceof Ext.data.PageMap)) {
            Ext.raise({
                msg     : '\'pageMap\' must be an instance of Ext.data.PageMap',
                pageMap : pageMap
            });
        }

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
     * Data will be shifted down across the pages in the range.
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
     * are not within the same PageRange.
     */
    moveRecord : function(from, to, pageMap) {

        var me = this,
            fromRecord,
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

        if (!(pageMap instanceof Ext.data.PageMap)) {
            Ext.raise({
                msg     : '\'pageMap\' must be an instance of Ext.data.PageMap',
                pageMap : pageMap
            });
        }

        // if from and to are equal we do no further checks and return true
        if (from.equalTo(to)) {
            return true;
        }

        fromRecord = me.getRecordAt(from, pageMap);
        toRecord   = me.getRecordAt(to, pageMap);
        fromRange  = fromRecord ? me.getPageRangeForRecord(fromRecord, pageMap) : null;
        toRange    = toRecord   ? me.getPageRangeForRecord(toRecord, pageMap) : null;

        if (!fromRange || !toRange) {
            return false;
        }

        if (!toRange.equalTo(fromRange)) {
            return false;
        }

        map      = pageMap.map;
        toPage   = to.getPage();
        fromPage = from.getPage();


        map[fromPage].value.splice(from.getIndex(), 1);

        if (toPage === fromPage) {
            // same page
            map[toPage].value.splice(
                from.getIndex() > to.getIndex()
                ? to.getIndex()
                : to.getIndex() - 1,
                0, fromRecord
            );
            return true;
        }

        map[toPage].value.splice(to.getIndex(), 0, fromRecord);

        if (toPage < fromPage) {
            for (var i = toPage; i < fromPage; i++) {
                map[i + 1].value.unshift(map[i].value.pop());
            }

            return true;
        } else { // toPage > fromPage
            for (var i = toPage; i > fromPage; i--) {
                map[i - 1].value.push(map[i].value.shift());
            }
            return true;
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

        var map, page, index;

        if (!(position instanceof conjoon.cn_core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg      : '\'position\' must be an instance of conjoon.cn_core.data.pageMap.RecordPosition',
                position : position
            })
        }

        if (!(pageMap instanceof Ext.data.PageMap)) {
            Ext.raise({
                msg     : '\'pageMap\' must be an instance of Ext.data.PageMap',
                pageMap : pageMap
            })
        }

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

        var page, pages;

        if (!(record instanceof Ext.data.Model)) {
            Ext.raise({
                msg    : '\'record\' must be an instance of Ext.data.Model',
                record : record
            })
        }

        if (!(pageMap instanceof Ext.data.PageMap)) {
            Ext.raise({
                msg    : '\'pageMap\' must be an instance of Ext.data.PageMap',
                record : record
            })
        }

        if (pageMap.indexOf(record) == -1) {
            Ext.raise({
                msg     : '\'record\' seems not to be a member of \'pageMap\'',
                record  : record,
                pageMap : pageMap
            })
        }

        page  = pageMap.getPageFromRecordIndex(pageMap.indexOf(record));
        pages = [];

        for (var i in pageMap.map) {
            pages.push(i);
        }

        return Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
            pages : conjoon.cn_core.Util.listNeighbours(pages, page)
        })
    },


    findInsertIndexInPageRangeForRecord : function(record, pageRange) {
        return this.getPageMapSorter().findInsertIndexInPageRangeForRecord(record, pageRange, me.getPageMap());
    },


    moveRecordInPageRange : function() {

        var me         = this,
            store      = me.grid.getStore(),
            data       = me.getPageMap(),
            orgIndex   = data.indexOf(record) % data.getPageSize(),
            index      = me.findInsertIndexInPageRangeForRecord(record, startPage, endPage),
            storeIndex = 0,
            page, pos, values, tmp;


        if (index === null) {
            return null;
        }

        page   = index[0];
        pos    = index[1];
        values = data.map[page].value;

        // swap
        tmp = values.splice(orgIndex, 1);
        values.splice(pos, 0, tmp[0]);


        for (var startIdx in data.map) {
            // Maintain the indexMap so that we can implement indexOf(record)
            for (var i = 0, len = data.map[startIdx].value.length; i < len; i++) {
                data.indexMap[data.map[startIdx].value[i].internalId] = storeIndex++;
            }
        }

        console.log(data.map);
        console.log(data.indexMap);

        return record;
    }


});