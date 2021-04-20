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
 * Abstract base class for themes that allow for accessing their various properties
 * during the runtime of an application.
 *
 * @example
 *
 *     Ext.define("MyTheme", {
 *         extend : "coon.core.Theme",
 *
 *         modes : {
 *             dark : {
 *                 name : "Dark Mode",
 *                 default : true,
 *                 colors : {
 *                     "base" : "blue",
 *                     "background": "black"
 *                 }
 *             },
 *             light : {
 *                 name : "Light Mode",
 *                 default : false,
 *                 colors : {
 *                     base : "#000000",
 *                     background : "#ffffff"
 *                 }
 *             }
 *       }
 *  });
 *
 *  let theme = Ext.create("MyTheme");
 *  coon.core.ThemeManager.setTheme(theme);
 *
 *  theme.switchMode("light");
 *  theme.switchMode("dark");
 *
 * @abstract
 */
Ext.define("coon.core.Theme", {


    config : {
        /**
         * Allows for specifying different (color-)modes this theme can use.
         * Should be an object containing keys as their unique identifiers,
         * along with (nested)objects that contain various informations
         * an application can use during runtime.
         * apply/update should be used for overriding mode-values, NOT
         * for switching modes. Use #switchMode for setting a new mode.
         *
         * @example
         *
         * Ext.define("MyTheme", {
         *
         *    extend : "coon.core.Theme",
         *
         *    modes : {
         *       dark : {
         *           name : "Dark Mode",
         *           default : true,
         *           colors : {
         *               "base" : "blue",
         *              "background": "black"
         *           }
         *       },
         *       light : {
         *           name : "Light Mode",
         *           default : false,
         *           colors : {
         *               base : "#000000",
         *               background : "#ffffff"
         *           }
         *       }
         *    }
         * });
         *
         */
        modes : undefined
    },

    /**
     * Switches between various theme modes during runtime.
     *
     * @param {String} mode The name of the mode to switch to.
     */
    switchMode : Ext.emptyFn,

    /**
     * Returns the value found for the specified key.
     *
     * @param {Mixed} key The key for which a value from this theme should
     * be returned.
     *
     * @return {Mixed} undefined if n value was found for the specified key.
     */
    get : Ext.emptyFn,

    /**
     * Sets the value for the specified key.
     *
     * @param {Mixed} key The key for which a value from this theme should
     * be set.
     * @param {Mixed} value The value to set
     *
     * @return {coon.core.Theme} this
     */
    set : Ext.emptyFn
});