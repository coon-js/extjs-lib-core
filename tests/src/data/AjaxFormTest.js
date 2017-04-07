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

describe('conjoon.cn_core.data.AjaxFormTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('conjoon.cn_core.data.AjaxForm', function() {

        t.it('Sanitize the AjaxForm class', function(t) {

            t.expect(
                conjoon.cn_core.data.AjaxForm instanceof Ext.data.Connection
            ).toBe(true);

            t.expect(conjoon.cn_core.data.AjaxForm.getAutoAbort()).toBe(false);
        });


        t.it('Test setOptions()', function(t) {

            var formData = new FormData(),
                ret = conjoon.cn_core.data.AjaxForm.setOptions({
                    url      : 'foo.bar',
                    formData : formData
                });

            t.expect(ret.data).toBe(formData);
        });


        t.it('Test createRequest()', function(t) {

            var ret = conjoon.cn_core.data.AjaxForm.createRequest({});

            t.expect(ret instanceof conjoon.cn_core.data.request.FormData).toBe(true);
        });

    });




});
