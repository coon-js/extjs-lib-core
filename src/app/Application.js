/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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
 * Implementation of Ext.app.Application for creating an application providing
 * advanced routing and launch hooks. For a reference implementation, see
 * https://github.com/conjoon.
 *
 * Refer to the documentation over at github.com/coon-js/extjs-lib-core
 */
Ext.define("coon.core.app.Application",{

    extend: "Ext.app.Application",

    requires: [
        // @define l8
        "l8",
        "coon.core.app.ApplicationException",
        "coon.core.app.ApplicationUtil",
        "coon.core.app.PackageController",
        "coon.core.app.plugin.ApplicationPlugin",
        "coon.core.ConfigManager",
        "coon.core.Environment",
        "coon.core.env.ext.VendorBase"
    ],


    /**
     * @var applicationUtil
     * @type {coon.core.app.ApplicationUtil}
     * @private
     */

    /**
     * @var applicationPlugins
     * @type {Array}
     * @private
     */

    /**
     * @var routeActionStack
     * Stack for routes which were added using the method #addRouteActionToStackAndStop
     * @type {Array}
     * @private
     */

    /**
     * @var applicationView
     * @type {Mixed}
     * The view-config hat is being used as the {@link #mainView}.
     * The mainview's contents will be copied to this property to
     * make sure setting the MainView is directed by this Application
     * implementation.
     * See #launchHook which will take care of properly setting the mainView
     * once all preLaunchHookProcesses have returned true.
     *
     * @private
     */


    /**
     * @inheritdocs
     *
     * Makes sure the VendorBase of the Environment is set to {coon.core.env.ext.VendorBase}
     *
     * @throws Exception if any of the required class configs are not available,
     * or if  {@link #mainView} were not loaded already.
     */
    constructor (config) {

        const me = this;

        config = config || {};

        coon.core.Environment.setVendorBase(new coon.core.env.ext.VendorBase());

        me.applicationUtil = new coon.core.app.ApplicationUtil();

        Ext.Function.interceptAfter(me, "launch", me.runPostLaunch, me);

        me.launch = Ext.Function.createInterceptor(me.launch, me.launchHook, me);

        me.pluginMap = {};
        me.callParent([config]);
    },


    /**
     * @inheritdoc
     * Overridden to make sure the viewmodel of the view gets created and set to
     * the return value of {@link #getApplicationViewModel}
     * @param value
     *
     * @return {coon.comp.container.Viewport}
     *
     * @throws if {@link #mainView} was already set and instantiated, or if
     * the mainView ist no instance of {@link coon.comp.container.Viewport}
     */
    applyMainView (value) {

        const me = this;

        if (me.getMainView()) {
            Ext.raise({
                msg: "mainView was already set."
            });
        }


        if (!Ext.isObject(value) || value.cn_prelaunch !== true) {
            me.applicationView = value;
            return undefined;
        }

        let view = value.view;

        if (!view || Ext.Object.isEmpty(view)) {
            Ext.raise({
                msg: "Unexpected empty value for view."
            });
        }

        if (Ext.isString(view) && !l8.unchain(view, window)) {
            Ext.raise({
                msg: "The class \"" + view + "\" was not loaded and cannot be used as the mainView."
            });
        }

        return me.callParent([view]);
    },


    /**
     * The preLaunchHookProcess is a hook for the launch process which gets called
     * before the {@link #mainView} gets rendered.
     * When this method returns false, the applications's mainView does not
     * get rendered, and andy predefined "launch".method won't get called.
     * This method gives controllers the chance to change the applications's behavior
     * and hook into the process of setting up the application.
     * This is called before the {@link #launch} method initializes this Application's
     * {@link #mainView}.
     * This method will iterate over the controllers configured for this application.
     * If an {@link coon.core.app.PackageController} is configured, it's
     * {@link coon.core.app.PackageController#preLaunchHook} method will
     * be called. Additionally  its visitPlugins()-method will be called.
     *
     * @returns {boolean} false if the {@link #mainView} should not be
     * rendered, otherwise true
     *
     * @protected
     *
     * @throws if {@link #mainView} was already initialized
     *
     * @see coon.core.app.PackageController#visitPlugins
     * @see #visitPlugins
     */
    preLaunchHookProcess () {

        var me = this;

        if (me.getMainView()) {
            Ext.raise({
                sourceClass: "coon.core.app.Application",
                mainView: me.getMainView(),
                msg: "coon.core.app.Application#preLaunchHookProcess cannot be run since mainView was already initialized."
            });
        }

        me.visitPlugins();

        var ctrl = null,
            res  = true,
            controllers = this.controllers.getRange();

        for (var i = 0, len = controllers.length; i < len; i++) {

            ctrl = controllers[i];

            if (ctrl instanceof coon.core.app.PackageController) {

                ctrl.visitPlugins(me);

                if (res !== false && Ext.isFunction(ctrl.preLaunchHook)) {
                    res = ctrl.preLaunchHook(this);
                }
            }
        }

        // preLaunchHooks may not have returned explicitely boolean
        return res !== false;
    },


    /**
     * @inheritdoc
     *
     * This method needs the {@link #mainView} to be configured as a string (the class
     * name of the view to use as the applications main view) when this Application's
     * instance gets configured.
     * Before the mainView gets initialized, the {@link #preLaunchHookProcess}
     * will be called. If this method returns anything but false, the mainView will
     * be rendered. Additionally, the {@link #postLaunchHookProcess} will be called
     * by #runPostLaunch
     *
     */
    launchHook () {
        var me = this;

        if (me.preLaunchHookProcess() !== false) {
            me.setMainView({cn_prelaunch: true, view: me.applicationView});
            // this is usually done by initMainView,
            // but when the method is called, the mainview is not
            // available
            if (Ext.isModern) {
                Ext.Viewport.add(me.getMainView());
            }

            return true;
        }

        return false;
    },


    /**
     * Helper function being executed after the launch()-method of the application.
     * This method gets registered at "launch()" with "interceptAfter".
     *
     * @private
     */
    runPostLaunch () {
        const me = this;

        me.postLaunchHookProcess();
        me.releaseLastRouteAction(me.routeActionStack);

    },


    /**
     * Checks whether there is any action intercepted and available on
     * the passed routeActionStack.
     * The last available action added to the stack will be popped and resumed,
     * and the routeActionStack will be reset to an empty array.
     *
     * @return {Boolean} true if there was an action that was resumed, otherwise
     * false if there was no action to process
     *
     * @private
     */
    releaseLastRouteAction (routeActionStack) {

        if (!routeActionStack || !routeActionStack.length) {
            return false;
        }

        let action = routeActionStack.pop();
        while (routeActionStack.length) {
            routeActionStack.pop().stop();
        }

        action.resume();
        return true;
    },


    /**
     * Adds the specified action to the #routeActionStack and calls "stop()" on it,
     * preventing it from being processed further..
     *
     * @param action
     */
    interceptAction (action) {
        var me = this;

        if (!me.routeActionStack) {
            me.routeActionStack = [];
        }

        me.routeActionStack.push(action);

        return false;
    },


    /**
     * Returns true if the specified packageController can safely route
     * the action, otherwise false.
     *
     * @param {coon.core.app.PackageController} packageController
     * @param {Object} action
     *
     * @return  {Boolean}
     *
     * @see {coon.core.app.PackageController#isActionRoutable}
     */
    shouldPackageRoute (packageController, action) {
        return packageController.isActionRoutable(action);
    },


    /**
     * Hook for the launch-process, after the {@link #mainView} was initialized.
     * This method can be used for additional setup and configuration of the
     * application.
     *
     * @protected
     * @method
     * @template
     */
    postLaunchHookProcess: Ext.emptyFn,


    /**
     * Returns the configuration for the package represented by the
     * specified controller.
     *
     * @param {Ext.app.Controller} controller
     * @param {String }key
     *
     * @return {Object|undefined} The object containing the configuration, otherwise undefined if not found.
     *
     * @see coon.core.ConfigManager#get
     */
    getPackageConfig (controller, key) {
        const me            = this,
            ConfigManager = coon.core.ConfigManager,
            args          = [
                me.applicationUtil.getPackageNameForController(
                    Ext.getClassName(controller),
                    coon.core.Environment.getPackages()
                )
            ];

        if (key !== undefined) {
            args.push(key);
        }
        return coon.core.ConfigManager.get.apply(ConfigManager, args);
    },


    /**
     * Overridden to make sure that all coon.js PackageControllers found in
     * Ext.manifest are loaded before the application is started.
     * Starts loading the application-configuration, continues with the
     * required packages by calling "loadPackages()" and will then call the parent's
     * implementation.
     * Will also make sure that package-controllers are added to THIS applications
     * #controllers-list.
     *
     * @see getCoonPackages
     * @see loadPackages
     * @see loadApplicationConfig
     *
     * @throws coon.core.app.ApplicationException if mapping the controller plugins failed
     */
    async onProfilesReady () {

        const me = this;

        me.controllers = (me.controllers || []).concat(await me.initPackagesAndConfiguration());

        await me.initApplicationConfigurationAndPlugins();

        return Ext.app.Application.prototype.onProfilesReady.call(me);
    },


    /**
     * @private
     */
    async initApplicationConfigurationAndPlugins () {
        "use strict";

        const
            me = this,
            conf = await me.applicationUtil.loadApplicationConfig(),
            applicationPlugins = me.applicationUtil.getApplicationPlugins(
                conf, coon.core.Environment.getPackages()
            ),
            componentPlugins = me.applicationUtil.getComponentPlugins(conf);

        await applicationPlugins.forEach(async (plugin) => await me.addApplicationPlugin(plugin));

        componentPlugins.forEach((pluginCfg) => me.registerComponentPlugin(pluginCfg));

        Ext.app.addNamespaces(applicationPlugins);

        return {
            applicationPlugins: applicationPlugins,
            componentPlugins: componentPlugins
        };
    },


    /**
     * @private
     */
    async initPackagesAndConfiguration () {

        const me = this;

        let packageControllers = await me.applicationUtil.loadPackages(coon.core.Environment.getPackages());

        Ext.app.addNamespaces(packageControllers);

        return packageControllers;
    },


    /**
     * Overridden to make sure each controller gets its addPlugin()-method called
     * if there are any plugins registered in the Applications pluginMap.
     * Will delete each assigned controller from the pluginMap afterwards to prevent doubles.
     *
     * @param {String} name
     * @param {Boolean} preventCreate
     *
     * @returns {coon.core.app.PackageController}
     *
     * @see coon.core.app.PackageController#addPlugin
     *
     * @throws {coon.core.app.ApplicationException} if the class for the requested plugin could not be created.
     */
    getController: function (name, preventCreate) {

        const
            me = this,
            controller = me.callParent(arguments);

        if (preventCreate !== true && (controller instanceof coon.core.app.PackageController)) {

            const
                fqn = Ext.getClassName(controller),
                plugins = me.applicationUtil.getControllerPlugins(coon.core.Environment.getPackages() || {});

            if (!plugins[fqn]) {
                return controller;
            }

            plugins[fqn].forEach ((plugin) => {
                let inst,
                    xclass = l8.isString(plugin) ? plugin : plugin.xclass,
                    args = l8.isString(plugin) ? [] : plugin.args;

                try {
                    inst = Ext.create(xclass, ...args);
                } catch (e) {
                    throw new coon.core.app.ApplicationException(
                        `Could not create instance for specified PluginController "${xclass}"`,
                        e
                    );
                }

                controller.addPlugin(inst);
            });

        }

        return controller;
    },


    /**
     * Adds an application plugin to the list of plugins this application maintains.
     * The method will try to resolve the fqn submitted to this method by using the Ext.ClassManager.
     *
     * @param {String} className
     *
     * @return this
     *
     * @throws {coon.core.app.ApplicationException} if the plugin is not available, or if the
     * plugin is not an instance of {coon.core.app.plugin.ApplicationPlugin}
     */
    addApplicationPlugin (plugin) {

        const me = this;

        if (typeof plugin === "string") {
            if (!Ext.ClassManager.get(plugin)) {
                throw new coon.core.app.ApplicationException(
                    `Could not find the plugin "${plugin}". Make sure it is loaded with it's owning package.`
                );
            }
            plugin = Ext.create(plugin);
        }

        if (!(plugin instanceof coon.core.app.plugin.ApplicationPlugin)) {
            throw new coon.core.app.ApplicationException(
                "\"plugin\" must be an instance of coon.core.app.plugin.ApplicationPlugin"
            );
        }

        if (!me.applicationPlugins) {
            me.applicationPlugins = [];
        }

        let found = me.applicationPlugins.some((plug) => {
            return plug.getId() === plugin.getId();
        });

        if (found) {
            return me;
        }

        me.applicationPlugins.push(plugin);

        return me;
    },


    /**
     * Adds component plugins or grid features based on the specified plugin configuration.
     * The plugin configuration is an object keyed "cmp", "pclass"/"fclass" and "eventHook".
     * pclass should be used whenever the plugin is installed as a "plugin" extending {Ext.plugin.Abstract},
     * while "ftype" is reserved for grid-features extending {Ext.grid.feature.Feature}.
     *
     * @example
     *    // adds the ModeSwitchPlugin to the component identified by using the ComponentQuery
     *    // for the xtype "cn_navport-tbar". The plugin will be installed when the component
     *    // fires the "beforerender"-event
     *    this.addComponentPlugin({
     *      "cmp": "cn_navport-tbar",
     *      "pclass": "conjoon.theme.material.plugin.ModeSwitchPlugin",
     *      "event": "beforerender"
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
            cb = isPlugin
                ? cmp => cmp.addPlugin(Ext.create(fqn))
                : cmp => cmp.features.push(Ext.create(fqn)),
            ctrl = l8.chain(`${cmp}.${eventHook}`, {}, () => cb);

        me.control(ctrl);

        return ctrl;
    },


    /**
     * Iterates over the applicationPlugins-collection holding instances of
     * {coon.core.app.plugin.ApplicationPlugin} and calls their run-method, by passing
     * this application as the owner of the plugin.
     *
     * @private
     *
     * @see coon.core.app.plugin.ApplicationPlugin#run
     */
    visitPlugins: function () {
        const
            me = this,
            plugins = me.applicationPlugins || [];

        plugins.forEach((plugin) => plugin.run(me));
    }

});
