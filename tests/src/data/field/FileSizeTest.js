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

describe('conjoon.cn_core.data.field.FileSizeTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.it('Make sure class definition is as expected', function(t) {

        var field  = Ext.create('conjoon.cn_core.data.field.FileSize');

        // sanitize
        t.expect(field instanceof Ext.data.field.Field).toBe(true);
        t.expect(field.alias).toContain('data.field.cn_core-datafieldfilesize');
        t.expect(field.getSortType().name).toBe('asInt');
    });



    t.it('Make sure convert() works as expected', function(t) {
        var field  = Ext.create('conjoon.cn_core.data.field.FileSize');
        t.expect(field.convert(10000)).toEqual(Ext.util.Format.fileSize(10000));
    });


});
