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
 * An specialized version of a Ext.data.writer.Json which is configured to create
 * FormData objects for the data being sent to the server.
 * This is useful for {@link coon.core.data.proxy.RestForm} proxies
 * which maintain stores and/or models holding fields of the type
 * {@link coon.core.data.field.Blob} which can be uploaded by setting
 * them to the javascript native's FormData object.
 * Note, that a FormData object is only createdfor requests that represent the
 * "create" action. Otherwise, regular JSON encoded data will be created by
 * this writer.
 */
Ext.define("coon.core.data.writer.FormData", {

    extend: "Ext.data.writer.Json",

    requires: [
        "coon.core.data.FormDataRequest"
    ],

    alias: "writer.cn_core-datawriterformdata",


    /**
     * Makes sure that FormData is created if, and only if the action of the
     * specified request ist set to "create" and the request is of the type
     * {@link coon.core.data.FormDataRequest},
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
    writeRecords: function (request, data) {

        var me       = this,
            formData = null,
            d, key, fileCount, fileKey;

        if (request.getAction() !== "create" ||
            !(request instanceof coon.core.data.FormDataRequest)) {
            return me.callParent(arguments);
        }

        if (!request.getFormData()) {
            formData = new FormData();
            request.setFormData(formData);
        }

        formData = request.getFormData();

        for (var i = 0, len = data.length; i < len; i++) {
            d         = data[i];
            key       = "data[" + i + "]";
            fileCount = 0;

            for (var a in d) {
                if (!Object.prototype.hasOwnProperty.call(d, a)) {
                    continue;
                }

                if (d[a] instanceof Blob) {
                    fileKey = "file[" + i + "][" + (fileCount++) + "]";
                    formData.set(fileKey, d[a]);
                } else {
                    formData.set(key + "[" + a + "]", d[a]);
                }
            }
        }

        request.setFormData(formData);

        return request;
    }


});
