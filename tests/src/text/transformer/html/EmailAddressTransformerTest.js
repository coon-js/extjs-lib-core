/**
 * coon.js
 * lib-cn_core
 * Copyright (C) 2020 Thorsten Suckow-Homberg https://github.com/coon-js/lib-cn_core
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

describe("coon.core.text.transformer.html.EmailAddressTransformerTest", function (t) {


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------

    t.requireOk("coon.core.text.transformer.html.EmailAddressTransformer", function (){

        t.it("transform()", function (t) {

            let transformer = Ext.create("coon.core.text.transformer.html.EmailAddressTransformer");

            let text = "Please contact info@conjoon.com for further information.";

            t.expect(transformer.transform(text)).toBe(
                "Please contact <a href=\"mailto:info@conjoon.com\">info@conjoon.com</a> for further information."
            );

            text = "Please contact info-test@conjoon-domain-info.com for further information.";

            t.expect(transformer.transform(text)).toBe(
                "Please contact <a href=\"mailto:info-test@conjoon-domain-info.com\">info-test@conjoon-domain-info.com</a> for further information."
            );


        });


    });});
