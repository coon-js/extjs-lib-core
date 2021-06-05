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
 * Validates that the passed value is an object with an
 * "address" property.
 * The array may also be empty is allowEmpty is set to true.
 *
 */
Ext.define("coon.core.data.validator.EmailAddress", {

    extend: "Ext.data.validator.Validator",

    alias: "data.validator.cn_core-datavalidatoremailaddress",

    type: "cn_core-datavalidatoremailaddress",

    config: {
        /**
         * @cfg {String} message
         * The error message to return when the value is invalid.
         */
        message: "Must be an object containing an address property.",

        /**
         * @cfg {Boolean} allowEmpty
         * `true` to allow null as a valid value.
         */
        allowEmpty: false
    },


    validate: function (value) {

        var me    = this,
            valid = Ext.isObject(value);

        if (value === null) {
            if (me.getAllowEmpty()) {
                return true;
            }
            return me.getMessage();
        }

        if (valid && !Object.prototype.hasOwnProperty.call(value,"address")) {
            return me.getMessage();
        }

        return valid ? true : me.getMessage();
    }

});