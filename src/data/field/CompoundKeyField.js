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
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Custom field for providing a base for fields representing part of a compound
 * key.
 *
 *      @example
 *      Ext.define("CompoundModel", {
 *
 *          extend : "Ext.data.Model",
 *
 *          fields : [{
 *              name : 'leftId',
 *              type : 'cn_core-datafieldcompoundkey'
 *          }, {
 *              name : 'rightId',
 *              type : 'cn_core-datafieldcompoundkey'
 *          }]
 *
 *      ));
 *
 */
Ext.define('conjoon.cn_core.data.field.CompoundKeyField', {

    extend : 'Ext.data.field.String',

    alias : 'data.field.cn_core-datafieldcompoundkey',

    validators : 'presence',

    critical : true,


    /**
     * @inheritdoc
     */
    convert    : function(v) {
        if (v === "" || v === null || v === undefined) {
            return undefined;
        }

        return String(v);
    }

});