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
    const className  = "coon.core.ioc.sencha.resolver.CreateHandler";

    const create = cfg => {
        return Ext.create(className);
    };

    t.it("sanity", t => {
        const
            handler = create();

        t.isInstanceOf(handler, superclass);
    });


    t.it("apply()", t => {

        [{
            firstArg: "Ext.panel.Panel",
            resolvedName: "Ext.panel.Panel",
            resolvedClass: Ext.panel.Panel
        }, {
            firstArg: {xtype: "panel"},
            resolvedName: "Ext.panel.Panel",
            resolvedClass: Ext.panel.Panel
        }, {
            firstArg: {xclass: "Ext.panel.Panel"},
            resolvedName: "Ext.panel.Panel",
            resolvedClass: Ext.panel.Panel
        }, {
            firstArg: "foo",
            resolvedName: null
        }].map(({firstArg, resolvedName, resolvedClass}) => {

            const handler = Ext.create(className);
            const reflectCall = {};
            const fireEventSpy = t.spyOn(handler, "fireEvent").and.callThrough();
            const reflectSpy = t.spyOn(Reflect, "apply").and.callFake(() => reflectCall);


            const target = {}, thisArg = {}, argumentsList = [firstArg];

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


});
