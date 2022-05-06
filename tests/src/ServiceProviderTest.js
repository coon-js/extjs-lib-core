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

    t.requireOk("coon.core.ServiceProvider", function (){

        t.it("ServiceProvider", t => {

            const
                fakeService = {},
                ServiceProvider = coon.core.ServiceProvider;

            let exc;

            // get and already registered
            t.expect(ServiceProvider.get("abstract")).toBeUndefined();
            ServiceProvider.services = {"abstract": fakeService};
            t.expect(ServiceProvider.get("abstract")).toBe(fakeService);

            try {
                ServiceProvider.register("abstract", {});
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.message).toContain("was already registered");
            ServiceProvider.services = undefined;

            // missing class
            try {
                ServiceProvider.register("missing_class", fakeService);
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.message.toLowerCase()).toContain("could not find the service");

            // not a service
            try {
                ServiceProvider.register("Ext.Base", fakeService);
            } catch (e) {
                exc = e;
            }
            t.expect(exc.message.toLowerCase()).toContain("must be an instance of");

            // not the type of the abstract
            try {
                ServiceProvider.register("Ext.Panel", Ext.create("coon.core.service.Service"));
            } catch (e) {
                exc = e;
            }
            t.expect(exc.message).toContain("must be an instance of Ext.Panel");


            const service = Ext.create("coon.core.service.Service");
            t.expect(ServiceProvider.register("coon.core.service.Service", service)).toBe(service);
            t.expect(ServiceProvider.get("coon.core.service.Service")).toBe(service);

        });


    });});
