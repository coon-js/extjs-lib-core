/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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

StartTest(t => {

    const superclass = "coon.core.ioc.Bindings";
    const create = data => Ext.create("coon.core.ioc.Bindings", data);

    t.it("sanity", t => {
        const b = create();
        t.isInstanceOf(b, superclass);

        t.expect(b.getData()).toEqual({});
    });

    t.it("data", t => {
        const b = create({"namespace": {"foo": "bar"}});
        t.isInstanceOf(b, superclass);

        t.expect(b.getData()).toEqual({"namespace": {"foo": "bar"}});
    });


    t.it("merge()", t => {
        const b = create();

        t.expect(b.merge({"com.acme": {requestConfigurator: "coon.core.data.request.Configurator"}})).toBe(b.getData());
        t.expect(b.getData()).toEqual({"com.acme": {requestConfigurator: "coon.core.data.request.Configurator"}});

        b.merge({"com.acme.Class": {requestConfigurator: "com.acme.RequestConfigurator"}});
        t.expect(b.getData()).toEqual({
            "com.acme.Class": {requestConfigurator: "com.acme.RequestConfigurator"},
            "com.acme": {requestConfigurator: "coon.core.data.request.Configurator"}
        });

        b.merge({"com.acme.Class": {requestConfigurator: "moreSpecific"}});

        t.expect(b.getData()).toEqual({
            "com.acme.Class": {requestConfigurator: "moreSpecific"},
            "com.acme": {requestConfigurator: "coon.core.data.request.Configurator"}
        });

    });

});
