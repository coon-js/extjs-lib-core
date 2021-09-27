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

    t.it("Make sure class definition is as expected", (t) => {

        var field  = Ext.create("coon.core.data.field.Blob");

        // sanitize
        t.expect(field instanceof Ext.data.field.Field).toBe(true);
        t.expect(field.alias).toContain("data.field.cn_core-datafieldblob");
        t.expect(field.getDefaultValue()).toBe(null);

        // needs to be called so class inits its validators
        field.validate();
        var vtors = field._validators;
        t.expect(vtors.length).toBe(0);
    });


    t.it("Make sure constructor() work as expected", (t) => {

        var field  = Ext.create("coon.core.data.field.Blob");

        field  = Ext.create("coon.core.data.field.Blob", {
            defaultValue: "a"
        });

        t.expect(field.getDefaultValue()).toBe("a");

        Ext.define("testfield", {
            extend: "coon.core.data.field.Blob",

            defaultValue: "b"
        });

        // no callback for define so it's easier to track this test running
        t.waitForMs(t.parent.TIMEOUT, () => {
            var tf = Ext.create("testfield");
            t.expect(tf.getDefaultValue()).toBe("b");
        });

    });


    t.it("Make sure convert() works as expected", (t) => {
        var field  = Ext.create("coon.core.data.field.Blob");
        t.expect(field.convert(null)).toEqual(null);

        field  = Ext.create("coon.core.data.field.Blob");
        t.expect(field.convert("a")).toEqual(null);

        field  = Ext.create("coon.core.data.field.Blob");
        t.expect(field.convert({})).toEqual(null);

        field  = Ext.create("coon.core.data.field.Blob");

        let blob = new Blob();
        t.expect(field.convert(blob)).toBe(blob);
    });

    t.it("Make sure compare() works as expected", (t) => {
        var b1 = new Blob(),
            b2 = new Blob(["foo"], {type: "text/plain"}),
            b3 = new Blob(["foo"], {type: "text/plain"});

        var field  = Ext.create("coon.core.data.field.Blob");

        t.expect(field.compare(b2, b1)).toBe(1);

        t.expect(field.compare(null, b2)).toBe(-1);
        t.expect(field.compare(b1, "a")).toBe(1);

        t.expect(field.compare("b", "a")).toBe(0);

        t.expect(field.compare(b1, b2)).toBe(-1);

        t.expect(field.compare(b2, b3)).toBe(-1);

    });


    t.it("Make sure field works in model as expected", (t) => {

        Ext.define("testmodel", {
            extend: "Ext.data.Model",

            fields: [{
                name: "blob",
                type: "cn_core-datafieldblob"
            }]

        });

        t.waitForMs(t.parent.TIMEOUT, () => {

            var m = Ext.create("testmodel"),
                b1 = new Blob(["foo"], {type: "text/plain"}),
                b2 = new Blob(["foo"], {type: "text/plain"});

            m.set("blob", b1);

            t.expect(m.get("blob")).toBe(b1);

            m = Ext.create("testmodel");

            t.expect(m.get("blob")).toEqual(null);

            t.expect(m.dirty).toBe(false);
            m.set("blob",b1);
            t.expect(m.dirty).toBe(true);

            m.commit();
            t.expect(m.dirty).toBe(false);

            m.set("blob", b1);
            t.expect(m.dirty).toBe(false);
            m.set("blob", b2);
            t.expect(m.dirty).toBe(true);

        });

    });


});
