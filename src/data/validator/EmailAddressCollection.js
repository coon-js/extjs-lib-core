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