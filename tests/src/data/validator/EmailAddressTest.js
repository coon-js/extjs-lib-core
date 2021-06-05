/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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

describe("coon.core.data.validator.EmailAddressTest", (t) => {


    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------

    t.it("Make sure class definition is as expected", (t) => {

        var vtor = Ext.create("coon.core.data.validator.EmailAddress");

        // sanitize
        t.expect(vtor instanceof Ext.data.validator.Validator).toBe(true);
        t.expect(typeof(vtor.getMessage())).toBe("string");
        t.expect(vtor.alias).toContain("data.validator.cn_core-datavalidatoremailaddress");

        vtor = null;
    });

    t.it("Make sure the validator works as expected", (t) => {

        var tests = [{
            config: {allowEmpty: true},
            data: null,
            expected: true
        }, {
            config: {allowEmpty: false},
            data: null,
            expected: false
        }, {
            data: null,
            expected: false
        }, {
            data: {test: "test"},
            expected: false
        }, {
            data: {address: "mymailaddress"},
            expected: true
        }];

        for (var i = 0, len = tests.length; i < len; i++) {
            var test   = tests[i],
                config = test.config ? test.config : undefined,
                vtor   = Ext.create(
                    "coon.core.data.validator.EmailAddress",
                    config
                );

            if (test.expected === false) {
                t.expect(vtor.validate(test.data)).toContain("Must be");
            } else {
                t.expect(vtor.validate(test.data)).toBe(test.expected);
            }

            vtor = null;
        }

    });


});
