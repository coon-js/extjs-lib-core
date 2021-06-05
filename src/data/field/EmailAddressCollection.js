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
 * Custom field for providing information about emailaddresses, whereas an email
 * address consists of a name and an address.
 *
 * Data stored in this fields should be an array containing objects keyed by
 * "name" and "address"; "name" is not mandatory, if omitted, "address" will be
 * used to set the value for name.
 * It is also okay to just specify a string instead of an object with an address-
 * and a name-property for entries in the collection - they will then be automatically
 * converted to appropriate objects, where the passed string will be used for
 * the "address"- and "name"-properties
 *
 *
 *      @example
 *      Ext.define('MessageModel', {
 *
 *          fields : [{
 *              name : 'to',
 *              type : 'cn_core-datafieldemailaddresscollection'
 *          }]
 *      });
 *
 *      var model = Ext.create('MessageModel', {
 *          to : [{
 *              // all required properties set
 *              name    : 'Peter',
 *              address : 'peterparker@dailynews.tld'
 *          },
 *              // will automaticall be converted into
 *              // {name : "myaddress@domain.tld", address : "myaddress@domain.tld"}
 *              "myaddress@domain.tld",
 *          {
 *              // omitting the "name" property, it will be set by the
 *              // implicit convert method with the value of address
 *              address : 'name@domain.tld'
 *          },[{
 *              // since the address is missing, this model would not
 *              // validate successfully
 *              name    : 'Another Name'
 *          }]
 *      });
 *
 *
 * Validating this field:
 * ======================
 * This fields should use the EmailAddressCollection validator to make sure that
 * the data passed to instances of this field is valid. Data passed as values to
 * this field must be an array containing keyed objects with the property "address".
 * The field "name" is optional. If it is not available, it will be set to the
 * value of "address" in an implicit convert method.
 *
 *      @example
 *     {address : 'name@domain.tld'}
 *     // becomes
 *     {address : 'name@domain.tld', name : 'name@domain.tld'}
 *
 * Auto convert:
 * =============
 * This field uses an implicit convert-method which also clones the value to
 * prevent keeping references to the original passed array.
 *
 * Default value:
 * ==============
 * The default value of this field is an empty Array.
 *
 */
Ext.define("coon.core.data.field.EmailAddressCollection", {

    extend: "Ext.data.field.Field",

    alias: "data.field.cn_core-datafieldemailaddresscollection",

    /**
     * @cfg {Array=[]} defaultValue
     * Set in the constructor.
     */

    /**
     * @inheritdoc
     * Overridden to make sure defaultValue is set to [] and to make sure same
     * reference is not shared over various instances.
     */
    constructor: function (config) {

        if (this.defaultValue === undefined &&
            (!config || !Object.prototype.hasOwnProperty.call(config,"defaultValue"))) {
            this.defaultValue = [];
        }

        this.callParent(arguments);
    },


    /**
     * @inheritdoc
     */
    convert: function (v) {

        if (!Ext.isString(v) && !Ext.isArray(v)) {
            return [];
        }

        if (Ext.isString(v)) {
            return [{
                address: v,
                name: v
            }];
        }

        v = Ext.clone(v);

        for (var i = 0, len = v.length; i < len; i++) {
            if (Ext.isString(v[i])) {
                v[i] = {
                    address: v[i],
                    name: v[i]
                };
            } else if (v[i] && !Object.prototype.hasOwnProperty.call(v[i], "name")) {
                v[i]["name"] = v[i]["address"];
            }
        }

        return v;
    },

    /**
     * @inheritdoc
     */
    serialize: function (v) {

        if (!Ext.isArray(v)) {
            v = [];
        }

        return Ext.JSON.encode(v);
    },

    /**
     * @inheritdoc
     *
     * Compares both values and returns 0 if, and only if value1 and value2
     * are both an array, have the same number of elements, and each element is
     * an object where the value of the "address" property appears both in
     * value1 and value2.
     *
     *      @example
     *      //The following values are considered equal:
     *
     *      //value1
     *      [{name : 'Peter', address :'peterParker@dailyNews.com'},
     *      {name : 'Karl Malden', address :'karl.malden@yahooo.tld'}]
     *
     *      //value2:
     *      [{name : '', address :'peterparker@dailynews.com'},
     *      {name : 'Karl', address :'karl.malden@yahooo.tld'}]
     */
    compare: function (value1, value2) {

        if (!Ext.isArray(value1) && !Ext.isArray(value2)) {
            return 0;
        }

        if (!Ext.isArray(value1) || !Ext.isArray(value2)) {
            return !Ext.isArray(value1) ? -1 : 1;
        }

        if (value1.length < value2.length) {
            return -1;
        } else if (value1.length > value2.length) {
            return 1;
        }

        if (value1.length === value2.length) {

            var found = false;
            for (var i = 0, len = value1.length; i < len; i++) {
                found = false;
                if (!Object.prototype.hasOwnProperty.call(value1[i],"address")) {
                    return -1;
                }
                for (var a = 0; a < len; a++) {
                    if (!Object.prototype.hasOwnProperty.call(value2[a],"address")) {
                        return -1;
                    }
                    if ((value1[i]["address"] + "").toLowerCase() ===
                        (value2[a]["address"] + "").toLowerCase()) {
                        found = true;
                        break;
                    }

                }

                if (!found) {
                    return -1;
                }
            }

            return 0;
        }

        return -1;
    }


});
