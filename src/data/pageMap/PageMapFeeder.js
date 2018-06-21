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
 *
 *
 */
Ext.define('conjoon.cn_core.data.pageMap.PageMapFeeder', {

    requires : [
        'conjoon.cn_core.data.pageMap.PageRange'
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
     * Tries to look up the feeder index for the specified range.
     * It is possible that this method returns the index of a page which also
     * exist in a PageMap. In this case, an immediate swapping from the source
     * page to the feeder should be triggered by the API.
     * This method also considers that the PageRange specified in range
     * is not necessarily complete, and checks the right-hand side for further
     * neighbour pages.
     *
     * @param {conjoon.cn_core.data.pageMap.PageRange} range
     *
     * @return {Number} The index of the feeder to use, which might exist or
     * might not exist. It is safe to use the feeder at the index or to
     * create it if it does not already exist
     *
     * @private
     *
     * @throws if range is not an instance of conjoon.cn_core.data.pageMap.PageRange
     */
    findFeederIndexForRange : function(range) {

        var me      = this,
            pageMap = me.getPageMap(),
            map     = pageMap.map,
            start, end ,ind;

        if (!(range instanceof conjoon.cn_core.data.pageMap.PageRange)) {
            Ext.raise({
                msg     : '\'range\' must be an instance of conjoon.cn_core.data.pageMap.PageRange',
                range : range
            });
        }

        start = range.getFirst();
        end   = range.getLast();
        ind   = end;

        while (map[end]) {
            end++;
        }

        for (var i = end; i >= start; i--) {
            if (me.canUseFeederAt(i)) {
                return i;
            }
        }

        return -1;
    },


    /**
     * Returns true if the feeder can be used or if can be created safely, i.e.
     * if it is not part of the pending collector already. It will also return
     * true, if the feeder is already existing (NOT marked for recycling). It
     * will return false if the pageMap.map for the page is not existing, after
     * the previous tests did not satisfy their codnitions.
     *
     * @param {Number} page
     *
     * @return {Boolean}
     *
     * @private
     *
     * @throws if page is not a number or less than 1
     */
    canUseFeederAt : function(page) {

        var me          = this,
            PageMapUtil = conjoon.cn_core.data.pageMap.PageMapUtil,
            page        = parseInt(page, 10),
            pageMap     = me.getPageMap();

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
     */
    isFeedMarkedForRecycling : function(page) {

        var me = this;

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

        return true;
    }





});