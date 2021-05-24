/**
 * coon.js
 * lib-cn_core
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/coon-js/lib-cn_core
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

describe("coon.core.template.javaScript.StringCompilerTest", (t) => {
    "use strict";

    let inst ;

    const
        PARENT_CLASS = "coon.core.template.Compiler",
        CLASS_NAME = "coon.core.template.javaScript.StringCompiler",
        tpl = "This is a ${templated} string ${that.support} JavaScript ${that.typed} ${configured.example.root} TemplateStrings",
        keys = ["templated", "that.support", "that.typed", "configured.example.root"],
        argumentList = ["templated", "that", "configured"],
        compiledCfg = {
            args : "{templated, that, configured}",
            fn : "return `This is a ${templated} string ${that.support} JavaScript ${that.typed} ${configured.example.root} TemplateStrings`"
        };

    t.beforeEach(() => {

        inst = Ext.create(CLASS_NAME);

    });


    t.afterEach(() => {
        inst.destroy();
        inst = null;
    });


    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------

    t.it("functionality", (t) => {
        t.isInstanceOf(inst, PARENT_CLASS);
    });

    t.it("getKeys()", (t) => {
        t.expect(inst.getKeys(tpl)).toEqual(keys);
    });


    t.it("buildArgumentList()", (t) => {
        t.expect(inst.buildArgumentList(keys)).toEqual(argumentList);
    });


    t.it("getBlacklistedKeys()", (t) => {
        t.expect(inst.getBlacklistedKeys(argumentList, [])).toEqual([]);
        t.expect(inst.getBlacklistedKeys(argumentList, ["foo"])).toEqual([]);
        t.expect(inst.getBlacklistedKeys(argumentList, ["foo", "window", "this", "that", "templated"])).toEqual(["templated", "that"]);
    });


    t.it("getFunctionConfig()", t => {
        t.expect(inst.getFunctionConfig(argumentList, tpl)).toEqual(compiledCfg);
    });


    t.it("compile()", (t) => {

        const
            whitelist = [],
            spies = {
                argumentListSpy : t.spyOn(inst, "buildArgumentList"),
                keysSpy : t.spyOn(inst, "getKeys"),
                cfgSpy : t.spyOn(inst, "getFunctionConfig"),
                blacklistSpy : t.spyOn(inst, "getBlacklistedKeys")
            },
            {argumentListSpy, cfgSpy, blacklistSpy, keysSpy} = spies;

        const fn = inst.compile(tpl, whitelist);
        t.isInstanceOf(fn, "coon.core.template.javaScript.Tpl");

        const args = argumentListSpy.calls.mostRecent().returnValue;
        t.expect(keysSpy).toHaveBeenCalledWith(tpl);
        t.expect(argumentListSpy).toHaveBeenCalledWith(keysSpy.calls.mostRecent().returnValue);
        t.expect(blacklistSpy).toHaveBeenCalledWith(args, whitelist);

        t.expect(cfgSpy).toHaveBeenCalledWith(args, tpl);

        Object.values(spies).forEach(spy => spy.remove());
    });


    t.it("compile() - exception", (t) => {

        let exc;

        try {
            inst.compile("${this.window = null;} and also ${that}", ["this"]);
        } catch (e) {
            exc = e;
        }

        t.isInstanceOf(exc, "coon.core.template.CompilerException");
        t.expect(exc.getMessage()).toContain("this");
    });


});
