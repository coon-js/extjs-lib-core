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

describe('conjoon.cn_core.util.MimeTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('conjoon.cn_core.util.Mime', function(){

        t.it('Test isImage()', function(t) {

            var testData = [{
                value    : 'IMAGE/',
                expected : false
            }, {
                value    : 'IMAGE/gif',
                expected : true
            }, {
                value    : 'image/foo',
                expected : true
            }, {
                value    : 'IMAGE_bar',
                expected : false
            }, {
                value    : 'IMAGE-PNG',
                expected : false
            }];

            for (var i = 0, len = testData.length; i < len; i++) {
                t.expect(
                    conjoon.cn_core.util.Mime.isImage(testData[i].value)
                ).toBe(testData[i].expected);

            }
        });


    });

});
