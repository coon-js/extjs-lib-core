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

    const superclass = "coon.core.ioc.sencha.resolver.ClassResolver";
    const className  = "coon.core.ioc.sencha.resolver.FactoryHandler";

    const create = cfg => {
        return Ext.create(className);
    };

    t.it("sanity", t => {
        const
            handler = create();

        t.isInstanceOf(handler, superclass);
    });


    t.it("apply() - first arg is string", t => {

        [{
            firstArg: "json",
            resolvedName: "Ext.data.reader.Json",
            resolvedClass: Ext.data.reader.Json,
            prefix: "reader."
        }, {
            firstArg: {type: "json"},
            resolvedName: "Ext.data.reader.Json",
            resolvedClass: Ext.data.reader.Json,
            prefix: "reader."
        }, {
            firstArg: "foo", resolvedName: null
        }].map(({firstArg, resolvedName, resolvedClass, prefix}) => {

            const handler = Ext.create(className);
            const reflectCall = {};
            const fireEventSpy = t.spyOn(handler, "fireEvent").and.callThrough();
            const reflectSpy = t.spyOn(Reflect, "apply").and.callFake(() => reflectCall);


            const target = {instance: {aliasPrefix: prefix}}, thisArg = {}, argumentsList = [firstArg];

            t.expect(handler.apply(target, thisArg, argumentsList)).toBe(reflectCall);

            if (resolvedName !== null) {
                t.expect(
                    fireEventSpy.calls.mostRecent()?.args
                ).toEqual(
                    ["classresolved", handler, resolvedName, resolvedClass]
                );
                t.expect(fireEventSpy.calls.count()).toBe(1);
            } else {
                t.expect(fireEventSpy.calls.count()).toBe(0);
            }

            [reflectSpy, fireEventSpy].map(spy => spy.remove());
        });
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


});
