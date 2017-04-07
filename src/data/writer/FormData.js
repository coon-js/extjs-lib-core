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
 * An specialized version of a Ext.data.writer.Json which is configured to create
 * FormData objects for the data being sent to the server.
 * This is useful for {@link conjoon.cn_core.data.proxy.RestForm} proxies
 * which maintain stores and/or models holding fields of the type
 * {@link conjoon.cn_core.data.field.Blob} which can be uploaded by setting
 * them to the javascript native's FormData object.
 * Note, that a FormData object is only createdfor requests that represent the
 * "create" action. Otherwise, regular JSON encoded data will be created by
 * this writer.
 */
Ext.define('conjoon.cn_core.data.writer.FormData', {

    extend : 'Ext.data.writer.Json',

    requires : [
        'conjoon.cn_core.data.FormDataRequest'
    ],

    alias : 'writer.cn_core-datawriterformdata',


    /**
     * Makes sure that FormData is created if, and only if the action of the
     * specified request ist set to "create" and the request is of the type
     * {@link conjoon.cn_core.data.FormDataRequest},
     * otherwise the original writeRecords of the parent class will be called.
     *
     * If the request already has FormData specified, the object will be re-used
     * and data found within the data array will be set using the FormData's
     * set() method. Existing keys will be overwritten.
     *
     * The following keys are generated:
     * Files will be keyed with "file[dataCount][fileCount]".
     * Data will be keyed with "data[dataCount][keyName]".
     *
     *      @example
     *      // the following model is given
     *      Ext.define("FileModel", {
     *          extend : 'Ext.data.Model',
     *
     *          fields : [{
     *              name : 'fileName',
     *              type : 'string'
     *          }, {
     *              name : 'file',
     *              type : 'cn_core-datafieldblob'
     *          }]
     *      });
     *
     *      // data is created
     *      var data = [
     *          Ext.create("FileModel", {fileName : 'blob.txt', file : new Blob()}),
     *          Ext.create("FileModel", {fileName : 'blob2.txt', file : new Blob()}),
     *      ];
     *
     *      // passing the data to the Writer by creating the operation with the
     *      // records and invoking the proxy's sendRequest() method, the
     *      // following data should queryable on the server:
     *      //
     *      // file[0][0] => [Blob]
     *      // file[1][0] => [Blob]
     *      //
     *      // data[0]['fileName'] => 'blob.txt'
     *      // data[1]['fileName'] => 'blob2.txt'
     *
     *
     * @inheritdoc
     */
    writeRecords : function(request, data) {

        var me       = this,
            formData = null,
            d, key, fileCount, fileKey;

        if (request.getAction() !== 'create' ||
            !(request instanceof conjoon.cn_core.data.FormDataRequest)) {
            return me.callParent(arguments);
        }

        if (!request.getFormData()) {
            formData = new FormData();
            request.setFormData(formData);
        }

        formData = request.getFormData();

        for (var i = 0, len = data.length; i < len; i++) {
            d         = data[i];
            key       = 'data[' + i + ']';
            fileCount = 0;

            for (var a in d) {
                if (!d.hasOwnProperty(a)) {
                    continue;
                }

                if (d[a] instanceof Blob) {
                    fileKey = 'file[' + i + '][' + (fileCount++) + ']';
                    formData.set(fileKey, d[a]);
                } else {
                    formData.set(key + '[' + a + ']', d[a]);
                }
            }
        }

        request.setFormData(formData);

        return request;
    }


});
