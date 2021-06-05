/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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
 * A value object encapsulating position information of a record in a {Ext.data.PageMap},
 * namely providing information about the page and the index where it can be found.
 *
 *      @example
 *          // throws, since the passed page-argument is not a number
 *          Ext.create('coon.core.data.pageMap.RecordPosition', {
 *              page  : 'a',
 *              index : 2
 *          });
 *
 *          // throws, since the passed index-argument is not a number
 *          Ext.create('coon.core.data.pageMap.RecordPosition', {
 *              page  : 5,
 *              index : 'e'
 *          });
 *
 *          // throws, since the page-argument is missing
 *          Ext.create('coon.core.data.pageMap.RecordPosition', {
 *              page  : 5
 *          });
 *
 *          // throws, since the index-argument is missing
 *          Ext.create('coon.core.data.pageMap.RecordPosition', {
 *              page  : 5
 *          });
 *
 *          // throws, since page must not be less than 1
 *          Ext.create('coon.core.data.pageMap.RecordPosition', {
 *              pages : 0,
 *              index : 4
 *          });
 *
 *          // throws, since index must not be less than 0
 *          Ext.create('coon.core.data.pageMap.RecordPosition', {
 *              pages : 1,
 *              index : -1
 *          });
 *
 *          var pos = Ext.create('coon.core.data.pageMap.RecordPosition', {
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
Ext.define("coon.core.data.pageMap.RecordPosition", {


    config: {
        page: undefined,
        index: undefined
    },

    statics: {

        /**
         * Tries to cerate a new position based on the information given in data,
         * which is either an array where the first index is treated as the page,
         * and the second index is treated as the index, or wto arguments, where
         * the first argument represents the page, and teh second the index for
         * which a RecordPosition should be created.
         *
         * @param {Mixed} data
         *
         * @return {coon.core.data.pageMap.RecordPosition}
         *
         * @throws if the arguments could not be processed, or if any exception
         * from the class constructor is thrown.
         */
        create: function (data) {

            if (arguments.length > 1) {
                data = [arguments[0], arguments[1]];
            } else if (!Ext.isArray(data)){
                Ext.raise({
                    msg: "static method expects an array or two arguments " +
                                "representing page and index",
                    arguments: arguments
                });
            }

            return Ext.create("coon.core.data.pageMap.RecordPosition", {
                page: data[0],
                index: data[1]
            });
        }

    },

    /**
     *
     * @param {Object} cfg
     *
     * @throws if either cfg.page or cfg.index is missing
     */
    constructor: function (cfg) {

        if (!cfg || !Object.prototype.hasOwnProperty.call(cfg,"page") ||
            !Object.prototype.hasOwnProperty.call(cfg,"index")) {
            Ext.raise({
                msg: "'cfg' needs both 'page'- and  'index'-property",
                cfg: cfg
            });
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
    applyPage: function (page) {

        var me = this;

        if (me.getPage() !== undefined) {
            Ext.raise({
                msg: "'page' was already defined",
                page: me.getPage()
            });
        }

        page = parseInt(page, 10);

        if (!Ext.isNumber(page)) {
            Ext.raise({
                msg: "'page' must be a number",
                page: page
            });
        }

        if (page < 1) {
            Ext.raise({
                msg: "a page's value must not be less than 1",
                page: page
            });
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
    applyIndex: function (index) {

        var me = this;

        if (me.getIndex() !== undefined) {
            Ext.raise({
                msg: "'index' was already defined",
                index: me.getIndex()
            });
        }

        index = parseInt(index, 10);

        if (!Ext.isNumber(index)) {
            Ext.raise({
                msg: "'index' must be a number",
                index: index
            });
        }

        if (index < 0) {
            Ext.raise({
                msg: "index value must not be less than 0",
                index: index
            });
        }

        return index;
    },


    /**
     * Checks if target's position info are the same as from "this" RecordPosition.
     *
     * @param {coon.core.data.pageMap.RecordPosition} target
     *
     * @return {Boolean} true if target represents the same Positions as "this",
     * otherwise false
     *
     * @throws if target is not an instance of {coon.core.data.pageMap.RecordPosition}
     */
    equalTo: function (target) {

        var me = this;

        if (!(target instanceof coon.core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg: "'target' must be an instance of coon.core.data.pageMap.RecordPosition",
                target: target
            });
        }

        return me === target ||
            (me.getPage() === target.getPage() && me.getIndex() === target.getIndex());

    },


    /**
     * Returns true if the position represented by target is greater than this
     * position.
     *
     * @param {coon.core.data.pageMap.RecordPosition} target
     *
     * @return {Boolean} true if target represents a position greater than this
     * position
     *
     * @throws if target is not an instance of
     * {coon.core.data.pageMap.RecordPosition}
     */
    lessThan: function (target) {

        var me = this;

        if (!(target instanceof coon.core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg: "'target' must be an instance of coon.core.data.pageMap.RecordPosition",
                target: target
            });
        }

        return (me.getPage() < target.getPage() ||
               (me.getPage() === target.getPage() && me.getIndex() < target.getIndex()));

    },


    /**
     * Returns true if the position represented by target is less than this
     * position.
     *
     * @param {coon.core.data.pageMap.RecordPosition} target
     *
     * @return {Boolean} true if target represents a position less than this
     * position
     *
     * @throws if target is not an instance of
     * {coon.core.data.pageMap.RecordPosition}
     */
    greaterThan: function (target) {

        var me = this;

        if (!(target instanceof coon.core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg: "'target' must be an instance of coon.core.data.pageMap.RecordPosition",
                target: target
            });
        }

        return (me.getPage() > target.getPage() ||
            (me.getPage() === target.getPage() && me.getIndex() > target.getIndex()));

    }

});