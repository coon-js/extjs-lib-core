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
    }

});
