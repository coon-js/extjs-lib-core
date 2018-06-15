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
 * A value object encapsulating position information of a record in a {Ext.data.PageMap},
 * namely providing information about the page and the index where it can be found.
 *
 *      @example
 *          // throws, since the passed page-argument is not a number
 *          Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
 *              page  : 'a',
 *              index : 2
 *          });
 *
 *          // throws, since the passed index-argument is not a number
 *          Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
 *              page  : 5,
 *              index : 'e'
 *          });
 *
 *          // throws, since the page-argument is missing
 *          Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
 *              page  : 5
 *          });
 *
 *          // throws, since the index-argument is missing
 *          Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
 *              page  : 5
 *          });
 *
 *          // throws, since page must not be less than 1
 *          Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
 *              pages : 0,
 *              index : 4
 *          });
 *
 *          // throws, since index must not be less than 0
 *          Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
 *              pages : 1,
 *              index : -1
 *          });
 *
 *          var pos = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
 *              page  : 4,
 *              index : 2
 *          });
 *          pos.getPage(); // 4
 *          pos.getIndex(); // 2
 *
 *          // throws, page was already set
 *          range.setPage(3);
 *          // throws, index was already set
 *          range.setIndex(4);

 *
 */
Ext.define('conjoon.cn_core.data.pageMap.RecordPosition', {


    config : {
        page  : undefined,
        index : undefined
    },

    /**
     *
     * @param {Object} cfg
     *
     * @throws if either cfg.page or cfg.index is missing
     */
    constructor : function(cfg) {

        if (!cfg || !cfg.hasOwnProperty('page') ||
            !cfg.hasOwnProperty('index')) {
            Ext.raise({
                msg : '\'cfg\' needs both \'page\'- and  \'index\'-property',
                cfg : cfg
            })
        }

        this.initConfig(cfg);
    },


    /**
     * Sets the page property of this object to the specified argument.
     *
     * @param {Number} page
     *
     * @returns {Number}
     *
     * @throws
     *  - if page was already set
     *  - if page is not a number
     *  - if it is less than 1
     *
     */
    applyPage : function(page) {

        var me = this;

        if (me.getPage() !== undefined) {
            Ext.raise({
                msg  : '\'page\' was already defined',
                page : me.getPage()
            })
        }

        page = parseInt(page, 10);

        if (!Ext.isNumber(page)) {
            Ext.raise({
                msg  : '\'page\' must be a number',
                page : page
            })
        }

        if (page < 1) {
            Ext.raise({
                msg  : 'a page\'s value must not be less than 1',
                page : page
            })
        }

        return page;
    },


    /**
     * Sets the index property of this object to the specified argument.
     *
     * @param {Number} index
     *
     * @returns {Number}
     *
     * @throws
     *  - if index was already set
     *  - if index is not a number
     *  - if it is less than 0
     *
     */
    applyIndex : function(index) {

        var me = this;

        if (me.getIndex() !== undefined) {
            Ext.raise({
                msg   : '\'index\' was already defined',
                index : me.getIndex()
            })
        }

        index = parseInt(index, 10);

        if (!Ext.isNumber(index)) {
            Ext.raise({
                msg   : '\'index\' must be a number',
                index : index
            })
        }

        if (index < 0) {
            Ext.raise({
                msg   : 'index value must not be less than 0',
                index : index
            })
        }

        return index;
    },


    /**
     * Checks if target's position info are the same as from "this" RecordPosition.
     *
     * @param {conjoon.cn_core.data.pageMap.RecordPosition} target
     *
     * @return {Boolean} true if target represents the same Positions as "this",
     * otherwise false
     *
     * @throws if target is not an instance of {conjoon.cn_core.data.pageMap.RecordPosition}
     */
    equalTo : function(target) {

        var me = this,
            tF, tL;

        if (!(target instanceof conjoon.cn_core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg    : '\'target\' must be an instance of conjoon.cn_core.data.pageMap.RecordPosition',
                target : target
            })
        }

        return me === target ||
            (me.getPage() === target.getPage() && me.getIndex() === target.getIndex());

    }

});