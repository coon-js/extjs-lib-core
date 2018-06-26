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

describe('conjoon.cn_core.data.pageMap.operation.OperationTest', function(t) {

    var createRequest = function() {

        return Ext.create('conjoon.cn_core.data.pageMap.operation.Request');

    },
    createResult = function() {

        return Ext.create('conjoon.cn_core.data.pageMap.operation.Result', {
            success : true,
            reason  : -1
        });

    };

// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------




     t.it("prerequisites", function(t) {

         var op, exc, e, req, res;

         try {Ext.create('conjoon.cn_core.data.pageMap.operation.Operation')} catch (e) {exc = e;}
         t.expect(exc).toBeDefined();
         t.expect(exc.msg).toBeDefined();
         t.expect(exc.msg.toLowerCase()).toContain('is required');
         t.expect(exc.msg.toLowerCase()).toContain('request');
         exc = undefined;

         try {Ext.create('conjoon.cn_core.data.pageMap.operation.Operation', {request : null})} catch (e) {exc = e;}
         t.expect(exc).toBeDefined();
         t.expect(exc.msg).toBeDefined();
         t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
         t.expect(exc.msg.toLowerCase()).toContain('request');
         exc = undefined;

         req = createRequest();
         op = Ext.create('conjoon.cn_core.data.pageMap.operation.Operation', {
            request : req
         });

         t.expect(op instanceof conjoon.cn_core.data.pageMap.operation.Operation).toBe(true);

         try {op.setRequest(createRequest());} catch (e) {exc = e;}
         t.expect(exc).toBeDefined();
         t.expect(exc.msg).toBeDefined();
         t.expect(exc.msg.toLowerCase()).toContain('already set');
         t.expect(exc.msg.toLowerCase()).toContain('request');
         exc = undefined;

         t.expect(req).toBe(op.getRequest());

         res = createResult();
         op.setResult(res);
         t.expect(op.getResult()).toBe(res);

         try {op.setResult(createResult());} catch (e) {exc = e;}
         t.expect(exc).toBeDefined();
         t.expect(exc.msg).toBeDefined();
         t.expect(exc.msg.toLowerCase()).toContain('already set');
         t.expect(exc.msg.toLowerCase()).toContain('result');
         exc = undefined;

     });



});
