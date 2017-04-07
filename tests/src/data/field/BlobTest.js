/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * lib-cn_core
 * Copyright (C) 2017 Thorsten Suckow-Homberg/conjoon.org
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

describe('conjoon.cn_core.data.field.BlobTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.it('Make sure class definition is as expected', function(t) {

        var field  = Ext.create('conjoon.cn_core.data.field.Blob');

        // sanitize
        t.expect(field instanceof Ext.data.field.Field).toBe(true);
        t.expect(field.alias).toContain('data.field.cn_core-datafieldblob');
        t.expect(field.getDefaultValue()).toBe(null);

        // needs to be called so class inits its validators
        field.validate();
        var vtors = field._validators;
        t.expect(vtors.length).toBe(0);
    });


    t.it('Make sure constructor() work as expected', function(t) {

        var field  = Ext.create('conjoon.cn_core.data.field.Blob');

        var field  = Ext.create('conjoon.cn_core.data.field.Blob', {
            defaultValue : 'a'
        });

        t.expect(field.getDefaultValue()).toBe('a');

        Ext.define('testfield', {
            extend : 'conjoon.cn_core.data.field.Blob',

            defaultValue : 'b'
        });

        // no callback for define so it's easier to track this test running
        t.waitForMs(500, function() {
            var tf = Ext.create('testfield');
            t.expect(tf.getDefaultValue()).toBe('b');
        })

    });


    t.it('Make sure convert() works as expected', function(t) {
        var field  = Ext.create('conjoon.cn_core.data.field.Blob');
        t.expect(field.convert(null)).toEqual(null);

        var field  = Ext.create('conjoon.cn_core.data.field.Blob');
        t.expect(field.convert('a')).toEqual(null);

        var field  = Ext.create('conjoon.cn_core.data.field.Blob');
        t.expect(field.convert({})).toEqual(null);

        var field  = Ext.create('conjoon.cn_core.data.field.Blob'),
            blob   = new Blob();

        t.expect(field.convert(blob)).toBe(blob);
    });

    t.it('Make sure compare() works as expected', function(t) {
        var b1 = new Blob(),
            b2 = new Blob(['foo'], {type: 'text/plain'}),
            b3 = new Blob(['foo'], {type: 'text/plain'});

        var field  = Ext.create('conjoon.cn_core.data.field.Blob');

        t.expect(field.compare(b2, b1)).toBe(1);

        t.expect(field.compare(null, b2)).toBe(-1);
        t.expect(field.compare(b1, 'a')).toBe(1);

        t.expect(field.compare('b', 'a')).toBe(0);

        t.expect(field.compare(b1, b2)).toBe(-1);

        t.expect(field.compare(b2, b3)).toBe(-1);

    });



    t.it('Make sure field works in model as expected', function(t) {

        Ext.define('testmodel', {
            extend : 'Ext.data.Model',

            fields : [{
                name : 'blob',
                type : 'cn_core-datafieldblob'
            }]

        });

        t.waitForMs(500, function() {

            var m = Ext.create('testmodel'),
                b1 = new Blob(['foo'], {type: 'text/plain'}),
                b2 = new Blob(['foo'], {type: 'text/plain'});

            m.set('blob', b1);

            t.expect(m.get('blob')).toBe(b1);

            var m = Ext.create('testmodel');

            t.expect(m.get('blob')).toEqual(null);

            t.expect(m.dirty).toBe(false);
            m.set('blob',b1);
            t.expect(m.dirty).toBe(true);

            m.commit();
            t.expect(m.dirty).toBe(false);

            m.set('blob', b1);
            t.expect(m.dirty).toBe(false);
            m.set('blob', b2);
            t.expect(m.dirty).toBe(true);

        })

    });


});
