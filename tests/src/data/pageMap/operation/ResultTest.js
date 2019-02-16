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

describe('coon.core.data.pageMap.operation.ResultTest', function(t) {



// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------


    t.it("prerequisites", function(t) {

        var op, exc, e;

        try {Ext.create('coon.core.data.pageMap.operation.Result')} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('is required');
        t.expect(exc.msg.toLowerCase()).toContain('success');
        exc = undefined;

        try {Ext.create('coon.core.data.pageMap.operation.Result', {success : true})} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('is required');
        t.expect(exc.msg.toLowerCase()).toContain('reason');
        exc = undefined;

        try {Ext.create('coon.core.data.pageMap.operation.Result', {success : 'o', reason : 'o'})} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('must be a boolean value');
        t.expect(exc.msg.toLowerCase()).toContain('success');
        exc = undefined;

        try {Ext.create('coon.core.data.pageMap.operation.Result', {success : true, reason : null})} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('must not be');
        t.expect(exc.msg.toLowerCase()).toContain('reason');
        exc = undefined;

        op = Ext.create('coon.core.data.pageMap.operation.Result', {
            success : true,
            reason  : 'foo'
        });

        t.expect(op instanceof coon.core.data.pageMap.operation.Result).toBe(true);

        try {op.setSuccess(false);} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('already set');
        t.expect(exc.msg.toLowerCase()).toContain('success');
        exc = undefined;

        try {op.setReason('bar');} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('already set');
        t.expect(exc.msg.toLowerCase()).toContain('reason');
        exc = undefined;

        t.expect(op.getSuccess()).toBe(true);
        t.expect(op.getReason()).toBe('foo');
    });



});
