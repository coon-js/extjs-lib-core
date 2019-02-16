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

describe('conjoon.cn_core.data.proxy.RestFormTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.it('Make sure class definition is as expected', function(t) {
        var proxy = Ext.create('conjoon.cn_core.data.proxy.RestForm');

        // sanitize
        t.expect(proxy instanceof Ext.data.proxy.Rest).toBe(true);
        t.expect(proxy.alias).toContain('proxy.cn_core-dataproxyrestform');
        t.expect(proxy.getWriter() instanceof conjoon.cn_core.data.writer.FormData).toBe(true);

    });


    t.it('Test buildRequest() with invalid operation type', function(t) {
        var proxy = Ext.create('conjoon.cn_core.data.proxy.RestForm',{
            url :'foo'
        });

        var exc = undefined;
        try {
            var ret = proxy.buildRequest(Ext.create('Ext.data.operation.Create'));
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg).toContain("needs an operation of the type");

    });


    t.it('Test buildRequest() with valid operation type', function(t) {
        var proxy = Ext.create('conjoon.cn_core.data.proxy.RestForm',{
            url :'foo'
        });

        var ret = proxy.buildRequest(Ext.create('conjoon.cn_core.data.operation.Upload'));

        t.expect(ret instanceof conjoon.cn_core.data.FormDataRequest).toBe(true);

    });


    t.it('Test sendRequest()', function(t) {
        let proxy = Ext.create('conjoon.cn_core.data.proxy.RestForm',{
                url :'foo'
            });

        req = Ext.create('conjoon.cn_core.data.FormDataRequest', {
            action : 'create', url : 'CREATE'});
        ret = proxy.sendRequest(req);
        t.isInstanceOf(ret.getRawRequest(), 'conjoon.cn_core.data.request.FormData');
        t.expect(ret).toBe(req);

        req = Ext.create('conjoon.cn_core.data.FormDataRequest', {
            url : 'NIL'});
        ret = proxy.sendRequest(req);
        t.expect(ret).toBe(req);
        t.isInstanceOf(ret.getRawRequest(), 'Ext.data.request.Ajax');


        req = Ext.create('conjoon.cn_core.data.FormDataRequest', {
            action : 'read', url : 'READ'});
        ret = proxy.sendRequest(req);
        t.expect(ret).toBe(req);
        t.isInstanceOf(ret.getRawRequest(), 'Ext.data.request.Ajax');

        req = Ext.create('conjoon.cn_core.data.FormDataRequest', {
            action : 'destroy', url : 'DESTROY'});

        ret = proxy.sendRequest(req);
        t.expect(ret).toBe(req);
        t.isInstanceOf(ret.getRawRequest(), 'Ext.data.request.Ajax');

    });


    t.it('Test createOperation()', function(t) {
        var proxy = Ext.create('conjoon.cn_core.data.proxy.RestForm',{
            url :'foo'
        });

        var ret = proxy.createOperation('create');

        t.expect(ret instanceof conjoon.cn_core.data.operation.Upload).toBe(true);

    });
});
