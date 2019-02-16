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