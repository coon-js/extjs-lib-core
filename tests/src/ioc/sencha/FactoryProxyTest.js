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

    const superclass = "coon.core.ioc.sencha.AbstractProxy";
    const className  = "coon.core.ioc.sencha.FactoryProxy";

    const create = cfg => {

        if (!cfg.bindings) {
            cfg.bindings = createBindings();
        }

        return Ext.create(className, cfg.bindings);
    };

    const createBindings = data => Ext.create("coon.core.ioc.Bindings", data);

    t.it("sanity", t => {
        const
            bindings = createBindings(),
            proxy = create({bindings});

        t.isInstanceOf(proxy, superclass);
        t.expect(proxy.bindings).toBe(bindings);
    });


    // private
    t.it("handler()", t => {
        const proxy = create({});
        t.expect(proxy.handler()).toBe(proxy);
    });


    t.it("get()", t => {

        const proxy = create({});

        const target = {foo: function (){}};
        const handler = {apply: function () {}};

        proxy.handler = () => handler;

        const applySpy = t.spyOn(handler, "apply").and.callThrough();

        target.foo();
        t.expect(applySpy.calls.count()).toBe(0);
        target.foo = proxy.get(target, "foo");
        target.foo();
        t.expect(applySpy.calls.count()).toBe(1);
    });


    t.it("apply()", t => {

        t.fail();
    });


});
