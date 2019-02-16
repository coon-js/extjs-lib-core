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
 * Custom field for providing BLOB data.
 *
 *      @example
 *      Ext.define('BlobModel', {
 *          fields : [{
 *              name : 'blob',
 *              type : 'cn_core-datafieldblob'
 *          }]
 *      });
 *
 *      var model = Ext.create('BlobModel', {
 *          blob : new Blob()
 *      });
 *
 * Data passed to this field will be NULLed if the data is not a BLOB.
 * See #convert.
 *
 *      @example
 *      var model = Ext.create('BlobModel', {
 *          blob : 'foo'
 *      });
 *
 *      console.log(model.get('blob')); // outputs NULL
 *
 * Serializing:
 * ============
 * no base64 serializing since this would invoke an asynchronous request.
 *
 * Convert:
 * ========
 * Data set to this field will always be a reference to the original Blob, not
 * a copy. Keep this in mind when using this field in your Data Models.
 */
Ext.define('conjoon.cn_core.data.field.Blob', {

    extend : 'Ext.data.field.Field',

    alias : 'data.field.cn_core-datafieldblob',

    /**
     * @cfg {defaultValue=null}
     */
    defaultValue : null,

    /**
     * The convert-method for this field. Will NULLify any data which is not
     * of the type Blob.
     * @inheritdoc
     */
    convert : function(v) {

        if (!(v instanceof Blob)) {
            return null;
        }

        return v;
    },

    /**
     * @inheritdoc
     *
     * Compares both values and returns 0 if, and only if value1 and value2
     * are the same Blob.
     * If that is not the case, the Blobs'sizes will be compared.
     * Based on this, 0 will be returned if they are both of the same
     * size. 1 will be returned if the size of value2 is greater
     * than the size of the Blob represented by value1, otherwise -1.
     *
     * If value1 is no Blob and value2 is, -1 will be returned.
     * If value2 is no Blob and value1 is, 1 will be returned.
     *
     * In any other case (i.e. same size since this is teh main comparator), -1
     * will be returned.
     */
    compare : function(value1, value2) {

        if (!(value1 instanceof Blob) && !(value2 instanceof Blob)) {
            return 0;
        }

        if (!(value1 instanceof Blob) && (value2 instanceof Blob)) {
            return -1;
        }

        if ((value1 instanceof Blob) && !(value2 instanceof Blob)) {
            return 1;
        }

        if (value1 === value2) {
            return 0;
        }

        if (value1.size < value2.size) {
            return -1;
        } else if (value1.size > value2.size) {
            return 1;
        }

        return -1;
    }


});
