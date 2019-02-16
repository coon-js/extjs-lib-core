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
