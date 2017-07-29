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
