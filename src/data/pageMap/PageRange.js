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
 * A value object containing a range of ordered, subsequent pages.
 * The data is not mutable after instantiating it.
 *
 *      @example
 *          // throws, since the passed argument is not an ordered list
 *          Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
 *              pages : [1, 2, 5]
 *          });
 *
 *          // throws, since a page range must not start with 0
 *          Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
 *              pages : [0, 1, 2]
 *          });
 *
 *          var range = Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
 *              pages : [3, 4, 5]
 *          });
 *          range.getPages(); // [3, 4, 5]
 *          range.getFirst(); // 3
 *          range.getLast(); // 5
 *          range.getLength(); // 3
 *
 *          // throws, pages was already set
 *          range.setPages([6,7,8]);
 *
 *          var range = Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
 *              pages : [3]
 *          });
 *
 *          range.getFirst(); // 3
 *          range.getLast();  // 3
 *
 */
Ext.define('conjoon.cn_core.data.pageMap.PageRange', {


    requires : [
        'conjoon.cn_core.Util',
        'conjoon.cn_core.data.pageMap.RecordPosition'
    ],


    config : {
        pages : undefined
    },


    statics : {

        /**
         * Tries to cerate a new range based on the information given in data,
         * which is either an array which is assumed to be a sorted list of numbers
         * representing a page range, or an argument list of page ranges in the
         * proper order.
         *
         * @param {Mixed} data
         *
         * @return {conjoon.cn_core.data.pageMap.PageRange}
         *
         * @throws if the arguments could not be processed, or if any exception
         * from the class constructor is thrown.
         */
        create : function(data) {

            if (arguments.length == 1 && !Ext.isArray(arguments[0])) {
                data = [arguments[0]];
            } else if (arguments.length > 1) {
                data = Array.prototype.slice.apply(arguments, [0]);
            }

            if (!Ext.isArray(data)){
                Ext.raise({
                    msg  : 'static method expects an array or arguments ' +
                           'representing a page range',
                    arguments : arguments
                });
            }

            return Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
                pages : data
            });
        },


        /**
         * Creates the range for the specified start and endpage.
         *
         * @example
         *      createFor(3, 4) // [3, 4, 5]
         *
         *
         * @param {Number} start
         * @param {Number} end
         *
         * @return {conjoon.cn_core.data.pageMap.PageRange}
         *
         * @throws any exception thrown by {conjoon.cn_core.Util#createRange}
         * or by this class constructor
         */
        createFor : function(start, end) {
            return Ext.create('conjoon.cn_core.data.pageMap.PageRange', {
                pages : conjoon.cn_core.Util.createRange(start, end)
            });
        }

    },



    /**
     * Creates a new instance of conjoon.cn_core.data.pageMap.PageRange.
     *
     * @param {Object} cfg
     * @param [Array} cfg.pages An array of pages to be represented by this instance
     *
     * @throws if pages is not specified
     */
    constructor : function(cfg) {

        cfg = cfg || {};

        if (!cfg.hasOwnProperty('pages')) {
            Ext.raise({
                msg : '\'pages\' must be specified',
                cfg : cfg
            });
        }

        this.initConfig(cfg);
    },


    /**
     * Sets the pages property of this object to the specified argument.
     *
     * @param {Array} pages
     *
     * @returns {Array}
     *
     * @throws if pages was already set, if pages is not an array or if it is
     * not a sequentially ordered list of numeric values, or if the first page is
     * less than 1
     */
    applyPages : function(pages) {

        var me = this;

        if (me.getPages() !== undefined) {
            Ext.raise({
                msg   : '\'pages\' was already defined',
                pages : me.getPages()
            });
        }

        if (!Ext.isArray(pages)) {
            Ext.raise({
                msg   : '\'pages\' must be an array',
                pages : pages
            });
        }

        pages = pages.map(function(v){
            return parseInt(v, 10);
        });

        if (pages[0] < 1 || isNaN(pages[0])) {
            Ext.raise({
                msg   : 'a page range\'s first page must not be less than 1 ' +
                        'and must be a number',
                pages : pages
            });
        }

        if (pages.length === 1) {
            return pages;
        }

        for (var i = 1, len = pages.length; i < len; i++) {
            if (pages[i] - pages[i - 1] !== 1) {
                Ext.raise({
                    msg   : '\'pages\' was converted to a numeric list but it ' +
                            'seems to be not an ordered list of numeric data',
                    pages : pages
                });
            }
        }


        return pages;
    },

    /**
     * Returns the first page of this PageRange.
     *
     *  @return {Number}
     */
    getFirst : function() {
        return this.getPages()[0];
    },


    /**
     * Returns the last page of this PageRange.
     *
     *  @return {Number}
     */
    getLast : function() {
        return this.getPages()[this.getPages().length - 1];
    },


    /**
     * Returns the number of entries for this PageRange.
     *
     * @return {Number}
     */
    getLength : function() {
        return this.getPages().length;
    },


    /**
     * Checks if target's pages are the same pages from "this" PageRange.
     *
     * @param {conjoon.cn_core.data.pageMap.PageRange} target
     *
     * @return {Boolean} true if target represents the same PageRange as "this",
     * otherwise false
     *
     * @throws if target is not an instance of {conjoon.cn_core.data.pageMap.PageRange}
     */
    equalTo : function(target) {

        var me = this,
            tF, tL;

        if (!(target instanceof conjoon.cn_core.data.pageMap.PageRange)) {
            Ext.raise({
                msg    : '\'target\' must be an instance of conjoon.cn_core.data.pageMap.PageRange',
                target : target
            });
        }

        tF = target.getPages();
        tL = me.getLength();

        return me === target ||
               this.getPages().filter(function(v, index) {
                    return tF[index] && tF[index] === v;
               }).length === tL;

    },


    /**
     * Returns true if this page range contains the specified position, otherwise
     * false.
     * This method will return true if the position's page is part of this page
     * range.
     *
     * @param {conjoon.cn_core.data.pageMap.RecordPosition} position
     *
     * @return {Boolean}
     */
    contains : function(position) {

        const me = this;

        if (!(position instanceof conjoon.cn_core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg      : '\'position\' must be an instance of conjoon.cn_core.data.pageMap.RecordPosition',
                position : position
            });
        }

        return me.toArray().indexOf(position.getPage()) !== -1;

    },


    /**
     * Returns an array representation of this PageRange.
     *
     * @return {Array}
     */
    toArray : function() {

        // 0? see https://jsperf.com/cloning-arrays/3
        return this.getPages().slice(0);

    }


});