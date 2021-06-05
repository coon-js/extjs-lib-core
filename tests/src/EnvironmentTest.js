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

describe("coon.core.EnvironmentTest",  (t) => {

    t.requireOk("coon.core.Environment", () => {

        const Environment = coon.core.Environment;


        t.beforeEach(() => {
            Environment._vendorBase = undefined;
        });

        // +----------------------------------------------------------------------------
        // |                    =~. Tests .~=
        // +----------------------------------------------------------------------------

        t.it("wrong type for vendorBase / ok / already set", (t) => {

            t.expect(Environment.getVendorBase()).toBeUndefined();

            let exc;

            // wrong type
            try {
                Environment.setVendorBase("foo");
            } catch (e) {
                exc = e;
            }
            t.isInstanceOf(exc, "coon.core.IllegalArgumentException");

            // ok
            let vendorBase = Ext.create("coon.core.env.VendorBase");
            Environment.setVendorBase(vendorBase);
            t.expect(Environment.getVendorBase()).toBe(vendorBase);

            exc = undefined;
            try {
                Environment.setVendorBase(Ext.create("coon.core.env.VendorBase"));
            } catch (e) {
                exc = e;
            }
            t.isInstanceOf(exc, "coon.core.UnsupportedOperationException");
        });


        t.it("proper delegates", (t) => {

            let vendorBase = Ext.create("coon.core.env.VendorBase"),
                spy, delegate;

            Environment.setVendorBase(vendorBase);
            t.expect(Environment.getVendorBase()).toBe(vendorBase);

            delegate = t.spyOn(Environment, "delegate");

            // get
            spy = t.spyOn(vendorBase, "get");
            t.expect(Environment.get("somekey")).toBeUndefined();
            t.expect(spy.calls.mostRecent().args[0]).toBe("somekey");
            t.expect(delegate.calls.mostRecent().args[0]).toBe("get");

            // getPathForResource
            spy = t.spyOn(vendorBase, "getPathForResource");
            t.expect(Environment.getPathForResource("path", "pck")).toBeUndefined();
            let recCall = spy.calls.mostRecent();
            t.expect(recCall.args[0]).toBe("path");
            t.expect(recCall.args[1]).toBe("pck");
            t.expect(delegate.calls.mostRecent().args[0]).toBe("getPathForResource");

            // getPackage
            spy = t.spyOn(vendorBase, "getPackage");
            t.expect(Environment.getPackage("package")).toBeUndefined();
            t.expect(spy.calls.mostRecent().args[0]).toBe("package");
            t.expect(delegate.calls.mostRecent().args[0]).toBe("getPackage");

            // getEnvironment
            spy = t.spyOn(vendorBase, "getEnvironment");
            t.expect(Environment.getEnvironment()).toBeUndefined();
            t.expect(spy.calls.all().length).toBe(1);
            t.expect(delegate.calls.mostRecent().args[0]).toBe("getEnvironment");

            // getPackages
            spy = t.spyOn(vendorBase, "getPackages");
            t.expect(Environment.getPackages()).toBeUndefined();
            t.expect(spy.calls.all().length).toBe(1);
            t.expect(delegate.calls.mostRecent().args[0]).toBe("getPackages");

            // getManifest
            spy = t.spyOn(vendorBase, "getManifest");
            t.expect(Environment.getManifest()).toBeUndefined();
            t.expect(spy.calls.all().length).toBe(1);
            t.expect(delegate.calls.mostRecent().args[0]).toBe("getManifest");
            t.expect(delegate.calls.mostRecent().args[1][0]).toBeUndefined();

            // getManifest w/key
            t.expect(Environment.getManifest("key")).toBeUndefined();
            t.expect(spy.calls.all().length).toBe(2);
            t.expect(delegate.calls.mostRecent().args[0]).toBe("getManifest");
            t.expect(delegate.calls.mostRecent().args[1][0]).toBe("key");

        });


        t.it("loadPackage()", async (t) => {

            let vendorBase = Ext.create("coon.core.env.VendorBase"),
                exc, spy;

            try {
                await Environment.loadPackage("pack");
            } catch (e) {
                exc = e;
            }

            t.isInstanceOf(exc, "coon.core.exception.MissingPropertyException");

            Environment.setVendorBase(vendorBase);
            // loadPackage
            spy = t.spyOn(vendorBase, "loadPackage").and.callFake(async () => {});
            t.isInstanceOf(Environment.loadPackage("pack"), "Promise");
            t.expect(spy.calls.all().length).toBe(1);
            t.expect(spy.calls.mostRecent().args[0]).toBe("pack");
        });


        t.it("no VendorBase available for delegates", (t) => {

            let exc;

            t.expect(Environment.getVendorBase()).toBeUndefined();

            exc = undefined;
            try {
                Environment.getManifest("somekey");
            } catch (e) {
                exc = e;
            }
            t.isInstanceOf(exc, "coon.core.MissingPropertyException");


        });


    });
});
