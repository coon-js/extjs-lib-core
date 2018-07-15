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

describe('conjoon.cn_core.data.pageMap.OperationTest', function(t) {




// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('conjoon.cn_core.data.pageMap.Operation', function() {

        t.it("prerequisites", function(t) {

            var op, exc, e, req, res,
                RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition,
                Operation = conjoon.cn_core.data.pageMap.Operation,
                MOVE      = Operation.MOVE,
                ADD       = Operation.ADD,
                REMOVE    = Operation.REMOVE,
                from      = RecordPosition.create(1, 0),
                to        = RecordPosition.create(1, 9),
                record    = Ext.create('Ext.data.Model');


            try {Ext.create('conjoon.cn_core.data.pageMap.Operation')} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('is required');
            t.expect(exc.msg.toLowerCase()).toContain('type');
            exc = undefined;

            try {Ext.create('conjoon.cn_core.data.pageMap.Operation', {type : 'foo'})} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('invalid value');
            t.expect(exc.msg.toLowerCase()).toContain('type');
            exc = undefined;

            // MOVE
            op = Ext.create('conjoon.cn_core.data.pageMap.Operation', {type : MOVE});
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
            op = Ext.create('conjoon.cn_core.data.pageMap.Operation', {type : REMOVE});
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
            op = Ext.create('conjoon.cn_core.data.pageMap.Operation', {type : ADD});
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


            op = Ext.create('conjoon.cn_core.data.pageMap.Operation', {
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
            op = Ext.create('conjoon.cn_core.data.pageMap.Operation', {type : ADD});
            t.expect(op).toBeTruthy();
            t.expect(op.getType()).toBe(ADD);

            op.setResult({success : false, record : record});
            t.expect(op.getResult()).toEqual({
                success : false, record : record
            });


        });



    });




});
