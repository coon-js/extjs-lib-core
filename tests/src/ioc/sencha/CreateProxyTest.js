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
    const className  = "coon.core.ioc.sencha.CreateProxy";

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


    t.it("apply()", t => {

        let defaultClass = {};

        const
            proxy = create({}),
            classManagerSpy = t.spyOn(Ext.ClassManager, "get").and.callFake(() => defaultClass),
            getNameSpy = t.spyOn(Ext.ClassManager, "getName").and.callFake(() => "className"),
            reflectSpy = t.spyOn(Reflect, "apply").and.callFake(() => "reflect"),
            resolveDependenciesSpy = t.spyOn(proxy, "resolveDependencies").and.callFake(() => ({"prop": "resolved"})),
            target = {},
            thisArg = {},
            assertReflectSpy = (thirdArg) => {
                t.expect(reflectSpy.calls.mostRecent().args[0]).toBe(target);
                t.expect(reflectSpy.calls.mostRecent().args[1]).toBe(thisArg);

                if (thirdArg !== undefined) {
                    t.expect(reflectSpy.calls.mostRecent().args[2]).toEqual(thirdArg);
                }
            };

        // no string passed as 1 argument
        t.expect(proxy.apply(target, thisArg, [{}])).toBe(reflectSpy.calls.mostRecent().returnValue);
        t.expect(resolveDependenciesSpy.calls.count()).toBe(0);
        assertReflectSpy();


        // class cannot be resolved
        defaultClass = undefined;
        t.expect(proxy.apply(target, thisArg, ["foo"])).toBe(reflectSpy.calls.mostRecent().returnValue);
        t.expect(resolveDependenciesSpy.calls.count()).toBe(0);
        assertReflectSpy();


        // target class has no requireCfg
        defaultClass = {};
        t.expect(proxy.apply(target, thisArg, ["foo"])).toBe(reflectSpy.calls.mostRecent().returnValue);
        t.expect(resolveDependenciesSpy.calls.count()).toBe(0);
        assertReflectSpy();


        // target class requireCfg
        const requireConfig = {"config": {}};
        defaultClass = {};
        defaultClass[proxy.requireProperty] = requireConfig;

        t.expect(proxy.apply(target, thisArg, ["foo", {width: 800, height: 600}])).toBe(reflectSpy.calls.mostRecent().returnValue);
        t.expect(resolveDependenciesSpy.calls.count()).toBe(1);
        t.expect(resolveDependenciesSpy.calls.mostRecent().args[0]).toBe(
            getNameSpy.calls.mostRecent().returnValue
        );
        t.expect(resolveDependenciesSpy.calls.mostRecent().args[1]).toBe(requireConfig);
        assertReflectSpy(["foo", {width: 800, height: 600, prop: "resolved"}]);

        [reflectSpy, resolveDependenciesSpy, getNameSpy, classManagerSpy].map(spy => spy.remove());

    });


});
