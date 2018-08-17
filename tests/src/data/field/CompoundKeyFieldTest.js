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

describe('conjoon.cn_core.data.field.CompoundKeyFieldTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.it('Make sure class definition is as expected', function(t) {

        var field  = Ext.create('conjoon.cn_core.data.field.CompoundKeyField');

        // sanitize
        t.isInstanceOf(field, 'Ext.data.field.String');
        t.expect(field.alias).toContain('data.field.cn_core-datafieldcompoundkey');
        t.expect(field.critical).toBe(true);
        t.expect(field.validators).toContain('presence');
    });



    t.it('Make sure convert() works as expected', function(t) {
        var field  = Ext.create('conjoon.cn_core.data.field.CompoundKeyField');

        t.expect(field.convert("")).toBeUndefined();
        t.expect(field.convert(null)).toBeUndefined();
        t.expect(field.convert(undefined)).toBeUndefined();
        t.expect(field.convert(1)).toBe("1");
        t.expect(field.convert(0)).toBe("0");
        t.expect(field.convert("foo")).toBe("foo");
    });


});
