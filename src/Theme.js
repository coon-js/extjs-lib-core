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
 *  coon.core.ThemeManager.setTheme(theme); // theme now available via coon.core.ThemeManager.get()
 *
 *  theme.setMode("light");
 *  theme.setMode("dark");
 *
 * @abstract
 */
Ext.define("coon.core.Theme", {


    config : {

        /**
         * The name of the entry in #modes that has it's property "default"
         * set to true.
         */
        defaultMode : undefined,

        /**
         * Switches between various theme modes during runtime.
         *
         * @type {String} The key from "modes" this theme should be using, if any.
         */
        mode : undefined,

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
         *           config : {
         *               "base" : "blue",
         *              "background": "black"
         *           }
         *       },
         *       light : {
         *           name : "Light Mode",
         *           default : false,
         *           config : {
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
     * Constructor.
     *
     * @param {Object} cfg
     */
    constructor : function (cfg) {
        const me = this;

        me.initConfig(cfg);
    },


    /**
     * Notifier to the modes-property.
     * Will automatically set the defaultMode to the mode flagged as default found
     * in the available modes and then switch to it.
     *
     */
    updateModes : function () {

        const me = this;

        me.setDefaultMode(me.findDefaultMode());
        me.setMode(me.getDefaultMode());
    },


    /**
     * Applier for "mode" for a theme. Make sure you implement updateMode to propery
     * initialize the theme with the updated mode.
     *
     * @param {String} mode The new mode the theme should be using.
     *
     * @return {undefined|String} returns undefined if the mode is not available with
     * "getModes()", otherwise the name of the new mode.
     */
    applyMode : function (mode) {

        const
            me = this,
            modes = me.getModes(),
            newMode = modes[mode];

        if (!newMode) {
            return;
        }

        return mode;
    },


    /**
     * Sets the default mode this theme.
     * To switch to the default theme, use #setMode.
     *
     * @example
     * let def = this.getDefaultMode();
     * this.setMode(def);
     *
     * this.setDefaultMode("newMode");
     * this.setMode(this.getDefaultMode);
     *
     * @param {String} mode The mode that should be used as the default mode.
     */
    applyDefaultMode : function (mode) {

        const
            me = this,
            modes = me.getModes();

        Object.entries(modes).forEach(function (entry) {
            if (entry[0] === mode) {
                entry[1].default = true;
            } else {
                entry[1].default = false;
            }
        });

    },


    /**
     * Queries the entries of #modes and returns the first one which has its
     * "default"-property set to true.
     *
     * @example
     * this.setM
     *
     * @return {Undefined|String} returns undefined if no default mode was found, otherwise
     * the name of the entry of the defualt mode.
     */
    findDefaultMode : function () {
        const
            me = this,
            modes = me.getModes(),
            defaultMode =  Object.entries(modes).find((entry) => entry[1].default === true)[0];

        return defaultMode;
    },


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