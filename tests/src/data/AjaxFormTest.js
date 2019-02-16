/**
 * coon.js
 * lib-cn_core
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/coon-js/lib-cn_core
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
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
