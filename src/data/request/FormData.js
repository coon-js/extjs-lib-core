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
 * This class extends from {@link Ext.data.request.Ajax} to provide an interface
 * to XHR2 and it's upload-capabilities.
 * This class considers the "progress" event of an establish XHR connection and
 * makes sure that any configured callback is triggered while the XHR conenction
 * fires this event.
 * This request class is implemented to send {FormData} to the attached backend.
 */
Ext.define("coon.core.data.request.FormData", {

    extend : "Ext.data.request.Ajax",

    alias : "request.cn_core-datarequestformdata",


    /**
     * @inheritdoc
     *
     * This method checks if the requestOptions "data" property is of the
     * type {FormData} and sets the Content-Type header of "options" to "null"
     * to make sure the browser sets this header.
     * Additionally, the XHR "onprogress" method property for the XHR's "upload"
     * property is set to {#onProgress} to make sure any configured progressCallback
     * is considered if this event fires.
     *
     * {@see #onProgress}
     */
    openRequest : function (options, requestOptions) {

        var me = this;

        var xhr = me.callParent(arguments);

        if (requestOptions.data instanceof FormData) {

            me.options.headers = Ext.applyIf(
                {"Content-Type" : null}, me.options.headers
            );

            if (me.async && xhr.upload /* check needed for Sims */) {
                xhr.upload.onprogress = Ext.Function.bind(me.onProgress, me);
            }
        }

        return xhr;
    },


    privates : {


        /**
         * Callback for the XHR's upload progress event.
         * Makes sure that this instance's option's "progressCallback" is called
         * in the scope of this instance's option's "progressScope".
         * The passed argument's for the callback are the native progress event
         * and this instance's options.
         *
         * @param evt
         */
        onProgress : function (evt) {
            var me      = this,
                options = me.options;

            if (options.progressCallback) {
                Ext.callback(
                    options.progressCallback,
                    options.progressScope,
                    [evt, options]
                );
            }
        }
    }

});