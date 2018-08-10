/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * lib-cn_core
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
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
            }),
            exc, e,
            req = Ext.create('conjoon.cn_core.data.FormDataRequest', {url : 'foo'});


        try{proxy.sendRequest(req);}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.message).toContain("does not support");
        exc = undefined;

        req = Ext.create('conjoon.cn_core.data.FormDataRequest', {
            action : 'create', url : 'foo'});
        ret = proxy.sendRequest(req);

        t.expect(ret).toBe(req);

    });


    t.it('Test createOperation()', function(t) {
        var proxy = Ext.create('conjoon.cn_core.data.proxy.RestForm',{
            url :'foo'
        });

        var ret = proxy.createOperation('create');

        t.expect(ret instanceof conjoon.cn_core.data.operation.Upload).toBe(true);

    });
});
