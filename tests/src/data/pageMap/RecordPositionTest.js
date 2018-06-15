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

describe('conjoon.cn_core.data.pageMap.RecordPositionTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.it('constructor()', function(t) {

        var exc, e;

        try {
            Ext.create('conjoon.cn_core.data.pageMap.RecordPosition');
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('needs both');

        try {
            Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                page : 2
            });
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('needs both');


        try {
            Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                index : 2
            });
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('needs both');
    });


    t.it('applyPage()', function(t) {

        var exc, e, position;

        try {
            Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                page  : 'u',
                index : 1
            });
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('page');
        t.expect(exc.msg.toLowerCase()).toContain('must be a number');


        try {
            Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                page  : 0,
                index : 1
            });
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('page');
        t.expect(exc.msg.toLowerCase()).toContain('must not be less than');


        var position = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
            page  : 2,
            index : 1
        });

        try {
            position.setPage(4);
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('page');
        t.expect(exc.msg.toLowerCase()).toContain('was already defined');

    });


    t.it('applyIndex()', function(t) {

        var exc, e, position;

        try {
            Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                index  : 'u',
                page : 1
            });
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('index');
        t.expect(exc.msg.toLowerCase()).toContain('must be a number');


        try {
            Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                page  : 1,
                index : -1
            });
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('index');
        t.expect(exc.msg.toLowerCase()).toContain('must not be less than');


        var position = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
            page  : 2,
            index : 1
        });

        try {
            position.setIndex(4);
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('index');
        t.expect(exc.msg.toLowerCase()).toContain('was already defined');

    });


    t.it('getter', function(t) {

        var position = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
              page  : 7879,
              index : 4000
        });

        t.expect(position.getPage()).toBe(7879);
        t.expect(position.getIndex()).toBe(4000);

    });


    t.it('equalTo()', function(t) {

        var posLeft = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                page  : 3,
                index : 2
            }),
            posRight = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                page  : 3,
                index : 2
            }),
            posNope_1 = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                page  : 4,
                index : 2
            }),
            posNope_2 = Ext.create('conjoon.cn_core.data.pageMap.RecordPosition', {
                page  : 3,
                index : 5
            }), exc, e;


        try {
            posLeft.equalTo([1]);
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');


        t.expect(posLeft.equalTo(posLeft)).toBe(true);
        t.expect(posLeft.equalTo(posRight)).toBe(true);
        t.expect(posRight.equalTo(posLeft)).toBe(true);
        t.expect(posLeft.equalTo(posNope_1)).toBe(false);
        t.expect(posLeft.equalTo(posNope_2)).toBe(false);
        t.expect(posNope_1.equalTo(posNope_2)).toBe(false);

    });



});
