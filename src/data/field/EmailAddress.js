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
 * Custom field for providing information about a single emailaddress, whereas an email
 * address consists of a name and an address.
 *
 * Data stored in this fields should be an object containing "name" and "address"
 * properties; "name" is not mandatory, if omitted, "address" will be
 * used to set the value for name.
 * It is also okay to just specify a string instead of an object with an address-
 * and a name-property; it will then be automatically
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
Ext.define("coon.core.data.field.EmailAddress", {

    extend : "Ext.data.field.Field",

    alias : "data.field.cn_core-datafieldemailaddress",

    /**
     * @cfg {Array=[]} defaultValue
     * Set in the constructor.
     */
    defaultValue : null,


    /**
     * @inheritdoc
     */
    convert : function (v) {

        if (!Ext.isString(v) && !Ext.isObject(v)) {
            return null;
        }

        if (Ext.isString(v)) {
            return {
                address : v,
                name    : v
            };
        }

        if (!Object.prototype.hasOwnProperty.call(v,"address")) {
            return null;
        }

        v = Ext.copy({}, v, "name,address");

        if (!Object.prototype.hasOwnProperty.call(v,"name")) {
            v["name"] = v["address"];

        }

        return v;
    },

    /**
     * @inheritdoc
     */
    serialize : function (v) {

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
     * "address" property appears both in value1 and value2 with the same value,
     * and each "name" property appears both in value1 and value2 with the
     * same value. Strings are lowercased for comparision.
     *
     *      @example
     *      //The following values are considered equal:
     *
     *      //value1
     *      {name : 'Peter', address :'peterparker@dailyNews.com'}
     *
     *      //value2:
     *      {name : 'peter', address :'peterparker@dailynews.com'}
     */
    compare : function (value1, value2) {

        if (!Ext.isObject(value1) && !Ext.isObject(value2)) {
            return 0;
        }

        if (Ext.Object.isEmpty(value1) && Ext.Object.isEmpty(value2)) {
            return 0;
        }

        if (!Ext.isObject(value1) || !Ext.isObject(value2)) {
            return !Ext.isObject(value1) ? -1 : 1;
        }


        if (!Object.prototype.hasOwnProperty.call(value1,"address") &&
            Object.prototype.hasOwnProperty.call(value2,"address")) {
            return -1;
        }

        if (!Object.prototype.hasOwnProperty.call(value1,"name") &&
            Object.prototype.hasOwnProperty.call(value2,"name")) {
            return -1;
        }

        if ((value1["address"] + "").toLowerCase() ===
            (value2["address"] + "").toLowerCase() &&
            (value1["name"] + "").toLowerCase() ===
            (value2["name"] + "").toLowerCase()) {
            return 0;
        }


        return 1;
    }


});
