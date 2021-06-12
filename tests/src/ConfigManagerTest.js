/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2020-2021 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------

    t.requireOk("coon.core.ConfigManager", function (){

        t.it("register()", (t) => {

            const ConfigManager = coon.core.ConfigManager;

            let exp;

            t.expect(ConfigManager.get("foo")).toBeUndefined();

            let a = {a: 1, "sect": {"foo": "bar"}};
            t.expect(ConfigManager.register("foo", a)).toBe(a);
            t.expect(ConfigManager.register("", {})).toBe(null);
            t.expect(ConfigManager.register(null, {})).toBe(null);

            t.expect(ConfigManager.get("foo")).toBe(a);
            t.expect(ConfigManager.get("foo", "a")).toBe(1);
            t.expect(ConfigManager.get("foo", "sect.foo")).toBe("bar");
            t.expect(ConfigManager.get("foo", "sect.bar")).toBeUndefined();
            t.expect(ConfigManager.get("foo", "sect.bar", "foo")).toBe("foo");
            t.expect(ConfigManager.get(null)).toBeUndefined();
            t.expect(ConfigManager.get("a")).toBeUndefined();
            t.expect(ConfigManager.get("a", "b", "c")).toBe("c");


            try {
                ConfigManager.register("foo", a);
            } catch (e) {
                exp = e;
            }

            t.expect(exp.msg).toContain("was already registered");
            t.isInstanceOf(exp, "coon.core.exception.AlreadyExistsException");


        });


    });});
