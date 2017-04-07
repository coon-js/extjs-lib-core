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
