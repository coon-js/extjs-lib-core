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
 * This class represents an operation on an {Ext.data.PageMap} and its the result.
 *
 *
 */
Ext.define('conjoon.cn_core.data.pageMap.Operation', {

   requires : [
       'conjoon.cn_core.data.pageMap.RecordPosition'
   ],


    statics : {
        /**
         * @type {Number}
         */
        MOVE : 0,

        /**
         * @type {Number}
         */
        REMOVE : -1,

        /**
         * @type {Number}
         */
        ADD : 1
    },


    config : {
        /**
         * @cfg {Object} the result for this operation.
         * Each result object must provide a success-property, whether the operation
         * was successfull or not. Depending of the type of the operation,
         * additional information will be available in the result-object:
         * MOVE: from/to-RecordPosition
         * ADD: to-RecordPosition, record
         * REMOVE: from-RecordPosition, record
         * Some Information might not be available if success equals to false.
         */
        result : null,

        /**
         * @cfg {Number} type The type of this Operation, i.e. MOVE, ADD or REMOVE
         */
        type : undefined
    },


    /**
     * Creates a new instance of this class.
     * The result for this operation may be set to a later time.
     * @param {Object} cfg
     *
     * @throws if type is not set
     */
    constructor : function(cfg) {

        const me = this;

        cfg = cfg || {};

        if (!cfg.hasOwnProperty('type')) {
            Ext.raise({
                msg : "'type' is required for configuring this instance",
                cfg : cfg
            });
        }

        me.setType(cfg.type);
        if (cfg.hasOwnProperty('result')) {
            me.setResult(cfg.result);
        }
    },


    /**
     * Applies the type of operation.
     * This property is not mutable once it has been set for the first time.
     *
     * @param {Object} type
     *
     * @throws if the type for this instance was already set, or it does not
     * equal to #MOVE, #ADD or #REMOVE
     */
    applyType : function(type) {

        const me      = this,
              statics = me.statics();

        if ([statics.MOVE, statics.ADD, statics.REMOVE].indexOf(type) === -1) {
            Ext.raise({
                msg  : "invalid value for 'type'",
                type : type
            });
        }

        if (me.getType() !== undefined) {
            Ext.raise({
                msg  : "the 'type' for this operation was already set",
                type : me.getType()
            });
        }

        return type;
    },


    /**
     * Applies the result to this operation.
     * This property is not mutable once it has been set for the first time.
     *
     * @param {Object} request
     *
     * @throws if the request for this instance was already set, or if any
     * information in the result-object are missing. See #result.
     *
     */
    applyResult : function(result) {

        const me      = this,
              statics = me.statics(),
              type    = me.getType();

        if (type === undefined) {
            Ext.raise({
                msg  : "Unexpected missing 'type' for this instance",
                type : type
            });
        }

        if (!Ext.isObject(result)) {
            Ext.raise({
                msg    : "'result' must be an object",
                result : result
            });
        }

        if (me.getResult()) {
            Ext.raise({
                msg     : 'the \'result\' for this operation was already set',
                request : me.getResult()
            });
        }

        if (!result.hasOwnProperty('success')) {
            Ext.raise({
                msg    : "'success' is required for this result",
                result : result
            });
        }

        if (result.hasOwnProperty('to') && !(result.to instanceof conjoon.cn_core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg : "'to' must be an instance of conjoon.cn_core.data.pageMap.RecordPosition",
                to  : result.to
            });
        }

        if (result.hasOwnProperty('from') && !(result.from instanceof conjoon.cn_core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg  : "'from' must be an instance of conjoon.cn_core.data.pageMap.RecordPosition",
                from : result.from
            });
        }

        if (result.hasOwnProperty('record') && !(result.record instanceof Ext.data.Model)) {
            Ext.raise({
                msg    : "'record' must be an instance of Ext.data.Model",
                record : result.record
            });
        }

        if ([statics.MOVE, statics.REMOVE].indexOf(type) !== -1) {
            if (result.success && !result.hasOwnProperty('from')) {
                Ext.raise({
                    msg    : "'from' is required for this result",
                    result : result
                });
            }
        }


        if ([statics.MOVE, statics.ADD].indexOf(type) !== -1) {
            if (result.success && !result.hasOwnProperty('to')) {
                Ext.raise({
                    msg: "'to' is required for this result",
                    result: result
                });
            }
        }

        if ([statics.MOVE, statics.REMOVE, statics.ADD].indexOf(type) !== -1) {
            if (!result.hasOwnProperty('record')) {
                Ext.raise({
                    msg    : "'record' is required for this result",
                    result : result
                });
            }
        }

        return result;
    }

});