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

describe('conjoon.cn_core.util.DateTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('conjoon.cn_core.util.Date', function(){

        t.it('getHumanReadableDate()', function(t) {

            let dt;

            t.expect(conjoon.cn_core.util.Date.getHumanReadableDate(new Date)).toBe(
                Ext.util.Format.date(new Date(), "H:i"));

            dt = Ext.Date.subtract(new Date(), Ext.Date.DAY, 1);

            t.expect(conjoon.cn_core.util.Date.getHumanReadableDate(dt)).toContain(
                Ext.util.Format.date(dt, "l"));

            dt = Ext.Date.subtract(new Date(), Ext.Date.DAY, 7);

            t.expect(conjoon.cn_core.util.Date.getHumanReadableDate(dt)).toBe(
                Ext.util.Format.date(dt, "d.m.Y, H:i"));
        });


    });

});
