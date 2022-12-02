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

    t.requireOk("coon.core.ioc.Proxy", () => {

        const superclass = "coon.core.ioc.Proxy";
        const create = bindings => {
            if (!bindings) {
                bindings = Ext.create("coon.core.ioc.Bindings");
            }
            return Ext.create("coon.core.ioc.Proxy", bindings);
        };

        t.it("sanity", t => {
            const
                bindings = Ext.create("coon.core.ioc.Bindings"),
                bootSpy = t.spyOn(coon.core.ioc.Proxy.prototype, "installProxies").and.callThrough(),
                proxy = create(bindings);

            t.isInstanceOf(proxy, superclass);

            t.isInstanceOf(proxy.factoryProxy, "coon.core.ioc.sencha.FactoryProxy");
            t.isInstanceOf(proxy.createProxy, "coon.core.ioc.sencha.CreateProxy");
            t.expect(proxy.factoryProxy.bindings).toBe(bindings);
            t.expect(proxy.createProxy.bindings).toBe(bindings);

            t.expect(bootSpy.calls.count()).toBe(1);

            proxy.boot(bindings);
            t.expect(bootSpy.calls.count()).toBe(1);

            t.expect(proxy.getFactoryProxy()).toBe(proxy.factoryProxy);
            t.expect(proxy.getCreateProxy()).toBe(proxy.createProxy);

            [bootSpy].map(spy => spy.remove());
        });


        t.it("throws w/o bindings", t=> {
            try {
                Ext.create("coon.core.ioc.Proxy", {});
                t.fail();
            } catch (e) {
                t.expect(e.message).toContain("must be an instance of");
            }
        });


        t.it("proxies properly created", t=> {


            const
                fakeFactoryHandler = {
                    get: function () {
                        return new Proxy(function (){}, this);
                    },
                    apply: function () {}
                },
                fakeCreateHandler = {apply: function () {}},
                factorySpy = t.spyOn(fakeFactoryHandler, "apply").and.callFake(() => {}),
                createSpy = t.spyOn(fakeCreateHandler, "apply").and.callFake(() => {});

            coon.core.ioc.Proxy.prototype.getFactoryProxy = () => fakeFactoryHandler;
            coon.core.ioc.Proxy.prototype.getCreateProxy = () => fakeCreateHandler;

            create();

            Ext.Factory.foo();
            Ext.create();

            t.expect(factorySpy.calls.count()).toBe(1);
            t.expect(createSpy.calls.count()).toBe(1);


            [factorySpy, createSpy].map(spy => spy.remove());

        });

    });


});
