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

StartTest((t) => {


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------

    t.it("Should throw exception when no id configured", (t) => {

        var exc;

        try {
            Ext.create("coon.core.data.schema.BaseSchema", {
                namespace: "mynamespace"
            });
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.namespace).toBeUndefined();
        t.expect(exc.id).toBeUndefined();
    });

    t.it("Should throw exception when id configured to \"default\"", (t) => {

        var exc;

        try {
            Ext.create("coon.core.data.schema.BaseSchema", {
                id: "default",
                namespace: "mynamespace"
            });
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.id).toBe("default");
    });

    t.it("Should throw exception when namespace is not configured", (t) => {

        var exc;

        try {
            Ext.create("coon.core.data.schema.BaseSchema", {
                id: "myId"
            });
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.namespace).toBeUndefined();
        t.expect(exc.id).toBeUndefined();
    });

    /**
     * Test create
     */
    t.it("Should create an instance of coon.core.data.schema.BaseSchema", (t) => {

        var schema = Ext.create("coon.core.data.schema.BaseSchema", {
            id: "myId",
            namespace: "myNamespace"
        });

        t.expect(schema instanceof coon.core.data.schema.BaseSchema).toBeTruthy();

        t.expect(schema.id).toBe("myId");
        t.expect(schema.getNamespace()).toBe("myNamespace.");
    });


});
