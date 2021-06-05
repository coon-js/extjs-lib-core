/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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

describe("coon.core.exception.ExceptionTest", (t) => {

    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------

    t.requireOk("coon.core.exception.Exception",  () => {

        t.it("alternateClassName", (t) => {
            t.expect(coon.core.exception.Exception.prototype.alternateClassName).toBe("coon.core.Exception");
        });


        t.it("constructor()", (t) => {

            let exc;

            exc = Ext.create("coon.core.exception.Exception", {
                msg: "Exception"
            });

            t.expect(Object.isFrozen(exc)).toBe(true);

            t.expect(exc.getMessage()).toBe("Exception");


            exc = Ext.create("coon.core.exception.Exception");
            t.expect(exc.msg).toBeUndefined();

            exc = Ext.create("coon.core.exception.Exception", "some exception");
            t.expect(exc.msg).toBe("some exception");


            exc = Ext.create("coon.core.exception.Exception", "some msg", "the cause");
            t.expect(exc.getCause()).toBe("the cause");


        });

    });

});
