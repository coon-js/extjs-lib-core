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

describe("coon.core.ThemeManagerTest", (t) => {


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------

    t.requireOk("coon.core.ThemeManager", function () {

        t.it("functionality", (t) => {

            const theme = Ext.create("coon.core.Theme");

            const ThemeManager = coon.core.ThemeManager;
            t.expect(ThemeManager.singleton).toBe(true);

            t.expect(ThemeManager.getTheme()).toBeUndefined();

            let exc;
            try {
                ThemeManager.setTheme({});
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toContain("must be an instance of");

            ThemeManager.setTheme(theme);
            t.expect(ThemeManager.getTheme()).toBe(theme);

            exc = undefined;
            try {
                ThemeManager.setTheme(theme);
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toContain("already set");

        });
    });
});