/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * lib-cn_core
 * Copyright (C) 2016 Thorsten Suckow-Homberg/conjoon.org
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

        t.it('Test unchain()', function(t) {


            var testMe = {1:{2:{3:{4:{5:'foo'}}}}};

            t.expect(conjoon.cn_core.Util.unchain('1.2.3.4.5', testMe)).toBe('foo');
            t.expect(conjoon.cn_core.Util.unchain('1.2.9.4.5', testMe)).toBeUndefined();

            t.expect(conjoon.cn_core.Util.unchain('1.2.3.4.5')).toBeUndefined();

        });


    });

});
