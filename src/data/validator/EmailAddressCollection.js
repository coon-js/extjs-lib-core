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
 * Validates that the passed value is an array containing objects with an
 * "address" property.
 * The array may also be empty is allowEmpty is set to true.
 *
 */
Ext.define('conjoon.cn_core.data.validator.EmailAddressCollection', {

    extend : 'Ext.data.validator.Validator',

    alias : 'data.validator.cn_core-datavalidatoremailaddresscollection',

    type : 'cn_core-datavalidatoremailaddresscollection',

    config : {
        /**
         * @cfg {String} message
         * The error message to return when the value is invalid.
         */
        message : 'Must be an array of objects containing an address property.',

        /**
         * @cfg {Boolean} allowEmpty
         * `true` to allow empty array [] as a valid value.
         */
        allowEmpty : false
    },


    validate: function(value) {

        var me    = this,
            valid = Ext.isArray(value);

        if (valid) {

            for (var i = 0,len = value.length; i < len; i++) {
                if (!Ext.isObject(value[i]) || !value[i].hasOwnProperty('address')) {
                    valid = false;
                    break;
                }
            }

            if (len === 0) {
                valid = !!me.getAllowEmpty();
            }
        }

        return valid ? true : me.getMessage();
    }

});