/**
 * conjoon
 * (c) 2007-2016 conjoon.org
 * licensing@conjoon.org
 *
 * lib-cn_core
 * Copyright (C) 2016 Thorsten Suckow-Homberg/conjoon.org
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
 * Base schema for lib-cn_core.
 * Each instance of this class needs to provide a unique id and a namespace
 * to work with.
 */
Ext.define('conjoon.cn_core.data.schema.BaseSchema', {

    extend : 'Ext.data.schema.Schema',

    alias : 'schema.cn_core-baseschema',

    /**
     * @inheritdoc
     *
     * @throws exception if id and/or namespace were not configured. if the id
     * is configured with "default", an exception will be thrown.
     */
    constructor : function(config) {

        var me = this;

        config = config || {};

        config.id = me.id || config.id;

        if (!config.id || (config.id + "").toLowerCase() == 'default') {
            Ext.raise({
                sourceClass : Ext.getClassName(this),
                id          : config.id,
                msg         : Ext.getClassName(this) +" requires id to be defined to anything other than \"default\""
            });
        }

        if (!config.namespace && !me.defaultConfig.namespace) {
            Ext.raise({
                sourceClass : Ext.getClassName(this),
                namespace   : config.namespace,
                msg         : Ext.getClassName(this) +" requires property \"namespace\" to be defined, either as class-property or constructor argument"
            });
        }

        me.callParent([config]);


    }
});
