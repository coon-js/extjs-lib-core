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
 * Custom field for providing readable file size information, based on data
 * which provides a byte length. {@link Ext.util.Format#fileSize} is used to
 * provide the conversion functionality.
 *
 *      @example
 *      Ext.define("FileModel", {
 *
 *          extend : "Ext.data.Model",
 *
 *          fields : [{
 *              name : 'size',
 *              type : 'cn_core-datafieldfilesize'
 *          }]
 *
 *      ));
 *
 *      var f = Ext.create("FileModel", {
 *          size : 10000
 *      });
 *
 *      console.log(f.get('size')); // outputs 9.8KB
 *
 */
Ext.define('conjoon.cn_core.data.field.FileSize', {

    extend : 'Ext.data.field.Field',

    alias : 'data.field.cn_core-datafieldfilesize',

    sortType : 'asInt',

    /**
     * @inheritdoc
     *
     * @see {Ext.util.Format#fileSize}
     */
    convert : Ext.util.Format.fileSize


});