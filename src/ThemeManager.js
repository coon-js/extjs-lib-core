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

/**
 * Utility class for registering and accessing {coon.core.Theme}-Themes.
 * Once set, themes are immutable with the ThemeManager they are used.
 *
 * @example
 *
 *      let theme = Ext.create("coon.core.Theme");
 *
 *      coon.core.ThemeManager.setTheme(theme);
 *      theme === coon.core.ThemeManager.getTheme(); // true
 *
 *      let theme2 = Ext.create("coon.core.Theme");
 *
 *      try {
 *          coon.core.ThemeManager.setTheme(theme2);
 *      } catch (e) {
 *          console.log("theme already set");
 *      }
 *
 *
 */
Ext.define("coon.core.ThemeManager", {

    singleton : true,

    requires : [
        "coon.core.Theme"
    ],

    config : {
        /**
         * @type coon.core.Theme
         */
        theme : undefined
    },

    /**
     * Registers the theme managed by this Manager.
     *
     * @param {coon.core.Theme} theme
     *
     * @throws if theme is not an instance of coon.core.Theme or if a
     * theme was already set for this manager.
     */
    applyTheme : function (theme) {

        const me = this;

        if (me.getTheme()) {
            Ext.raise("\"theme\" was already set.");
        }

        if (!(theme instanceof coon.core.Theme)) {
            Ext.raise("\"theme\" must be an instance of coon.core.Theme");
        }

        return theme;

    }

});