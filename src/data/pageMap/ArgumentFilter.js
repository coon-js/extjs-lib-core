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
 * Utility mixin to be used for regular argument checks for PageMap related
 * functionality.
 *
 *
 */
Ext.define('conjoon.cn_core.data.pageMap.ArgumentFilter', {


    /**
     * Throws an exception if the passed argument is not a number and less than
     * 1.
     *
     * @param {Mixed} page
     *
     * @return {Number}
     *
     * @throws if the passed argument is not a number and less than
     * 1.
     */
    filterPageValue : function(page) {

        page = parseInt(page, 10);

        if (!Ext.isNumber(page) || page < 1) {
            Ext.raise({
                msg  : '\'page\' must be a number greater than 0',
                page : page
            });
        }

        return page;
    },


    /**
     * Throws an exception if the passed argument is not a number and not equal to
     * 1 or -1.
     *
     * @param {Mixed} direction
     *
     * @return {Number}
     *
     * @throws if the passed argument is not a number and not equal to
     * 1 or -1.
     */
    filterDirectionValue : function(direction) {
        direction = parseInt(direction, 10);

        if (!Ext.isNumber(direction) || (direction !== 1 && direction !== -1)) {
            Ext.raise({
                msg       : '\'direction\' must be -1 or 1',
                direction : direction
            });
        }

        return direction;
    },


    /**
     * Throws an exception if the passed argument is not an instance of
     * {Ext.data.PageMap}
     *
     * @param {Mixed} pageMap
     *
     * @return {Ext.data.PageMap}
     *
     * @throws if if the passed argument is not an instance of
     * {Ext.data.PageMap}
     */
    filterPageMapValue : function(pageMap) {

        if (!(pageMap instanceof Ext.data.PageMap)) {
            Ext.raise({
                msg     : '\'pageMap\' must be an instance of Ext.data.PageMap',
                pageMap : pageMap
            });
        }

        return pageMap;
    }


});

