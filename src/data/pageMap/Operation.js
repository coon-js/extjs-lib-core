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
 * This class represents an operation on an {Ext.data.PageMap} and its the result.
 *
 *
 */
Ext.define("coon.core.data.pageMap.Operation", {

    requires : [
        "coon.core.data.pageMap.RecordPosition"
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
    constructor : function (cfg) {

        const me = this;

        cfg = cfg || {};

        if (!Object.prototype.hasOwnProperty.call(cfg, "type")) {
            Ext.raise({
                msg : "'type' is required for configuring this instance",
                cfg : cfg
            });
        }

        me.setType(cfg.type);
        if (Object.prototype.hasOwnProperty.call(cfg, "result")) {
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
    applyType : function (type) {

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
    applyResult : function (result) {

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
                msg     : "the 'result' for this operation was already set",
                request : me.getResult()
            });
        }

        if (!Object.prototype.hasOwnProperty.call(result,"success")) {
            Ext.raise({
                msg    : "'success' is required for this result",
                result : result
            });
        }

        if (Object.prototype.hasOwnProperty.call(result,"to") && !(result.to instanceof coon.core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg : "'to' must be an instance of coon.core.data.pageMap.RecordPosition",
                to  : result.to
            });
        }

        if (Object.prototype.hasOwnProperty.call(result,"from") && !(result.from instanceof coon.core.data.pageMap.RecordPosition)) {
            Ext.raise({
                msg  : "'from' must be an instance of coon.core.data.pageMap.RecordPosition",
                from : result.from
            });
        }

        if (Object.prototype.hasOwnProperty.call(result,"record") && !(result.record instanceof Ext.data.Model)) {
            Ext.raise({
                msg    : "'record' must be an instance of Ext.data.Model",
                record : result.record
            });
        }

        if ([statics.MOVE, statics.REMOVE].indexOf(type) !== -1) {
            if (result.success && !Object.prototype.hasOwnProperty.call(result,"from")) {
                Ext.raise({
                    msg    : "'from' is required for this result",
                    result : result
                });
            }
        }


        if ([statics.MOVE, statics.ADD].indexOf(type) !== -1) {
            if (result.success && !Object.prototype.hasOwnProperty.call(result,"to")) {
                Ext.raise({
                    msg: "'to' is required for this result",
                    result: result
                });
            }
        }

        if ([statics.MOVE, statics.REMOVE, statics.ADD].indexOf(type) !== -1) {
            if (!Object.prototype.hasOwnProperty.call(result,"record")) {
                Ext.raise({
                    msg    : "'record' is required for this result",
                    result : result
                });
            }
        }

        return result;
    }

});