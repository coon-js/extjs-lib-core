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
 * An object representing the result of a {conjoon.cn_core.data.pageMap.operation.Operation}.
 * Properties of this class are immutable.
 *
 *
 */
Ext.define('conjoon.cn_core.data.pageMap.operation.Result', {

    require : [
        'conjoon.cn_core.data.pageMap.operation.ResultReason'
    ],

    config : {

        /**
         * Whether the result is marked as a success or failure
         * @cfg {Boolean} success
         */
        success : undefined,

        /**
         * The reason for the result. Should be any of {conjoon.cn_core.data.pageMap.operation.ResultReason}'s
         * properties.
         *
         * @cfg {Boolean} reason
         */
        reason : undefined
    },


    /**
     * Creates a new instance of this class.
     *
     * @param {Object} cfg
     *
     * @throws if reason or success are not set in cfg, or any exception
     * thrown by #applySuccess and #applyReason
     */
    constructor : function(cfg) {

        cfg = cfg || {};

        if (!cfg.hasOwnProperty('success')) {
            Ext.raise({
                msg : 'the property \'success\' is required for this result',
                cfg : cfg
            });
        }

        if (!cfg.hasOwnProperty('reason')) {
            Ext.raise({
                msg : 'the property \'reason\' is required for this result',
                cfg : cfg
            });
        }

        this.initConfig(cfg);
    },


    /**
     * Applies "success" to this Result.
     *
     * @param {Boolean} success
     *
     * @throws if success is not true or false, of it was already set
     */
    applySuccess : function(success) {

        var me = this;

        if (success !== false && success !== true) {
            Ext.raise({
                msg     : '\'success\' must be a boolean value',
                success : success
            });
        }

        if (me.getSuccess() !== undefined) {
            Ext.raise({
                msg     : '\'success\' was already set',
                success : me.getSuccess()
            });

        }

        return success;
    },


    /**
     * Applies "reason" to this Result.
     *
     * @param {Mixed} reason
     *
     * @throws if reason was already set, or if reason equals to null or undefined
     */
    applyReason : function(reason) {

        var me = this;

        if (reason === null || reason === undefined) {
            Ext.raise({
                msg    : '\'reason\' must not be null or undefined',
                reason : reason
            });
        }

        if (me.getReason() !== undefined) {
            Ext.raise({
                msg     : '\'reason\' was already set',
                reason : me.getReason()
            });

        }

        return reason;
    }


});