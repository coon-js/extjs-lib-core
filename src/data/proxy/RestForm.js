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
 * This class represents a  REST proxy which is capable of form uploads, by
 * extending from {@link Ext.data.proxy.Rest} and utilizing
 * {@link coon.core.data.writer.Form}, which is being used as the default
 * writer-class.
 *
 * Note:
 * When working with sessions and if you do not want to send multiple records
 * during the create action with one request due to the fact that the post data
 * of associated file uploads would grow to fast,  use a {@link coon.core.data.Session}
 * configured with a {@link coon.core.data.session.SplitBatchVisitor}.
 *
 * The class used for establishing connections is {@link coon.core.data.AjaxForm},
 * an extended implementation of Ext.Ajax.
 */
Ext.define("coon.core.data.proxy.RestForm", {

    extend: "Ext.data.proxy.Rest",

    requires: [
        "coon.core.data.AjaxForm",
        "coon.core.data.FormDataRequest",
        "coon.core.data.operation.Upload",
        "coon.core.data.writer.FormData"
    ],

    alias: "proxy.cn_core-dataproxyrestform",

    config: {
        writer: "cn_core-datawriterformdata"
    },


    /**
     * @inheritdoc
     *
     * Returns an instance of {@link coon.core.data.FormDataRequest}
     * when the operation's action is set to "create" to make sure
     * FormData as well als callbacks for upload progress can be specified.
     * The operation passed to this method for the "create"-action is of the type
     * {@link coon.core.data.operation.Upload}.
     *
     * @return {coon.core.data.FormDataRequest}
     *
     * @private
     *
     * @throws if the passed operation action is "create", but the operation itself
     * is not of the type {@link coon.core.data.operation.Upload}
     */
    buildRequest: function (operation) {

        const me = this;

        let config,
            request = me.callParent(arguments);

        if (operation.getAction() === "create") {

            if (!(operation instanceof coon.core.data.operation.Upload)) {
                Ext.raise({
                    source: Ext.getClassName(this),
                    msg: Ext.getClassName(this) +
                            ".buildRequest() needs an operation of the type " +
                            "coon.core.data.operation.Upload"
                });
            }

            config = Ext.apply({
                progressCallback: operation.getProgressCallback(),
                progressScope: operation.getProgressScope()
            }, request.getCurrentConfig());

            request = Ext.create(
                "coon.core.data.FormDataRequest", config
            );
        }

        return request;
    },


    /**
     * @inheritdoc
     * Uses {@link coon.core.data.AjaxForm} to send requests.
     *
     * @return {Ext.data.Request}
     *
     * @private
     */
    sendRequest: function (request) {

        const me = this;

        if (request.getAction() !== "create") {
            return me.callParent(arguments);
        }

        request.setRawRequest(
            coon.core.data.AjaxForm.request(
                request.getCurrentConfig())
        );

        me.lastRequest = request;

        return request;
    },


    /**
     * @inheritdoc
     *
     * Overriden to make sure that the operation created for the "create"-action
     * is {@link coon.core.data.operation.Upload}.
     *
     * @return {coon.core.data.operation.Upload}
     */
    createOperation: function (action, config) {
        var me = this;

        if (action === "create") {
            action = "cn_core-dataoperationupload";
        }

        return me.callParent([action, config]);
    }

});
