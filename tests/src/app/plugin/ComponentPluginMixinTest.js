/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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


    t.it("registerComponentPlugin()", t => {

        const mixin = Ext.create("coon.core.app.plugin.ComponentPluginMixin");

        // mock controller that uses the mixin
        mixin.control = function () {};

        /*Could not find the plugin*/
        t.expect(() => mixin.registerComponentPlugin({pclass: "not.available"})).toThrow();
        /*Could not find the feature*/
        t.expect(() => mixin.registerComponentPlugin({fclass: "not.available"})).toThrow();


        const
            featureMock = {features: []},
            pluginMock = {
                plugs: [], addPlugin: function (plug) {
                    this.plugs.push(plug);
                }
            },
            controlSpy = t.spyOn(mixin, "control").and.callThrough();

        let ctrl = mixin.registerComponentPlugin({
            "cmp": "foo",
            "pclass": "Ext.plugin.Abstract",
            "event": "render"
        });

        t.expect(l8.isFunction(ctrl.foo.render));

        t.expect(pluginMock.plugs.length).toBe(0);
        ctrl.foo.render(pluginMock);
        t.expect(controlSpy.calls.count()).toBe(1);
        t.expect(controlSpy.calls.mostRecent().args[0]).toBe(ctrl);
        t.expect(pluginMock.plugs.length).toBe(1);
        t.isInstanceOf(pluginMock.plugs[0], "Ext.plugin.Abstract");

        ctrl = mixin.registerComponentPlugin({
            "cmp": "foo",
            "fclass": "Ext.plugin.Abstract",
            "event": "render"
        });

        t.expect(featureMock.features.length).toBe(0);
        ctrl.foo.render(featureMock);
        t.expect(controlSpy.calls.count()).toBe(2);
        t.expect(controlSpy.calls.mostRecent().args[0]).toBe(ctrl);
        t.expect(featureMock.features.length).toBe(1);
        t.isInstanceOf(featureMock.features[0], "Ext.plugin.Abstract");

        controlSpy.remove();
    });

});
