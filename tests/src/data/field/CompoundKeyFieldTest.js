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

describe('coon.core.data.field.CompoundKeyFieldTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.it('Make sure class definition is as expected', function(t) {

        var field  = Ext.create('coon.core.data.field.CompoundKeyField');

        // sanitize
        t.isInstanceOf(field, 'Ext.data.field.String');
        t.expect(field.alias).toContain('data.field.cn_core-datafieldcompoundkey');
        t.expect(field.critical).toBe(true);
        t.expect(field.validators).toContain('presence');
    });



    t.it('Make sure convert() works as expected', function(t) {
        var field  = Ext.create('coon.core.data.field.CompoundKeyField');

        t.expect(field.convert("")).toBeUndefined();
        t.expect(field.convert(null)).toBeUndefined();
        t.expect(field.convert(undefined)).toBeUndefined();
        t.expect(field.convert(1)).toBe("1");
        t.expect(field.convert(0)).toBe("0");
        t.expect(field.convert("foo")).toBe("foo");
    });


});
