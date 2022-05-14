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


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------

    t.requireOk("coon.core.ServiceLocator", function (){

        t.it("ServiceLocator", t => {

            const
                fakeService = {},
                ServiceLocator = coon.core.ServiceLocator;

            let exc;

            // get and already registered
            t.expect(ServiceLocator.resolve("abstract")).toBeUndefined();
            ServiceLocator.services = {"abstract": fakeService};
            t.expect(ServiceLocator.resolve("abstract")).toBe(fakeService);

            try {
                ServiceLocator.register("abstract", {});
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.message).toContain("was already registered");
            ServiceLocator.services = undefined;

            // missing class
            try {
                ServiceLocator.register("missing_class", fakeService);
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.message.toLowerCase()).toContain("could not find the service");

            // not a service
            try {
                ServiceLocator.register("Ext.Base", fakeService);
            } catch (e) {
                exc = e;
            }
            t.expect(exc.message.toLowerCase()).toContain("must be an instance of");

            // not the type of the abstract
            try {
                ServiceLocator.register("Ext.Panel", Ext.create("coon.core.service.Service"));
            } catch (e) {
                exc = e;
            }
            t.expect(exc.message).toContain("must be an instance of Ext.Panel");


            const service = Ext.create("coon.core.service.Service");
            t.expect(ServiceLocator.register("coon.core.service.Service", service)).toBe(service);
            t.expect(ServiceLocator.resolve("coon.core.service.Service")).toBe(service);

        });


    });});
