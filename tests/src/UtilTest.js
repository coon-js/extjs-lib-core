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

describe('conjoon.cn_core.UtilTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('conjoon.cn_core.Util', function(){

        t.it('unchain()', function(t) {


            var testMe = {1:{2:{3:{4:{5:'foo'}}}}};

            t.expect(conjoon.cn_core.Util.unchain('1.2.3.4.5', testMe)).toBe('foo');
            t.expect(conjoon.cn_core.Util.unchain('1.2.9.4.5', testMe)).toBeUndefined();

            t.expect(conjoon.cn_core.Util.unchain('1.2.3.4.5')).toBeUndefined();

        });


        t.it('listNeighbours()', function(t) {

            t.expect(conjoon.cn_core.Util.listNeighbours(['4', 5, '5', '1', '3', 6, '8'], 5)).toEqual([3, 4, 5, 6]);
            t.expect(conjoon.cn_core.Util.listNeighbours([1, 2, 3], 2)).toEqual([1, 2, 3]);

            t.expect(conjoon.cn_core.Util.listNeighbours([3, 2, 1, 2], 1)).toEqual([1, 2, 3]);

            t.expect(conjoon.cn_core.Util.listNeighbours(['4', 0, -1, 23, 1, 18, 5, '1', '3', 6, '8', '17'], 17)).toEqual([17, 18]);
        });


        t.it('groupIndices()', function(t) {

            var tests = [{
                value    : ['4', 5, '1', '3', 6, '8'],
                expected : [[1], [3, 4, 5, 6], [8]]
            }, {
                value     : ['1', 2, '3'],
                expected  : [[1, 2, 3]]
            }, {
                value     : [3, 4, 5, 4, 5],
                expected  : [[3, 4, 5]]
            }, {
                value     : ['1', 2, '3', 3, 16, 99, 4, 5, 6, 9, 10 , 11, '7', 15],
                expected  : [[1, 2, 3, 4, 5, 6, 7], [9 ,10, 11], [15, 16], [99]]
            }], test, exc, e;

            try{conjoon.cn_core.Util.groupIndices('foo');}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();


            for (var i = 0, len = tests.length; i < len; i++) {
                test = tests[i];

                t.expect(conjoon.cn_core.Util.groupIndices(test.value)).not.toBe(test.value);
                t.expect(conjoon.cn_core.Util.groupIndices(test.value)).toEqual(test.expected);
            }
        });


        t.it('createRange()', function(t) {

            var Util = conjoon.cn_core.Util,
                exc, e,
                tests = [{
                    value    : ['1', 3],
                    expected : [1, 2, 3]
                }, {
                    value     : [1, 2],
                    expected  : [1, 2]
                }, {
                    value     : [1, '5'],
                    expected  : [1, 2, 3, 4, 5]
                }, {
                    value     : [9, 12],
                    expected  : [9, 10, 11, 12]
                }, {
                    value     : [0, 2],
                    expected  : [0, 1, 2]
                }, {
                    value     : [-4, -3],
                    expected  : [-4, -3]
                }], test;


            try{Util.createRange('foo');}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be a number');
            t.expect(exc.msg.toLowerCase()).toContain('start');
            t.expect(exc.msg.toLowerCase()).not.toContain('end');

            try{Util.createRange(1, 'bar');}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be a number');
            t.expect(exc.msg.toLowerCase()).toContain('end');

            try{Util.createRange(1, -9);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('greater than');
            t.expect(exc.msg.toLowerCase()).toContain('end');



            for (var i = 0, len = tests.length; i < len; i++) {
                test = tests[i];

                t.expect(Util.createRange.apply(null, test.value)).toEqual(test.expected);
            }
        });


})});
