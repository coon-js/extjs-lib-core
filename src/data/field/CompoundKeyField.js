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
Ext.define("coon.core.data.field.CompoundKeyField", {

    extend : "Ext.data.field.String",

    alias : "data.field.cn_core-datafieldcompoundkey",

    validators : "presence",

    critical : true,


    /**
     * @inheritdoc
     */
    convert    : function (v) {
        if (v === "" || v === null || v === undefined) {
            return undefined;
        }

        return String(v);
    }

});