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
 * Session class which lets you configure an individual BatchVisitor to use for
 * creating batches.
 */
Ext.define('conjoon.cn_core.data.Session', {

    extend : 'Ext.data.Session',

    requires : [
        'Ext.data.session.BatchVisitor'
    ],

    /**
     * @cfg {String=Ext.data.session.BatchVisitor } batchVisitorClassName
     * The class name of the BatchVisitor to use with this session.
     */
    batchVisitorClassName : 'Ext.data.session.BatchVisitor',


    /**
     * @inheritdoc
     *
     * @see #createVisitor
     */
    getSaveBatch: function (sort) {
        var me      = this,
            visitor = me.createVisitor();

        this.visitData(visitor);

        return visitor.getBatch(sort);
    },


    privates : {

        /**
         * Creates and returns an instance of the class name specified
         * in #batchVisitorClassName.
         *
         * @return Ext.data.session.BatchVisitor
         *
         * @throws if the class specified in #batchVisitorClassName was not already
         * loaded or if the class specified in #batchVisitorClassName is not of type
         * Ext.data.session.BatchVisitor
         */
        createVisitor : function() {

            var me  = this,
                cls = me.batchVisitorClassName,
                inst,
                cn;

            if (!Ext.ClassManager.get(cls)) {
                cn = Ext.getClassName(me);
                Ext.raise({
                    sourceClass           : cn,
                    batchVisitorClassName : cls,
                    msg                   : cn + " requires batchVisitorClassName to be loaded."
                });
            }

            inst = Ext.create(cls);

            if (!(inst instanceof Ext.data.session.BatchVisitor)) {
                cn = Ext.getClassName(me);
                Ext.raise({
                    sourceClass           : cn,
                    batchVisitorClassName : cls,
                    msg                   : cls +
                        " needs to inherit from Ext.data.session.BatchVisitor."
                });
            }

            return inst;

        }

    }
});
