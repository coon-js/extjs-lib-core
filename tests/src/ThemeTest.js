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

describe("coon.core.ThemeTest", function (t) {

    let themeConfig;

    const createThemeConfig = function () {
        return {
            blue: {
                default: false,
                config: {}
            },
            red: {
                default: false,
                config: {}
            },
            indigo: {
                default: true,
                config: {}
            }
        };
    };

    t.beforeEach(function () {
        themeConfig = createThemeConfig();
    });


    t.afterEach(function () {


    });

    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------


    t.it("functionality", function (t) {

        let theme = Ext.create("coon.core.Theme");

        t.expect(theme.getModes()).toBeUndefined();
        t.expect(theme.getMode()).toBeUndefined();
        t.expect(theme.getDefaultMode()).toBeUndefined();

        t.expect(theme.get("someKey")).toBeUndefined();

        t.expect(theme.set("someKey", "1")).toBe(theme);
        t.expect(theme.get("someKey")).toBeUndefined();

    });


    t.it("setModes()", function (t) {

        let theme = Ext.create("coon.core.Theme", {modes : themeConfig});

        t.expect(theme.getModes()).toEqual(themeConfig);
        t.expect(theme.getDefaultMode()).toBe("indigo");
        t.expect(theme.getMode()).toBe("indigo");

        let newModes = {
            yellow : {
                default : false,
                config : {}
            },
            light : {
                default : false,
                config : {}
            }
        };

        t.expect(newModes.yellow.default).toBe(false);
        theme.setModes(newModes);
        t.expect(theme.getModes()).toEqual(newModes);
        t.expect(theme.getDefaultMode()).toBe("yellow");
        t.expect(theme.getMode()).toBe("yellow");
        t.expect(newModes.yellow.default).toBe(true);

    });


    t.it("setMode() / setDefaultMode()", function (t) {

        let theme = Ext.create("coon.core.Theme", {modes : themeConfig});

        t.expect(theme.getMode()).toBe("indigo");
        theme.setMode("blue");
        t.expect(theme.getDefaultMode()).toBe("indigo");
        t.expect(theme.getMode()).toBe("blue");

        theme.setDefaultMode("red");
        t.expect(theme.getDefaultMode()).toBe("red");
        t.expect(theme.getMode()).toBe("blue");

    });


    t.it("get() / set()", function (t) {

        let theme = Ext.create("coon.core.Theme", {modes : themeConfig});

        t.expect(theme.getMode()).toBe("indigo");

        t.expect(theme.get("someKey")).toBeUndefined();

        t.expect(theme.set("someKey", "1")).toBe(theme);
        t.expect(theme.get("someKey")).toBe("1");

    });
});
