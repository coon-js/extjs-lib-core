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

describe('conjoon.cn_core.data.pageMap.operation.ResultTest', function(t) {



// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------


    t.it("prerequisites", function(t) {

        var op, exc, e;

        try {Ext.create('conjoon.cn_core.data.pageMap.operation.Result')} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('is required');
        t.expect(exc.msg.toLowerCase()).toContain('success');
        exc = undefined;

        try {Ext.create('conjoon.cn_core.data.pageMap.operation.Result', {success : true})} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('is required');
        t.expect(exc.msg.toLowerCase()).toContain('reason');
        exc = undefined;

        try {Ext.create('conjoon.cn_core.data.pageMap.operation.Result', {success : 'o', reason : 'o'})} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('must be a boolean value');
        t.expect(exc.msg.toLowerCase()).toContain('success');
        exc = undefined;

        try {Ext.create('conjoon.cn_core.data.pageMap.operation.Result', {success : true, reason : null})} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('must not be');
        t.expect(exc.msg.toLowerCase()).toContain('reason');
        exc = undefined;

        op = Ext.create('conjoon.cn_core.data.pageMap.operation.Result', {
            success : true,
            reason  : 'foo'
        });

        t.expect(op instanceof conjoon.cn_core.data.pageMap.operation.Result).toBe(true);

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
