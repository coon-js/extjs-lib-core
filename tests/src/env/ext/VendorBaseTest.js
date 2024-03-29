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

    "use strict";

    let TMPMANIFEST = null,
        vendorBase;

    t.beforeEach(function () {

        TMPMANIFEST = Ext.manifest;
        Ext.manifest = {"resources": {"path": "foo", "shared": "bar"}, "coon-js": {"env": "development"}, "packages": {"mypackage": {}}};

        vendorBase = Ext.create("coon.core.env.ext.VendorBase");

    });


    t.afterEach(function () {
        Ext.manifest = TMPMANIFEST;

        if (vendorBase) {
            vendorBase.destroy();
            vendorBase = null;
        }
    });


    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------


    t.it("inheritance", (t) => {
        t.isInstanceOf(vendorBase, "coon.core.env.VendorBase");
    });


    t.it("get()", (t) => {
        t.expect(vendorBase.get("manifest")).toBe(Ext.manifest);
    });


    t.it("getEnvironment()", (t) => {
        t.expect(vendorBase.getEnvironment()).toBe(Ext);
    });


    t.it("getManifest()", (t) => {
        t.expect(vendorBase.getManifest()).toBe(Ext.manifest);
    });


    t.it("getManifest(\"coon-js\")", (t) => {
        t.expect(vendorBase.getManifest("coon-js")).toBe(Ext.manifest["coon-js"]);
    });


    t.it("getPackages()", (t) => {
        t.expect(vendorBase.getPackages()).toBe(Ext.manifest.packages);
    });


    t.it("getPackage()", (t) => {
        t.expect(vendorBase.getPackage("somepackage")).toBeUndefined();

        t.expect(vendorBase.getPackage("mypackage")).toBe(Ext.manifest.packages.mypackage);
    });


    t.it("getPathForResource()", (t) => {

        let spy = t.spyOn(Ext, "getResourcePath");

        t.expect(vendorBase.getPathForResource("someresource")).toBe(Ext.manifest.resources.path + "/someresource");

        t.expect(spy.calls.mostRecent().args[0]).toBe("someresource");
        t.expect(spy.calls.mostRecent().args[1]).toBe(null);
        t.expect(spy.calls.mostRecent().args[2]).toBe("");

        t.expect(vendorBase.getPathForResource("someresource", "pack")).toBe(Ext.manifest.resources.path + "/pack/someresource");

        t.expect(spy.calls.mostRecent().args[0]).toBe("someresource");
        t.expect(spy.calls.mostRecent().args[1]).toBe(null);
        t.expect(spy.calls.mostRecent().args[2]).toBe("pack");


    });

    t.it("loadPackage()", async (t) => {

        let spy = t.spyOn(Ext.Package, "load").and.callFake(async () => {});

        t.isInstanceOf(vendorBase.loadPackage("pack"), "Promise");

        t.expect(spy.calls.mostRecent().args[0]).toBe("pack");

        spy.remove();
    });

});
