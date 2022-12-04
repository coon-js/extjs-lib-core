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

    const superclass = "coon.core.ioc.sencha.ConstructorInjector";
    const className  = "coon.core.ioc.sencha.ConstructorInjector";

    const create = (cfg = {}) => {

        if (!cfg.dependencyResolver) {
            cfg.dependencyResolver = createDependencyResolver();
        }

        return Ext.create(className, cfg.dependencyResolver);
    };

    const createBindings = data => Ext.create("coon.core.ioc.Bindings", data);
    const createDependencyResolver = bindings => {

        if (!bindings) {
            bindings = createBindings({});
        }

        return Ext.create("coon.core.ioc.sencha.resolver.DependencyResolver", bindings);
    };

    t.it("sanity", t => {
        const
            dependencyResolver = createDependencyResolver(),
            injector = create({dependencyResolver});

        t.isInstanceOf(injector, superclass);
        t.expect(injector.requireProperty).toBe("require");
        t.expect(injector.dependencyResolver).toBe(dependencyResolver);
    });


    t.it("constructor throws exception", t => {

        try {
            Ext.create(className);
            t.fail();
        } catch (e) {
            t.expect(e.message).toContain("must be an instance of");
        }
    });


    t.it("handler()", t => {

        const
            injector = create(),
            fakeReflector = {},
            handler = injector.handler(),
            argumentsList = [],
            newTarget = {};


        [{
            firstArg: {
                defaultCfg: "value"
            },
            target: {require: {foo: "bar"}}
        }, {
            firstArg: {
                defaultCfg: "value"
            },
            target: {}
        }].map(({firstArg, target}) => {

            const
                resolverSpy = t.spyOn(injector.dependencyResolver, "resolveDependencies").and.callFake(
                    () => target.require
                ),
                reflectSpy = t.spyOn(Reflect, "construct").and.callFake(() => fakeReflector),
                getNameSpy = t.spyOn(Ext.ClassManager, "getName").and.callFake(() => target);

            argumentsList[0] = firstArg;

            t.expect(handler.construct(target, argumentsList, newTarget)).toBe(fakeReflector);

            if (target.require) {
                t.expect(resolverSpy.calls.mostRecent().args).toEqual([
                    getNameSpy.calls.mostRecent().returnValue,
                    target.require
                ]);
            } else {
                t.expect(resolverSpy.calls.count()).toBe(0);
            }

            t.expect(reflectSpy.calls.mostRecent().args).toEqual([
                target,
                [Object.assign(firstArg,  resolverSpy.calls.mostRecent()?.returnValue)],
                newTarget
            ]);

        });

    });


    t.it("shouldApplyHandler()", t => {

        let className = "testClass",
            fakeCls = {};

        const
            injector = create(),
            getNameSpy = t.spyOn(Ext.ClassManager, "getName").and.callFake(() => className);

        t.expect(injector.shouldApplyHandler(fakeCls)).toBe(false);

        fakeCls = {
            require: {}
        };
        t.expect(injector.shouldApplyHandler(fakeCls)).toBe(true);
        t.expect(injector.shouldApplyHandler(fakeCls)).toBe(true);
        injector.processed = [className];
        t.expect(injector.shouldApplyHandler(fakeCls)).toBe(false);

        [getNameSpy].map(spy => spy.remove());
    });


    t.it("registerHandler()", t => {

        let className = "testClass",
            fakeCls = {
            };

        const
            injector = create(),
            getNameSpy = t.spyOn(Ext.ClassManager, "getName").and.callFake(() => className),
            setSpy     = t.spyOn(Ext.ClassManager, "set").and.callThrough();

        injector.handler = function () {
            return {
                get: function (target, prop) {

                    if (prop === "foo") {
                        target.PROXY_INSTALLED = true;
                    }
                    return Reflect.get(...arguments);
                }
            };
        };

        t.expect(injector.processed).toBeUndefined();
        fakeCls = injector.registerHandler(fakeCls);
        t.expect(injector.processed).toEqual([className]);
        fakeCls = injector.registerHandler(fakeCls);
        t.expect(injector.processed).toEqual([className]);

        t.expect(fakeCls.PROXY_INSTALLED).toBeUndefined();
        /* eslint-disable-next-line*/
        fakeCls.foo;
        t.expect(fakeCls.PROXY_INSTALLED).toBe(true);

        t.expect(setSpy.calls.mostRecent().args[0]).toBe(className);
        t.expect(setSpy.calls.mostRecent().args[1] === Ext.ClassManager.get(className)).toBe(true);

        [getNameSpy, setSpy].map(spy => spy.remove());
    });

});
