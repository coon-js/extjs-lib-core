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
 * This class extends from {@link Ext.data.request.Ajax} to provide an interface
 * to XHR2 and it's upload-capabilities.
 * This class considers the "progress" event of an establish XHR connection and
 * makes sure that any configured callback is triggered while the XHR conenction
 * fires this event.
 * This request class is implemented to send {FormData} to the attached backend.
 */
Ext.define('conjoon.cn_core.data.request.FormData', {

    extend : 'Ext.data.request.Ajax',

    alias : 'request.cn_core-datarequestformdata',


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
    openRequest : function(options, requestOptions) {

        var me = this;

        var xhr = me.callParent(arguments);

        if (requestOptions.data instanceof FormData) {

            me.options.headers = Ext.applyIf(
                {'Content-Type' : null}, me.options.headers
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
        onProgress : function(evt) {
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