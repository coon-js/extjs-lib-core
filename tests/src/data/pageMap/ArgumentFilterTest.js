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

describe('conjoon.cn_core.data.pageMap.ArgumentFilterTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    /**
     * filterDirectionValue
     */
    t.it('filterDirectionValue()', function(t) {
        let exc, e,
            filter = Ext.create('conjoon.cn_core.data.pageMap.ArgumentFilter');
        try{filter.filterDirectionValue();}catch (e) {exc = e};

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be -1 or 1");
        t.expect(exc.msg.toLowerCase()).toContain("direction");
        exc = undefined;

        t.expect(filter.filterDirectionValue('1')).toBe(1);
        t.expect(filter.filterDirectionValue(-1)).toBe(-1);

    });


    /**
     * filterPageValue
     */
    t.it('filterPageValue()', function(t) {
        let exc, e,
            filter = Ext.create('conjoon.cn_core.data.pageMap.ArgumentFilter');
        try{filter.filterPageValue();}catch (e) {exc = e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be a number");
        t.expect(exc.msg.toLowerCase()).toContain("page");
        exc = undefined;

        t.expect(filter.filterPageValue('1')).toBe(1);
        t.expect(filter.filterPageValue(432)).toBe(432);

    });


    /**
     * filterPageValue
     */
    t.it('filterPageMapValue()', function(t) {
        let exc, e, pageMap,
            filter = Ext.create('conjoon.cn_core.data.pageMap.ArgumentFilter');
        try{filter.filterPageMapValue();}catch (e) {exc = e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");
        t.expect(exc.msg.toLowerCase()).toContain("pagemap");
        exc = undefined;

        pageMap = Ext.create('Ext.data.PageMap');

        t.expect(filter.filterPageMapValue(pageMap)).toBe(pageMap);
    });



});
