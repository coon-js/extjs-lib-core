/**
 * conjoon
 * (c) 2007-2019 conjoon.org
 * licensing@conjoon.org
 *
 * lib-cn_core
 * Copyright (C) 2019 Thorsten Suckow-Homberg/conjoon.org
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

describe('conjoon.cn_core.data.field.EmailAddressTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('conjoon.cn_core.data.validator.EmailAddress', function() {

        t.it('Make sure class definition is as expected', function(t) {

            var field  = Ext.create('conjoon.cn_core.data.field.EmailAddress');

            // sanitize
            t.expect(field instanceof Ext.data.field.Field).toBe(true);
            t.expect(field.alias).toContain('data.field.cn_core-datafieldemailaddress');
            t.expect(field.getDefaultValue()).toEqual(null);

            // needs to be called so class inits its validators
            field.validate();
            var vtors = field._validators;
            t.expect(vtors.length).toBe(0);
        });


        t.it('Make sure constructor() work as expected', function(t) {

            var field  = Ext.create('conjoon.cn_core.data.field.EmailAddress');
            var field2 = Ext.create('conjoon.cn_core.data.field.EmailAddress');

            t.expect(field.getDefaultValue()).toEqual(null);
            t.expect(field2.getDefaultValue()).toEqual(null);
            t.expect(field.getDefaultValue() === field2.getDefaultValue()).toBe(true);

            var field  = Ext.create('conjoon.cn_core.data.field.EmailAddress', {
                defaultValue : 'a'
            });

            t.expect(field.getDefaultValue()).toBe('a');

            Ext.define('testfield', {
                extend : 'conjoon.cn_core.data.field.EmailAddress',

                defaultValue : 'b'
            });

            t.waitForMs(500, function() {
                var tf = Ext.create('testfield');
                t.expect(tf.getDefaultValue()).toBe('b');
            })

        });


        t.it('Make sure convert() works as expected', function(t) {
            var field  = Ext.create('conjoon.cn_core.data.field.EmailAddress');
            t.expect(field.convert(null)).toBe(null);

            var field  = Ext.create('conjoon.cn_core.data.field.EmailAddress');
            t.expect(field.convert({address : 'a'})).toEqual({address : 'a', name : 'a'});

            var field  = Ext.create('conjoon.cn_core.data.field.EmailAddress');
            t.expect(field.convert('b')).toEqual(
                {address : 'b', name : 'b'}
            );

            var field  = Ext.create('conjoon.cn_core.data.field.EmailAddress');
            t.expect(field.convert('foo')).toEqual({address : 'foo', name : 'foo'});

        });


        t.it('Make sure serialize() works as expected', function(t) {
            var field  = Ext.create('conjoon.cn_core.data.field.EmailAddress');

            t.expect(field.serialize('foo')).toBe(null);

            t.expect(field.serialize({address : 'a', name : 'a'})).toBe(
                "{\"address\":\"a\",\"name\":\"a\"}"
            );

        });


        t.it('Make sure compare() works as expected', function(t) {
            var field  = Ext.create('conjoon.cn_core.data.field.EmailAddress');

            t.expect(field.compare(null, 'foo')).toBe(0);

            t.expect(field.compare({}, {})).toBe(0);

            t.expect(field.compare(null, {address : 'a'})).toBe(-1);
            t.expect(field.compare({address : 'a'}, {address : 'a'})).toBe(0);
            t.expect(field.compare({address : 'a'}, null)).toBe(1);

            t.expect(field.compare({address : 'a'}, {address : 'a', name: 'b'})).toBe(-1);
            t.expect(field.compare({address : 'b'}, {address : 'a', name: 'b'})).toBe(-1);

            t.expect(field.compare({address : 'b', name : 'c'}, {address : 'b'})).toBe(1);

            t.expect(field.compare(
                {address : 'a', name : 'A'}, {address : 'a', name : 'foo'}
            )).toBe(1);

            t.expect(field.compare(
                {address : 'a', name : 'A'}, {address : 'A', name : 'FoO'}
            )).toBe(1);

        });




        t.it('Make sure field works in model as expected', function(t) {

            Ext.define('testmodel', {
                extend : 'Ext.data.Model',

                fields : [{
                    name : 'address',
                    type : 'cn_core-datafieldemailaddress'
                }],

                validators : {
                    address : [{
                        type : 'cn_core-datavalidatoremailaddress',
                        allowEmpty : true

                    }]
                }
            });

            t.waitForMs(500, function() {

                var m = Ext.create('testmodel');
                var d = {address : 'g'};
                m.set('address', d);
                d.address = 'a';
                t.expect(m.get('address')).toEqual({address : 'g', name :'g'});

                m.isValid();
                var vtors = m.getField('address')._validators;
                t.expect(vtors.length).toBe(1);
                t.expect(vtors[0] instanceof conjoon.cn_core.data.validator.EmailAddress).toBe(true);
                t.expect(vtors[0].getAllowEmpty()).toBe(true);

                var m = Ext.create('testmodel');

                t.expect(m.get('address')).toEqual(null);

                t.expect(m.dirty).toBe(false);
                m.set('address', {address : 'b', name : 'abc'});
                t.expect(m.isValid()).toBe(true);
                t.expect(m.dirty).toBe(true);
                t.expect(m.get('address')).toEqual(
                    {address : 'b', name : 'abc'}
                );
                m.commit();
                t.expect(m.dirty).toBe(false);
                t.expect(m.get('address')).toEqual(
                    {address : 'b', name : 'abc'}
                );
                m.set('address',
                    {address : 'b', name : 'abc'}
                );
                t.expect(m.dirty).toBe(false);
                m.set('address',
                    {address : 'ab', name : 'a'}
                );
                t.expect(m.dirty).toBe(true);
                m.set('address',
                    {addressw : 'ab', name : 'a'}
                );
                // gets converted to NULL since address is missing
                t.expect(m.isValid()).toBe(true);
                vtors[0].setAllowEmpty(false);
                m.getValidation(true);
                t.expect(m.isValid()).toBe(false);

                m.set('address', 'abc');
                t.expect(m.get('address')).toEqual(
                    {address : 'abc', name : 'abc'}
                );

            })

        });

    });


});
