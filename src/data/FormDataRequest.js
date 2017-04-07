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
 * A implementation of Ext.data.Request which makes sure that progressCallback,
 * progressScope and formData are configurable when using
 * {@link conjoon.cn_core.data.AjaxForm}.
 *
 * See {@link conjoon.cn_core.data.request.FormData}
 * See {@link conjoon.cn_core.data.AjaxForm}
 */
Ext.define('conjoon.cn_core.data.FormDataRequest', {

    extend: 'Ext.data.Request',

    config : {

        /**
         * @cfg {Function} progressCallback
         * The method to call during the progress event fired by a xhr connection.
         */
        progressCallback : undefined,

        /**
         * @cfg {Object} progressScope
         * The scope for #progressCallback
         */
        progressScope : undefined,

        /**
         * @cfg {FormData} formData the Javascript native FormData to send to
         * the server
         */
        formData : undefined
    }

});
