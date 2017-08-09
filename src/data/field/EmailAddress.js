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
 * Custom field for providing information about a single emailaddress, whereas an email
 * address consists of a name and an address.
 *
 * Data stored in this fields should be an object containing "name" and "address"
 * properties; "name" is not mandatory, if omitted, "address" will be
 * used to set the value for name.
 * It is also okay to just specify a string instead of an object with an address-
 * and a name-property it will then be automatically
 * converted to an appropriate object, where the passed string will be used for
 * the "address"- and "name"-property.
 *
 *
 *      @example
 *      Ext.define('MessageModel', {
 *
 *          fields : [{
 *              name : 'from',
 *              type : 'cn_core-datafieldemailaddress'
 *          }]
 *      });
 *
 *      var model = Ext.create('MessageModel', {
 *          from : {
 *              // all required properties set
 *              name    : 'Peter',
 *              address : 'peterparker@dailynews.tld'
 *          }
 *      });
 *
 *
 * Auto convert:
 * =============
 * This field uses an implicit convert-method which also clones the value to
 * prevent keeping references to the original passed object.
 *
 *
 * Validating this field:
 * ======================
 * This fields should use the EmailAddress validator to make sure that
 * the data passed to instances of this field is valid. Data passed as values to
 * this field must be an object ekyed at least with the property "address".
 * The field "name" is optional. If it is not available, it will be set to the
 * value of "address" in an implicit convert method.
 *
 *      @example
 *     {address : 'name@domain.tld'}
 *     // becomes
 *     {address : 'name@domain.tld', name : 'name@domain.tld'}
 *
 *
 * Default value:
 * ==============
 * The default value of this field is null
 *
 */
Ext.define('conjoon.cn_core.data.field.EmailAddress', {

    extend : 'Ext.data.field.Field',

    alias : 'data.field.cn_core-datafieldemailaddress',

    /**
     * @cfg {Array=[]} defaultValue
     * Set in the constructor.
     */
    defaultValue : null,


    /**
     * @inheritdoc
     */
    convert : function(v) {

        if (!Ext.isString(v) && !Ext.isObject(v)) {
            return null;
        }

        if (Ext.isString(v)) {
            return {
                address : v,
                name    : v
            };
        }

        if (!v.hasOwnProperty('address')) {
            return null;
        }

        v = Ext.copy({}, v, 'name,address');

        if (!v.hasOwnProperty('name')) {
            v['name'] = v['address'];

        }

        return v;
    },

    /**
     * @inheritdoc
     */
    serialize : function(v) {

        if (!Ext.isObject(v)) {
            return null;
        }

        return Ext.JSON.encode(v);
    },

    /**
     * @inheritdoc
     *
     * Compares both values and returns 0 if, and only if value1 and value2
     * are both an object, have the same number of elements, and each
     * "address" property appears both in value1 and value2 with the same value.
     *
     *      @example
     *      //The following values are considered equal:
     *
     *      //value1
     *      {name : 'Peter', address :'peterParker@dailyNews.com'}
     *
     *      //value2:
     *      {name : '', address :'peterparker@dailynews.com'}
     */
    compare : function(value1, value2) {

        if (!Ext.isObject(value1) && !Ext.isObject(value2)) {
            return 0;
        }

        if (!Ext.isObject(value1) || !Ext.isObject(value2)) {
            return !Ext.isObject(value1) ? -1 : 1;
        }

        if (!value1.hasOwnProperty('address')) {
            return -1;
        }

        if (!value2.hasOwnProperty('address')) {
            return -1;
        }
        if ((value1['address'] + '').toLowerCase() ===
            (value2['address'] + '').toLowerCase()) {
            return 0;
        }


        return -1;
    }


});
