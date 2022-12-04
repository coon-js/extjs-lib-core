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

    const className = "coon.core.ioc.Container";

    t.requireOk(className, () => {

        const create = () => coon.core.ioc.Container;

        t.it("getBindings()", t => {
            const container = create();

            t.expect(container.bindings).toBeUndefined();

            const bindings = container.getBindings();

            t.isInstanceOf(bindings, "coon.core.ioc.Bindings");
            t.expect(container.bindings).toBe(bindings);
            t.expect(container.getBindings()).toBe(bindings);
        });


        t.it("bind() throws", t => {
            const container = create();
            try {
                container.bind();
                t.fail();
            } catch (e) {
                t.expect(e.message).toContain("must be an object");
            }
        });


        t.it("bind()", t => {
            const container = create();

            const proxySpy = t.spyOn(coon.core.ioc.sencha.SenchaProxy.prototype, "constructor").and.callThrough();

            const data = {};
            const mergeSpy = t.spyOn(container.getBindings(), "merge").and.callThrough();

            t.expect(container.proxy).toBeUndefined();
            container.bind(data);

            t.expect(mergeSpy.calls.mostRecent().args[0]).toBe(data);

            t.isInstanceOf(container.proxy, "coon.core.ioc.sencha.SenchaProxy");
            t.expect(proxySpy.calls.mostRecent().args[0]).toBe(container.getBindings());

            container.bind({});
            t.expect(proxySpy.calls.count()).toBe(1);

            [proxySpy, mergeSpy].map(spy => spy.remove());
        });


    });
});
