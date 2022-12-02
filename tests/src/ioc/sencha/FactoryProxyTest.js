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


        let defaultClass = {};

        const
            proxy = create({}),
            getByAliasSpy = t.spyOn(Ext.ClassManager, "getByAlias").and.callFake(() => defaultClass),
            getNameSpy = t.spyOn(Ext.ClassManager, "getName").and.callFake(() => "className"),
            reflectSpy = t.spyOn(Reflect, "apply").and.callFake(() => "reflect"),
            resolveDependenciesSpy = t.spyOn(proxy, "resolveDependencies").and.callFake(() => ({"prop": "resolved"})),
            thisArg = {},
            assertReflectSpy = (thirdArg) => {
                t.expect(reflectSpy.calls.mostRecent().args[0]).toBe(target);
                t.expect(reflectSpy.calls.mostRecent().args[1]).toBe(thisArg);

                if (thirdArg !== undefined) {
                    t.expect(reflectSpy.calls.mostRecent().args[2]).toEqual(thirdArg);
                }
            };

        let target = {};

        // no "type" passed in object with 1st argument
        let argsList = [{}];
        t.expect(proxy.apply(target, thisArg, argsList)).toBe(reflectSpy.calls.mostRecent().returnValue);
        t.expect(resolveDependenciesSpy.calls.count()).toBe(0);
        assertReflectSpy(argsList);

        // no "aliasPrefix" available
        argsList = [{type: "foo"}];
        t.expect(proxy.apply(target, thisArg, argsList)).toBe(reflectSpy.calls.mostRecent().returnValue);
        t.expect(resolveDependenciesSpy.calls.count()).toBe(0);
        assertReflectSpy(argsList);

        // class  alias cannot be resolved
        target = {instance: {aliasPrefix: "bar"}};
        defaultClass = undefined;
        argsList = [{type: "foo"}];
        t.expect(proxy.apply(target, thisArg, argsList)).toBe(reflectSpy.calls.mostRecent().returnValue);
        t.expect(resolveDependenciesSpy.calls.count()).toBe(0);
        assertReflectSpy();

        // target class has no requireCfg
        target = {instance: {aliasPrefix: "bar"}};
        defaultClass = {};
        argsList = [{type: "foo"}];
        t.expect(proxy.apply(target, thisArg, argsList)).toBe(reflectSpy.calls.mostRecent().returnValue);
        t.expect(resolveDependenciesSpy.calls.count()).toBe(0);
        assertReflectSpy();

        // target class requireCfg
        const requireConfig = {"config": {}};
        defaultClass = {};
        defaultClass[proxy.requireProperty] = requireConfig;
        argsList = [{type: "foo", width: 800, height: 600}];
        t.expect(proxy.apply(target, thisArg, argsList)).toBe(reflectSpy.calls.mostRecent().returnValue);
        t.expect(resolveDependenciesSpy.calls.count()).toBe(1);
        t.expect(resolveDependenciesSpy.calls.mostRecent().args[0]).toBe(
            getNameSpy.calls.mostRecent().returnValue
        );
        t.expect(resolveDependenciesSpy.calls.mostRecent().args[1]).toBe(requireConfig);
        assertReflectSpy([{type: "foo", width: 800, height: 600, prop: "resolved"}]);

        [reflectSpy, resolveDependenciesSpy, getNameSpy, getByAliasSpy].map(spy => spy.remove());

    });


});
