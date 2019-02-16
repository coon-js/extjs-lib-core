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

describe('coon.core.data.pageMap.OperationTest', function(t) {




// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('coon.core.data.pageMap.Operation', function() {

        t.it("prerequisites", function(t) {

            var op, exc, e, req, res,
                RecordPosition = coon.core.data.pageMap.RecordPosition,
                Operation = coon.core.data.pageMap.Operation,
                MOVE      = Operation.MOVE,
                ADD       = Operation.ADD,
                REMOVE    = Operation.REMOVE,
                from      = RecordPosition.create(1, 0),
                to        = RecordPosition.create(1, 9),
                record    = Ext.create('Ext.data.Model');


            try {Ext.create('coon.core.data.pageMap.Operation')} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('is required');
            t.expect(exc.msg.toLowerCase()).toContain('type');
            exc = undefined;

            try {Ext.create('coon.core.data.pageMap.Operation', {type : 'foo'})} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('invalid value');
            t.expect(exc.msg.toLowerCase()).toContain('type');
            exc = undefined;

            // MOVE
            op = Ext.create('coon.core.data.pageMap.Operation', {type : MOVE});
            t.expect(op).toBeTruthy();
            t.expect(op.getType()).toBe(MOVE);

            try {op.setType(ADD);} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('already set');
            t.expect(exc.msg.toLowerCase()).toContain('type');
            exc = undefined;

            // - result
            try {op.setResult('foo')} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an object');
            t.expect(exc.msg.toLowerCase()).toContain('result');
            exc = undefined;

            try {op.setResult({})} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('is required');
            t.expect(exc.msg.toLowerCase()).toContain('success');
            exc = undefined;


            try {op.setResult({success : true, from : from})} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('is required');
            t.expect(exc.msg.toLowerCase()).toContain('to');
            exc = undefined;

            try {op.setResult({success : true, from : from, to : to})} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('is required');
            t.expect(exc.msg.toLowerCase()).toContain('record');
            exc = undefined;

            try {op.setResult({success : true, from : 'foo', to : to, record : record})} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
            t.expect(exc.msg.toLowerCase()).toContain('from');
            exc = undefined;

            try {op.setResult({success : true, from : from, to : 'foo', record : record})} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
            t.expect(exc.msg.toLowerCase()).toContain('to');
            exc = undefined;

            try {op.setResult({success : true, from : from, to : to, record : 'foo'})} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
            t.expect(exc.msg.toLowerCase()).toContain('record');
            exc = undefined;

            op.setResult({success : true, from : from, to : to, record : record});
            t.expect(op.getResult()).toEqual({
                success : true, from : from, to : to, record : record
            });


            // REMOVE
            op = Ext.create('coon.core.data.pageMap.Operation', {type : REMOVE});
            t.expect(op).toBeTruthy();
            t.expect(op.getType()).toBe(REMOVE);

            try {op.setResult({success : true})} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('is required');
            t.expect(exc.msg.toLowerCase()).toContain('from');
            exc = undefined;

            try {op.setResult({success : true, from : from})} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('is required');
            t.expect(exc.msg.toLowerCase()).toContain('record');
            exc = undefined;

            op.setResult({success : true, from : from, record : record});
            t.expect(op.getResult()).toEqual({
                success : true, from : from, record : record
            });


            // ADD
            op = Ext.create('coon.core.data.pageMap.Operation', {type : ADD});
            t.expect(op).toBeTruthy();
            t.expect(op.getType()).toBe(ADD);

            try {op.setResult({success : true})} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('is required');
            t.expect(exc.msg.toLowerCase()).toContain('to');
            exc = undefined;

            try {op.setResult({success : true, to : to})} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('is required');
            t.expect(exc.msg.toLowerCase()).toContain('record');
            exc = undefined;

            op.setResult({success : true, to : to, record : record});
            t.expect(op.getResult()).toEqual({
                success : true, to : to, record : record
            });


            op = Ext.create('coon.core.data.pageMap.Operation', {
                type   : MOVE,
                result : {
                    success : false, from : from, to : to, record : record
                }
            });

            t.expect(op.getResult()).toEqual({
                success : false, from : from, to : to, record : record
            });

            t.expect(op.getType()).toBe(MOVE);


            // ADD - example for false and to not available
            op = Ext.create('coon.core.data.pageMap.Operation', {type : ADD});
            t.expect(op).toBeTruthy();
            t.expect(op.getType()).toBe(ADD);

            op.setResult({success : false, record : record});
            t.expect(op.getResult()).toEqual({
                success : false, record : record
            });


        });



    });




});
