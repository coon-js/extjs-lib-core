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

    const superclass = "coon.core.ioc.sencha.SenchaProxy";
    const className = "coon.core.ioc.sencha.SenchaProxy";

    t.requireOk(className, () => {

        const create = bindings => {
            if (!bindings) {
                bindings = createBindings();
            }
            return Ext.create(className, bindings);
        };

        const replaceConstructor = () => {
            coon.core.ioc.sencha.SenchaProxy.prototype.constructor = function () {};
        };

        const createBindings = () => {
            return Ext.create("coon.core.ioc.Bindings");
        };


        t.it("sanity", t => {
            const
                bindings = createBindings(),
                bootSpy = t.spyOn(coon.core.ioc.sencha.SenchaProxy.prototype, "boot").and.callFake(() => {}),
                proxy = create(bindings);

            t.isInstanceOf(proxy, superclass);

            t.expect(bootSpy.calls.mostRecent().args[0]).toBe(bindings);

            [bootSpy].map(spy => spy.remove());
        });


        t.it("throws w/o bindings", t=> {
            try {
                Ext.create(className);
                t.fail();
            } catch (e) {
                t.expect(e.message).toContain("must be an instance of");
            }
        });


        t.it("boot", t=> {

            replaceConstructor();

            const bindings = createBindings();
            const proxy = create();

            const proxySpy    = t.spyOn(proxy, "installProxies").and.callFake(() => {});
            const injectorSpy = t.spyOn(proxy, "installInjectors").and.callFake(() => {});
            const observerSpy = t.spyOn(proxy, "registerObservers").and.callFake(() => {});


            t.expect(proxy.booted).toBeFalsy();
            proxy.boot(bindings);
            t.expect(proxy.booted).toBe(true);
            t.expect(proxySpy.calls.count()).toBe(1);
            t.expect(injectorSpy.calls.count()).toBe(1);
            t.expect(observerSpy.calls.count()).toBe(1);

            proxy.boot();
            t.expect(proxySpy.calls.count()).toBe(1);
            t.expect(injectorSpy.calls.count()).toBe(1);
            t.expect(observerSpy.calls.count()).toBe(1);

            t.expect(injectorSpy.calls.mostRecent().args[0]).toBe(bindings);

            [proxySpy, injectorSpy, observerSpy].map(spy => spy.remove());
        });


        t.it("installProxies", t => {


            replaceConstructor();

            const fakeFactoryHandler = {
                get: function (target, prop) {
                    if (prop === "foo") {
                        target.PROXY_INSTALLED = true;
                    }
                    return Reflect.get(...arguments);
                }
            };
            const fakeCreateHandler = {
                get: function (target, prop) {
                    if (prop === "bar") {
                        target.PROXY_INSTALLED = true;
                    }
                    return Reflect.get(...arguments);
                }
            };

            const proxy = create();

            const factorySpy = t.spyOn(proxy, "getFactoryHandler").and.callFake(() => fakeFactoryHandler);
            const createSpy = t.spyOn(proxy, "getCreateHandler").and.callFake(() => fakeCreateHandler);

            proxy.installProxies();

            t.expect(factorySpy.calls.count()).toBe(1);
            t.expect(createSpy.calls.count()).toBe(1);

            t.expect(Ext.Factory.PROXY_INSTALLED).toBeFalsy();
            t.expect(Ext.create.PROXY_INSTALLED).toBeFalsy();
            Ext.Factory.foo;
            Ext.create.bar;
            t.expect(Ext.Factory.PROXY_INSTALLED).toBe(true);
            t.expect(Ext.create.PROXY_INSTALLED).toBe(true);
        });


        t.it("installInjectors()", t => {
            replaceConstructor();

            const proxy = create();
            const bindings = createBindings();


            t.expect(proxy.constructorInjector).toBeFalsy();

            proxy.installInjectors(bindings);

            t.isInstanceOf(
                proxy.constructorInjector,
                "coon.core.ioc.sencha.ConstructorInjector"
            );
            t.isInstanceOf(
                proxy.constructorInjector.dependencyResolver,
                "coon.core.ioc.sencha.resolver.DependencyResolver"
            );

            t.expect(proxy.constructorInjector.dependencyResolver.bindings).toBe(bindings);
        });


        t.it("getFactoryHandler(), getCreateHandler()", t => {
            replaceConstructor();

            const proxy = create();

            [[
                "factoryHandler",
                () => proxy.getFactoryHandler(),
                "coon.core.ioc.sencha.resolver.FactoryHandler"
            ], [
                "createHandler",
                () => proxy.getCreateHandler(),
                "coon.core.ioc.sencha.resolver.CreateHandler"
            ]].map(([prop, handlerFn, className]) => {

                const handler = handlerFn();

                t.isInstanceOf(handler, className);
                t.expect(handler).toBe(proxy[prop]);
            });
        });


        t.it("register observers resolve handlers", t => {
            replaceConstructor();

            const
                proxy = create(),
                createHandlerSpy = t.spyOn(proxy.getCreateHandler(), "on").and.callThrough(),
                createFactorySpy = t.spyOn(proxy.getFactoryHandler(), "on").and.callThrough();

            proxy.registerObservers();

            [createHandlerSpy, createFactorySpy].map(spy => {
                t.expect(spy.calls.mostRecent().args).toEqual(["classresolved", proxy.onClassResolved, proxy]);
                spy.remove();
            });
        });


        t.it("onClassResolved()", t => {

            replaceConstructor();

            const
                proxy = create(),
                fakeCls = {};

            proxy.constructorInjector = {
                shouldApplyHandler () {

                },

                registerHandler () {

                }
            };

            [[false], [true]].map(

                ([shouldApplyHandler]) => {

                    const
                        injector = proxy.constructorInjector,
                        applyHandlerSpy = t.spyOn(injector, "shouldApplyHandler").and.callFake(
                            () => shouldApplyHandler
                        ),
                        registerHandlerSpy = t.spyOn(injector, "registerHandler").and.callThrough();

                    proxy.onClassResolved({}, {}, fakeCls);

                    t.expect(applyHandlerSpy.calls.mostRecent().args[0]).toBe(fakeCls);

                    if (shouldApplyHandler) {
                        t.expect(registerHandlerSpy.calls.count()).toBe(1);
                        t.expect(registerHandlerSpy.calls.mostRecent().args[0]).toBe(fakeCls);
                    } else {
                        t.expect(registerHandlerSpy.calls.count()).toBe(0);
                    }

                    [applyHandlerSpy, registerHandlerSpy].map(spy => spy.remove());
                }

            );


        });


    });

});
