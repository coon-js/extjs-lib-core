/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2021-2022 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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
 * Mixin used by Application and PackageController to register ComponentPlugins.
 *
 */
Ext.define("coon.core.app.plugin.ComponentPluginMixin", {

    requires: [
        // @define
        "l8",
        "coon.core.app.ApplicationException"
    ],


    /**
     * Adds component plugins or grid features based on the specified plugin configuration.
     * The plugin configuration is an object keyed "cmp", "pclass"/"fclass" and "eventHook".
     * pclass should be used whenever the plugin is installed as a "plugin" extending {Ext.plugin.Abstract},
     * while "ftype" is reserved for grid-features extending {Ext.grid.feature.Feature}.
     *
     * @example
     *    // adds the ModeSwitchPlugin to the component identified by using the ComponentQuery
     *    // for the xtype "cn_navport-tbar". The plugin will be installed when the component
     *    // fires the "beforerender"-event, its constructor will be called with "args" as the arguments
     *    this.addComponentPlugin({
     *      "cmp": "cn_navport-tbar",
     *      "pclass": "conjoon.theme.material.plugin.ModeSwitchPlugin",
     *      "event": "beforerender",
     *      "args": [{key: "value"}]
     *   });
     *
     *
     * @param {Object} plugin A valid plugin configuration for the application.
     *
     * @returns {Object} returns the object that was used to create the control for the application
     *
     * @throws {coon.core.app.ApplicationException} if the class was not found
     */
    registerComponentPlugin (pluginCfg) {

        const
            me = this,
            args = pluginCfg.args || [],
            cmp = pluginCfg.cmp,
            eventHook = pluginCfg.event,
            isPlugin = !!pluginCfg.pclass,
            fqn = isPlugin ? pluginCfg.pclass : pluginCfg.fclass;

        if (!Ext.ClassManager.get(fqn)) {
            throw new coon.core.app.ApplicationException(
                `Could not find the ${isPlugin ? "plugin" : "feature"} "${fqn}". ` +
                "Make sure it is loaded with it's owning package."
            );
        }

        const

            cb = isPlugin ?
                cmp => cmp.addPlugin(Ext.create(fqn, ...args)) :
                cmp => cmp.features.push(Ext.create(fqn, ...args)),
            ctrl = l8.chain(`${cmp}.${eventHook}`, {}, () => cb);

        me.control(ctrl);

        return ctrl;
    }


});
