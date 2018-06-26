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
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


/**
 * This class represents an operation on an {Ext.data.PageMap}, encapsulating
 * the request that was made and the result.
 *
 *
 */
Ext.define('conjoon.cn_core.data.pageMap.operation.Operation', {

   requires : [
       'conjoon.cn_core.data.pageMap.operation.Request',
       'conjoon.cn_core.data.pageMap.operation.Result'
   ],


    config : {
        /**
         * @cfg {conjoon.cn_core.data.pageMap.operation.Request} the request for this
         * operation
         */
        request : null,

        /**
         * @cfg {conjoon.cn_core.data.pageMap.operation.Result} the result for this
         * operatiom
         */
        result : null
    },


    /**
     * Creates a new instance of this class.
     * The result for this operation may be set to a later time.
     * @param {Object} cfg
     *
     * @throws if the request for this operation is not specified, or any
     * exception thrown by #applyRequest
     */
    constructor : function(cfg) {

        cfg = cfg || {};

        if (!cfg.hasOwnProperty('request')) {
            Ext.raise({
                msg : 'a \'request\' for this operation is required',
                cfg : cfg
            });
        }

        this.initConfig(cfg);
    },


    /**
     * Applies the request to this operation.
     * This property is not mutable once it has been set for the first time.
     *
     * @param {conjoon.cn_core.data.pageMap.operation.Request} request
     *
     * @throws if request is not an instance of {conjoon.cn_core.data.pageMap.operation.Request},
     * or if the request for this instance was already set.
     */
    applyRequest : function(request) {

        var me = this;

        if (!(request instanceof conjoon.cn_core.data.pageMap.operation.Request)) {
            Ext.raise({
                msg     : '\'request\' must be an instance of conjoon.cn_core.data.pageMap.operation.Request',
                request : request
            });
        }

        if (me.getRequest()) {
            Ext.raise({
                msg     : 'the \'request\' for this operation was already set',
                request : me.getRequest()
            });
        }

        return request;
    },


    /**
     * Applies the result to this operation.
     * This property is not mutable once it has been set for the first time.
     *
     * @param {conjoon.cn_core.data.pageMap.operation.Result} request
     *
     * @throws if request is not an instance of {conjoon.cn_core.data.pageMap.operation.Result},
     * or if the request for this instance was already set.
     */
    applyResult : function(result) {

        var me = this;

        if (!(result instanceof conjoon.cn_core.data.pageMap.operation.Result)) {
            Ext.raise({
                msg    : '\'result\' must be an instance of conjoon.cn_core.data.pageMap.operation.Result',
                result : result
            });
        }

        if (me.getResult()) {
            Ext.raise({
                msg     : 'the \'result\' for this operation was already set',
                request : me.getResult()
            });
        }

        return result;
    }

});