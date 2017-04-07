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

describe('conjoon.cn_core.data.FormDataRequestTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------


    t.it('Sanitize the FormDataRequest class', function(t) {

        var c = Ext.create('conjoon.cn_core.data.FormDataRequest', {
            progressCallback : 'foo',

            progressScope : 'bar',

            formData : 'formData'
        });

        t.expect(c instanceof Ext.data.Request).toBe(true);
        t.expect(c.getProgressCallback()).toBe('foo');
        t.expect(c.getProgressScope()).toBe('bar');
        t.expect(c.getFormData()).toBe('formData');

    });


});
