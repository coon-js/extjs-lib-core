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
 * This class represents a specialized form of an Ext.data.Connectin, capable
 * of sending javascript native FormData objects containing files to the server
 * utilizing the XHR2 interface. Additionally, this data connection class lets
 * you track the upload progress by specifying #progressCallback.
 *
 * The request class used for this kind of connection is
 * {@link conjoon.cn_core.data.request.FormData}.
 *
 *      @example
 *      var formData = new FormData();
 *
 *      formData.append('file', new Blob());
 *      formData.append('foo', 'bar');
 *
 *      conjoon.cn_core.data.AjaxForm.request({
 *          url              : 'someurl.php',
 *          formData         : formData,
 *          progressCallback : function(evt, options) {
 *              console.log("Loaded " + evt.loaded + " of " + evt.total " bytes"
 *          }
 *      });
 */
Ext.define('conjoon.cn_core.data.AjaxForm', {

    extend : 'Ext.data.Connection',

    requires : [
        'conjoon.cn_core.data.request.FormData'
    ],

    singleton : true,

    /**
     * @property {Boolean} autoAbort
     * Whether a new request should abort any pending requests.
     */
    autoAbort : false,


    /**
     * @inheritdoc
     *
     * Makes sure the data prepared for the request is set to "formData".
     */
    setOptions : function(options, scope) {

        var me         = this,
            newOptions = me.callParent(arguments);

        if (options.formData instanceof FormData) {
            newOptions.data = options.formData;
        }

        return newOptions;
    },


    /**
     * Creates the request and makes sure that the "type" property of options
     * is set to the alias of the {@link conjoon.cn_core.data.request.FormData}.
     *
     * @param options
     * @param requestOptions
     * @returns {*|Object}
     */
    createRequest: function(options, requestOptions) {
        var me = this;

        options.type = 'cn_core-datarequestformdata';

        return me.callParent([options, requestOptions]);
    }


})
