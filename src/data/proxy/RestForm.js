/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * lib-cn_core
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
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
 * This class represents a  REST proxy which is capable of form uploads, by
 * extending from {@link Ext.data.proxy.Rest} and utilizing
 * {@link conjoon.cn_core.data.writer.Form}, which is being used as the default
 * writer-class.
 *
 * Note:
 * When working with sessions and if you do not want to send multiple records
 * during the create action with one request due to the fact that the post data
 * of associated file uploads would grow to fast,  use a {@link conjoon.cn_core.data.Session}
 * configured with a {@link conjoon.cn_core.data.session.SplitBatchVisitor}.
 *
 * The class used for establishing connections is {@link conjoon.cn_core.data.AjaxForm},
 * an extended implementation of Ext.Ajax.
 */
Ext.define('conjoon.cn_core.data.proxy.RestForm', {

    extend : 'Ext.data.proxy.Rest',

    requires : [
        'conjoon.cn_core.data.AjaxForm',
        'conjoon.cn_core.data.FormDataRequest',
        'conjoon.cn_core.data.operation.Upload',
        'conjoon.cn_core.data.writer.FormData'
    ],

    alias : 'proxy.cn_core-dataproxyrestform',

    config : {
        writer : 'cn_core-datawriterformdata'
    },


    /**
     * @inheritdoc
     *
     * Returns an instance of {@link conjoon.cn_core.data.FormDataRequest}
     * when the operation's action is set to "create" to make sure
     * FormData as well als callbacks for upload progress can be specified.
     * The operation passed to this method for the "create"-action is of the type
     * {@link conjoon.cn_core.data.operation.Upload}.
     *
     * @return {conjoon.cn_core.data.FormDataRequest}
     *
     * @private
     *
     * @throws if the passed operation action is "create", but the operation itself
     * is not of the type {@link conjoon.cn_core.data.operation.Upload}
     */
    buildRequest : function(operation) {

        var me = this,
            config;

        request = me.callParent(arguments);

        if (operation.getAction() == 'create') {

            if (!(operation instanceof conjoon.cn_core.data.operation.Upload)) {
                Ext.raise({
                    source : Ext.getClassName(this),
                    msg    : Ext.getClassName(this) +
                            '.buildRequest() needs an operation of the type ' +
                            'conjoon.cn_core.data.operation.Upload'
                })
            }

            config = Ext.apply({
                progressCallback : operation.getProgressCallback(),
                progressScope    : operation.getProgressScope()
            }, request.getCurrentConfig());

            delete request;
            request = Ext.create(
                'conjoon.cn_core.data.FormDataRequest', config
            );
        }

        return request;
    },


    /**
     * @inheritdoc
     * Uses {@link conjoon.cn_core.data.AjaxForm} to send requests.
     *
     * @return {Ext.data.Request}
     *
     * @private
     */
    sendRequest: function(request) {

        const me = this;

        if (request.getAction() != 'create') {
            return me.callParent(arguments);
        }

        request.setRawRequest(
            conjoon.cn_core.data.AjaxForm.request(
                request.getCurrentConfig())
        );

        me.lastRequest = request;

        return request;
    },


    /**
     * @inheritdoc
     *
     * Overriden to make sure that the operation created for the "create"-action
     * is {@link conjoon.cn_core.data.operation.Upload}.
     *
     * @return {conjoon.cn_core.data.operation.Upload}
     */
    createOperation: function(action, config) {
        var me = this;

        if (action === 'create') {
            action = 'cn_core-dataoperationupload';
        }

        return me.callParent([action, config]);
    }

});
