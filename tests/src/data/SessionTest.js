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

describe('conjoon.cn_core.data.SessionTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------


    t.it('Sanitize the Session class', function(t) {
        var c = Ext.create('conjoon.cn_core.data.Session');

        t.expect(c instanceof Ext.data.Session).toBe(true);
        t.expect(c.batchVisitorClassName).toBe('Ext.data.session.BatchVisitor');
    });


    t.it('Test createVisitor() with batchVisitorClassName not loaded yet.', function(t) {
        var c = Ext.create('conjoon.cn_core.data.Session', {
            batchVisitorClassName : 'foo'
        });

        var exc = undefined;
        try {
            c.createVisitor();
        } catch(e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg).toContain('requires batchVisitorClassName to be loaded');

    });


    t.it('Test createVisitor() with batchVisitorClassName being the wrong type.', function(t) {
        var c = Ext.create('conjoon.cn_core.data.Session', {
            batchVisitorClassName : 'Ext.Panel'
        });

        var exc = undefined;
        try {
            c.createVisitor();
        } catch(e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg).toContain('needs to inherit from Ext.data.session.BatchVisitor');

    });


    t.it('Test getSaveBatch()', function(t) {

        Ext.define('MockBatchVisitor', {
            extend : 'Ext.data.session.BatchVisitor',

            getBatch : function() {
                return 'foo';
            }
        }, function() {

            var c = Ext.create('conjoon.cn_core.data.Session', {
                batchVisitorClassName : 'MockBatchVisitor'
            });

            t.expect(c.getSaveBatch()).toBe('foo');

        });


    });


    t.it('createVisitor() not returning same instance', function(t) {

        Ext.define('MockBatchVisitor', {
            extend : 'Ext.data.session.BatchVisitor',

            getBatch : function() {
                return 'foo';
            }
        }, function() {

            var c = Ext.create('conjoon.cn_core.data.Session', {
                batchVisitorClassName : 'MockBatchVisitor'
            });

            t.expect(c.createVisitor()).not.toBe(c.createVisitor());

        });


    });


});
