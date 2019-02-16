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
