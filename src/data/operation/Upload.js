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
 * This class represents a specialized form of a {@link Ext.data.operation.Create}
 * and provides additional configuration options to make sure that "create"
 * operations used by {@link conjoon.cn_core.data.proxy.RestForm} properly
 * register progressCallbacks when file uploads are involved. The progressCallback
 * is then used by {@link conjoon.cn_core.data.request.FormUploadRequest} to track
 * the progress-event of an XHR2 object.
 * This class is used internally and should not be needed directly. For examples,
 * see {@link conjoon.cn_core.data.proxy.RestForm} which creates instances
 * of this class. Note, that this class does not change the operation's action,
 * which remains "create".
 *
 */
Ext.define('conjoon.cn_core.data.operation.Upload', {

    extend : 'Ext.data.operation.Create',

    alias : 'data.operation.cn_core-dataoperationupload',

    config : {

        /**
         * @cfg {Function} progressCallback
         * The callback for the progress-event of an ongoing upload.
         */
        progressCallback : undefined,

        /**
         * @cfg {Object} progressScope
         * The scope for the progressCallback.
         */
        progressScope : undefined

    }

});