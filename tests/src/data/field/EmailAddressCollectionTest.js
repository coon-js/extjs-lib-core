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

describe('conjoon.cn_core.data.field.EmailAddressCollectionTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.it('Make sure class definition is as expected', function(t) {

        var field  = Ext.create('conjoon.cn_core.data.field.EmailAddressCollection');

        // sanitize
        t.expect(field instanceof Ext.data.field.Field).toBe(true);
        t.expect(field.alias).toContain('data.field.cn_core-datafieldemailaddresscollection');
        t.expect(field.getDefaultValue()).toEqual([]);

        // needs to be called so class inits its validators
        field.validate();
        var vtors = field._validators;
        t.expect(vtors.length).toBe(0);
    });


    t.it('Make sure constructor() work as expected', function(t) {

        var field  = Ext.create('conjoon.cn_core.data.field.EmailAddressCollection');
        var field2 = Ext.create('conjoon.cn_core.data.field.EmailAddressCollection');

        t.expect(field.getDefaultValue()).toEqual([]);
        t.expect(field2.getDefaultValue()).toEqual([]);
        t.expect(field.getDefaultValue() === field2.getDefaultValue()).toBe(false);

        var field  = Ext.create('conjoon.cn_core.data.field.EmailAddressCollection', {
            defaultValue : 'a'
        });

        t.expect(field.getDefaultValue()).toBe('a');

        Ext.define('testfield', {
            extend : 'conjoon.cn_core.data.field.EmailAddressCollection',

            defaultValue : 'b'
        });

        t.waitForMs(500, function() {
            var tf = Ext.create('testfield');
            t.expect(tf.getDefaultValue()).toBe('b');
        })

    });


    t.it('Make sure convert() works as expected', function(t) {
        var field  = Ext.create('conjoon.cn_core.data.field.EmailAddressCollection');
        t.expect(field.convert(null)).toEqual([]);

        var field  = Ext.create('conjoon.cn_core.data.field.EmailAddressCollection');
        t.expect(field.convert([{address : 'a'}])).toEqual([{address : 'a', name : 'a'}]);

        var field  = Ext.create('conjoon.cn_core.data.field.EmailAddressCollection');
        t.expect(field.convert([{address : 'a'}, 'b'])).toEqual(
            [{address : 'a', name : 'a'}, {address : 'b', name : 'b'}]
        );

        var field  = Ext.create('conjoon.cn_core.data.field.EmailAddressCollection');
        t.expect(field.convert('foo')).toEqual([{address : 'foo', name : 'foo'}]);

    });


    t.it('Make sure serialize() works as expected', function(t) {
        var field  = Ext.create('conjoon.cn_core.data.field.EmailAddressCollection');

        t.expect(field.serialize('foo')).toBe("[]");

        t.expect(field.serialize([{address : 'a', name : 'a'}])).toBe(
            "[{\"address\":\"a\",\"name\":\"a\"}]"
        );

    });


    t.it('Make sure compare() works as expected', function(t) {
        var field  = Ext.create('conjoon.cn_core.data.field.EmailAddressCollection');

        t.expect(field.compare(null, 'foo')).toBe(0);

        t.expect(field.compare([1, 2], [3, 3])).toBe(-1);

        t.expect(field.compare(null, [{address : 'a'}])).toBe(-1);
        t.expect(field.compare([{address : 'a'}], [{address : 'a'}])).toBe(0);
        t.expect(field.compare([{address : 'a'}], null)).toBe(1);

        t.expect(field.compare([{address : 'a'}], [{address : 'a', name: 'b'}])).toBe(0);
        t.expect(field.compare([{address : 'b'}], [{address : 'a', name: 'b'}])).not.toBe(0);

        t.expect(field.compare(
            [{address : 'a'}, {address : 'b', name : 'b'}, {address : 'c', name : 'dfdf'}],
            [{address : 'a', name : 'foo'}, {address : 'b', name : null}, {address : 'c', name : 'dfdf'}]
        )).toBe(0);

    });


    t.requireOk('conjoon.cn_core.data.validator.EmailAddressCollection', function() {

        t.it('Make sure field works in model as expected', function(t) {

            Ext.define('testmodel', {
                extend : 'Ext.data.Model',

                fields : [{
                    name : 'addresses',
                    type : 'cn_core-datafieldemailaddresscollection'
                }],

                validators : {
                    addresses : [{
                        type : 'cn_core-datavalidatoremailaddresscollection',
                        allowEmpty : true

                    }]
                }
            });

            t.waitForMs(500, function() {

                var m = Ext.create('testmodel');
                var d = [{address : 'g'}];
                m.set('addresses', d);
                d[0].address = 'a';
                t.expect(m.get('addresses')).toEqual([{address : 'g', name :'g'}]);

                m.isValid();
                var vtors = m.getField('addresses')._validators;
                t.expect(vtors.length).toBe(1);
                t.expect(vtors[0] instanceof conjoon.cn_core.data.validator.EmailAddressCollection).toBe(true);
                t.expect(vtors[0].getAllowEmpty()).toBe(true);



                var m = Ext.create('testmodel');

                t.expect(m.get('addresses')).toEqual([]);

                t.expect(m.dirty).toBe(false);
                m.set('addresses', [{address : 'a'}, {address : 'b', name : 'abc'}]);
                t.expect(m.isValid()).toBe(true);
                t.expect(m.dirty).toBe(true);
                t.expect(m.get('addresses')).toEqual(
                    [{address : 'a', name : 'a'}, {address : 'b', name : 'abc'}]
                );
                m.commit();
                t.expect(m.dirty).toBe(false);
                t.expect(m.get('addresses')).toEqual(
                    [{address : 'a', name : 'a'}, {address : 'b', name : 'abc'}]
                );
                m.set('addresses',
                    [{address : 'a', name : 'a'}, {address : 'b', name : 'abc'}]
                );
                t.expect(m.dirty).toBe(false);
                m.set('addresses',
                    [{address : 'ab', name : 'a'}, {address : 'b', name : 'abc'}]
                );
                t.expect(m.dirty).toBe(true);
                m.set('addresses',
                    [{addressw : 'ab', name : 'a'}, {address : 'b', name : 'abc'}]
                );
                t.expect(m.isValid()).toBe(false);

                m.set('addresses', 'abc');
                t.expect(m.get('addresses')).toEqual(
                    [{address : 'abc', name : 'abc'}]
                );

            })

        });

    });


});
