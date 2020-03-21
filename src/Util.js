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
 * Utility class.
 */
Ext.define("coon.core.Util", {


    singleton : true,

    /**
     * Splits the specified string by looking for "." as separators and returns
     * undefined if the evaluated property is not available, otherwise the value
     * of the property.
     *
     *      @example
     *      var foo = { 1 : { 2 : { 3 : { 4 : 'bar'}}}};
     *
     *      coon.core.Util.unchain('1.2.3.4', foo); // 'bar'
     *
     * @param {String} chain The object chain to resolve
     * @param {Object=Window} scope The scope where the chain is assumed. Defaults
     * to Window
     *
     * @return {Mixed} undefined if either scope was not found or the chain could
     * not be resolved, otherwise the value found in [scope][chain]
     */
    unchain : function (chain, scope) {

        if (arguments.length === 1) {
            scope = window;
        }

        var parts = chain.split("."),
            obj   = scope;

        while (parts.length) {
            if (!obj) {
                return undefined;
            }

            obj = obj[parts.shift()];
        }

        return obj;
    },


    /**
     * Expects a numeric array and returns an array where the entries are subsequent
     * neighbours of target, sorted from lowest to highest, unique values.
     * The method will try to parse the values to numeric integer values
     *
     *      @example
     *      var list   = ['4', 5, '1', '3', 6, '8'];
     *      var target = 5;
     *
     *      coon.core.Util.listNeighbours(list, target); // [3, 4, 5, 6]
     *
     * @param {Array} list The list of values to return the neighbours from
     * @param {Number} target The initial value to look up its neighbours for
     *
     * @return {Array} The ordered, unique list of neighbours for target
     */
    listNeighbours : function (list, target) {

        var pages = [],
            range = [],
            pind, i, len;

        // parse, filter, sort
        pages = list.map(function (v){return parseInt(v, 10);});
        pages = pages.filter(function (value, index, self) {
            return self.indexOf(value, 0) === index;
        });
        pages.sort(function (a, b){return a-b;});


        pind = pages.indexOf(parseInt(target, 10));

        // fill left
        for (i = pind - 1; i >= 0; i--) {
            if (pages[i] === pages[i + 1] - 1) {
                range.unshift(pages[i]);
            } else {
                break;
            }
        }

        // fill center
        range.push(pages[pind]);

        // fill right
        for (i = pind + 1, len = pages.length; i < len; i++) {
            if (pages[i] === pages[i - 1] + 1) {
                range.push(pages[i]);
            } else {
                break;
            }
        }
        return range;

    },


    /**
     * Expects a numeric array and returns an array where the entries are itself
     * arrays representing possible groups of subsequent indices, ordered from
     * lowest to highest. Dublicate items will be removed.
     *
     *      var list   = ['4', 5, '1', '3', 6, '8'];
     *      coon.core.Util.groupIndices(list); // [[1], [3, 4, 5], [6]]
     *
     *      var list   = ['1', 2, '3'];
     *      coon.core.Util.groupIndices(list); // [[1, 2, 3]]
     *
     * @param {Array} list The list of values to return the grouped indices from
     *
     * @return {Array} The ordered, grouped list of indices
     *
     * @throws if list is not an array
     */
    groupIndices : function (list) {

        var groups = [],
            pages;

        if (!Ext.isArray(list)) {
            Ext.raise({
                msg  : "'list' must be an array",
                list : list
            });
        }

        // parse, filter, sort
        pages = list.map(function (v){return parseInt(v, 10);});
        pages = pages.filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });
        pages.sort(function (a, b){return a-b;});

        pages.reduce(function (previousValue, currentValue, index, array){
            if (currentValue > previousValue + 1) {
                groups.push([]);
            }
            groups[groups.length - 1].push(currentValue);
            return currentValue;
        }, -1);

        return groups;
    },


    /**
     * Creates the range for the specified start and end.
     *
     * @example
     *      createRange(3, 4) // [3, 4, 5]
     *
     *      createRange(5, 5) // [5]
     *
     *
     * @param {Number} start
     * @param {Number} end
     *
     * @return {Array}
     *
     * @throws if start is not a number or less than 1, or if end is not a number
     * or if end is less than start
     */
    createRange : function (start, end) {

        var ret;

        start = parseInt(start, 10);
        end   = parseInt(end, 10);

        if (!Ext.isNumber(start)) {
            Ext.raise({
                msg   : "'start' must be a number",
                start : start
            });
        }

        if (!Ext.isNumber(end) || end < start) {
            Ext.raise({
                msg   : "'end' must be a number equal to or greater than start",
                end   : end,
                start : start
            });
        }

        ret = new Array(Math.abs(start - end) + 1);
        // needs to be filled so we can apply map to it
        ret.fill(undefined);

        return ret.map(function () {
            return start++;
        });

    }


});
