/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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

StartTest((t) => {


    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------

    t.requireOk("coon.core.data.validator.EmailAddress", () => {

        t.it("Make sure class definition is as expected", (t) => {

            var field  = Ext.create("coon.core.data.field.EmailAddress");

            // sanitize
            t.expect(field instanceof Ext.data.field.Field).toBe(true);
            t.expect(field.alias).toContain("data.field.cn_core-datafieldemailaddress");
            t.expect(field.getDefaultValue()).toEqual(null);

            // needs to be called so class inits its validators
            field.validate();
            var vtors = field._validators;
            t.expect(vtors.length).toBe(0);
        });


        t.it("Make sure constructor() work as expected", (t) => {

            var field  = Ext.create("coon.core.data.field.EmailAddress");
            var field2 = Ext.create("coon.core.data.field.EmailAddress");

            t.expect(field.getDefaultValue()).toEqual(null);
            t.expect(field2.getDefaultValue()).toEqual(null);
            t.expect(field.getDefaultValue() === field2.getDefaultValue()).toBe(true);

            field  = Ext.create("coon.core.data.field.EmailAddress", {
                defaultValue: "a"
            });

            t.expect(field.getDefaultValue()).toBe("a");

            Ext.define("testfield", {
                extend: "coon.core.data.field.EmailAddress",

                defaultValue: "b"
            });

            t.waitForMs(t.parent.TIMEOUT, () => {
                var tf = Ext.create("testfield");
                t.expect(tf.getDefaultValue()).toBe("b");
            });

        });


        t.it("Make sure convert() works as expected", (t) => {
            var field  = Ext.create("coon.core.data.field.EmailAddress");
            t.expect(field.convert(null)).toBe(null);

            field  = Ext.create("coon.core.data.field.EmailAddress");
            t.expect(field.convert({address: "a"})).toEqual({address: "a", name: "a"});

            field  = Ext.create("coon.core.data.field.EmailAddress");
            t.expect(field.convert("b")).toEqual(
                {address: "b", name: "b"}
            );

            field  = Ext.create("coon.core.data.field.EmailAddress");
            t.expect(field.convert("foo")).toEqual({address: "foo", name: "foo"});

        });


        t.it("Make sure serialize() works as expected", (t) => {
            var field  = Ext.create("coon.core.data.field.EmailAddress");

            t.expect(field.serialize("foo")).toBe(null);

            t.expect(field.serialize({address: "a", name: "a"})).toBe(
                "{\"address\":\"a\",\"name\":\"a\"}"
            );

        });


        t.it("Make sure compare() works as expected", (t) => {
            var field  = Ext.create("coon.core.data.field.EmailAddress");

            t.expect(field.compare(null, "foo")).toBe(0);

            t.expect(field.compare({}, {})).toBe(0);

            t.expect(field.compare(null, {address: "a"})).toBe(-1);
            t.expect(field.compare({address: "a"}, {address: "a"})).toBe(0);
            t.expect(field.compare({address: "a"}, null)).toBe(1);

            t.expect(field.compare({address: "a"}, {address: "a", name: "b"})).toBe(-1);
            t.expect(field.compare({address: "b"}, {address: "a", name: "b"})).toBe(-1);

            t.expect(field.compare({address: "b", name: "c"}, {address: "b"})).toBe(1);

            t.expect(field.compare(
                {address: "a", name: "A"}, {address: "a", name: "foo"}
            )).toBe(1);

            t.expect(field.compare(
                {address: "a", name: "A"}, {address: "A", name: "FoO"}
            )).toBe(1);

        });


        t.it("Make sure field works in model as expected", (t) => {

            Ext.define("testmodel", {
                extend: "Ext.data.Model",

                fields: [{
                    name: "address",
                    type: "cn_core-datafieldemailaddress"
                }],

                validators: {
                    address: [{
                        type: "cn_core-datavalidatoremailaddress",
                        allowEmpty: true

                    }]
                }
            });

            t.waitForMs(t.parent.TIMEOUT, () => {

                var m = Ext.create("testmodel");
                var d = {address: "g"};
                m.set("address", d);
                d.address = "a";
                t.expect(m.get("address")).toEqual({address: "g", name: "g"});

                m.isValid();
                var vtors = m.getField("address")._validators;
                t.expect(vtors.length).toBe(1);
                t.expect(vtors[0] instanceof coon.core.data.validator.EmailAddress).toBe(true);
                t.expect(vtors[0].getAllowEmpty()).toBe(true);

                m = Ext.create("testmodel");

                t.expect(m.get("address")).toEqual(null);

                t.expect(m.dirty).toBe(false);
                m.set("address", {address: "b", name: "abc"});
                t.expect(m.isValid()).toBe(true);
                t.expect(m.dirty).toBe(true);
                t.expect(m.get("address")).toEqual(
                    {address: "b", name: "abc"}
                );
                m.commit();
                t.expect(m.dirty).toBe(false);
                t.expect(m.get("address")).toEqual(
                    {address: "b", name: "abc"}
                );
                m.set("address",
                    {address: "b", name: "abc"}
                );
                t.expect(m.dirty).toBe(false);
                m.set("address",
                    {address: "ab", name: "a"}
                );
                t.expect(m.dirty).toBe(true);
                m.set("address",
                    {addressw: "ab", name: "a"}
                );
                // gets converted to NULL since address is missing
                t.expect(m.isValid()).toBe(true);
                vtors[0].setAllowEmpty(false);
                m.getValidation(true);
                t.expect(m.isValid()).toBe(false);

                m.set("address", "abc");
                t.expect(m.get("address")).toEqual(
                    {address: "abc", name: "abc"}
                );

            });

        });

    });


});
