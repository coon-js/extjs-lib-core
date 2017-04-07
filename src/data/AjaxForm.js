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
