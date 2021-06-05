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
 * Session class which lets you configure an individual BatchVisitor to use for
 * creating batches.
 */
Ext.define("coon.core.data.Session", {

    extend: "Ext.data.Session",

    requires: [
        "Ext.data.session.BatchVisitor"
    ],

    /**
     * @cfg {String=Ext.data.session.BatchVisitor } batchVisitorClassName
     * The class name of the BatchVisitor to use with this session.
     */
    batchVisitorClassName: "Ext.data.session.BatchVisitor",


    /**
     * @inheritdoc
     *
     * @see #createVisitor
     */
    getSaveBatch: function (sort) {
        var me      = this,
            // reusing the same batch visitor leads to issues!)
            visitor = me.createVisitor();

        this.visitData(visitor);

        return visitor.getBatch(sort);
    },


    privates: {

        /**
         * Creates and returns an instance of the class name specified
         * in #batchVisitorClassName. This method will always create and return
         * a new instance of #batchVisitorClassName
         *
         * @return Ext.data.session.BatchVisitor
         *
         * @throws if the class specified in #batchVisitorClassName was not already
         * loaded or if the class specified in #batchVisitorClassName is not of type
         * Ext.data.session.BatchVisitor
         */
        createVisitor: function () {

            var me  = this,
                cls = me.batchVisitorClassName,
                inst,
                cn;

            if (!Ext.ClassManager.get(cls)) {
                cn = Ext.getClassName(me);
                Ext.raise({
                    sourceClass: cn,
                    batchVisitorClassName: cls,
                    msg: cn + " requires batchVisitorClassName to be loaded."
                });
            }

            inst = Ext.create(cls);

            if (!(inst instanceof Ext.data.session.BatchVisitor)) {
                cn = Ext.getClassName(me);
                Ext.raise({
                    sourceClass: cn,
                    batchVisitorClassName: cls,
                    msg: cls +
                        " needs to inherit from Ext.data.session.BatchVisitor."
                });
            }

            return inst;

        }

    }
});
