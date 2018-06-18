/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * lib-cn_core
 * Copyright (C) 2017 Thorsten Suckow-Homberg/conjoon.org
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
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Utility class.
 */
Ext.define('conjoon.cn_core.Util', {


    singleton : true,

    /**
     * Splits the specified string by looking for "." as separators and returns
     * undefined if the evaluated property is not available, otherwise the value
     * of the property.
     *
     *      @example
     *      var foo = { 1 : { 2 : { 3 : { 4 : 'bar'}}}};
     *
     *      conjoon.cn_core.Util.unchain('1.2.3.4', foo); // 'bar'
     *
     * @param {String} chain The object chain to resolve
     * @param {Object=Window} scope The scope where the chain is assumed. Defaults
     * to Window
     *
     * @return {Mixed} undefined if either scope was not found or the chain could
     * not be resolved, otherwise the value found in [scope][chain]
     */
    unchain : function(chain, scope) {

        if (arguments.length === 1) {
            scope = window;
        }

        var parts = chain.split('.'),
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
     *      conjoon.cn_core.Util.listNeighbours(list, target); // [3, 4, 5, 6]
     *
     * @param {Array} list The list of values to return the neighbours from
     * @param {Number} target The initial value to look up its neighbours for
     *
     * @return {Array} The ordered, unique list of neighbours for target
     */
    listNeighbours : function(list, target) {

        var pages = [],
            range = [],
            pind, i, len;

        // parse, filter, sort
        pages = list.map(function(v){return parseInt(v, 10)});
        pages = pages.filter(function (value, index, self) {
            return self.indexOf(value, 0) === index;
        });
        pages.sort(function(a, b){return a-b});



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
     *      conjoon.cn_core.Util.listNeighbours(list); // [[1], [3, 4, 5], [6]]
     *
     *      var list   = ['1', 2, '3'];
     *      conjoon.cn_core.Util.listNeighbours(list); // [[1, 2, 3]]
     *
     * @param {Array} list The list of values to return the grouped indices from
     *
     * @return {Array} The ordered, grouped list of indices
     */
    groupIndices : function(list) {

        var groups = [],
            pages;

        // parse, filter, sort
        pages = list.map(function(v){return parseInt(v, 10)});
        pages = pages.filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });
        pages.sort(function(a, b){return a-b});

        pages.reduce(function(previousValue, currentValue, index, array){
            if (currentValue > previousValue + 1) {
                groups.push([]);
            }
            groups[groups.length - 1].push(currentValue);
            return currentValue;
        }, -1);

        return groups;
    }


});
