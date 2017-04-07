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

describe('conjoon.cn_core.data.session.SplitBatchVisitorTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.it('Should successfully test class', function(t) {

        var visitor = Ext.create('conjoon.cn_core.data.session.SplitBatchVisitor');

        t.expect(visitor instanceof Ext.data.session.BatchVisitor).toBe(true);
    });


    t.it('Test getBatch()', function(t) {

        // to make sure, same config with regular BatchVisitor
        var operations = [
            Ext.create('Ext.data.Model'),
            Ext.create('Ext.data.Model'),
            Ext.create('Ext.data.Model')
        ];

        var visitor = Ext.create('Ext.data.session.BatchVisitor');
        visitor.onDirtyRecord(operations[0]);
        visitor.onDirtyRecord(operations[1]);
        visitor.onDirtyRecord(operations[2]);
        t.expect(visitor.getBatch().getOperations().length).toBe(1);

        visitor = Ext.create('conjoon.cn_core.data.session.SplitBatchVisitor');
        operations = [
            Ext.create('Ext.data.Model'),
            Ext.create('Ext.data.Model'),
            Ext.create('Ext.data.Model')
        ];
        visitor.onDirtyRecord(operations[0]);
        visitor.onDirtyRecord(operations[1]);
        visitor.onDirtyRecord(operations[2]);

        t.expect(visitor.getBatch().getOperations().length).toBe(3);
    });

});
