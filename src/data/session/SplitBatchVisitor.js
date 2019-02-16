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
 * BatchVisitor which makes sure that multiple records associated with a single
 * CREATE operation are extracted and put into individual operations.
 * This is useful when using Sessions and {@link conjoon.cn_core.data.proxy.RestForm}
 * and uploding files via {FormData}. Instead of one batched request with
 * multiple files, this BatchVisitor makes sure that for each FormData object a single
 * request is created.
 *
 */
Ext.define('conjoon.cn_core.data.session.SplitBatchVisitor', {

    extend : 'Ext.data.session.BatchVisitor',

    /**
     * @inheritdoc
     */
    getBatch: function (sort) {

        var me     = this,
            batch  = me.callParent(arguments),
            ops    = batch ? batch.getOperations() : [],
            nBatch = batch ? Ext.create('Ext.data.Batch') : null;

        for (var i = 0, len = ops.length; i < len; i++) {
            if (ops[i].getAction() !== 'create') {
                nBatch.add(ops[i])
                continue;
            }

            var recs = ops[i].getRecords(),
                operation,
                proxy;
            for (var a = 0, lena = recs.length; a < lena; a++) {
                proxy     = recs[a].getProxy();
                operation = proxy.createOperation(ops[i].getAction(), {
                    records : [recs[a]]
                });
                operation.entityType = Ext.getClass(recs[a]);
                nBatch.add(operation);
            }
        }

        if (nBatch && sort !== false) {
            nBatch.sort();
        }

        batch = null;

        return nBatch;
    }

});
