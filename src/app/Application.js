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
 * Implementation of Ext.app.Application for creating an application providing
 * advanced routing and launch hooks. For a reference implementation, see
 * https://github.com/conjoon.
 *
 * NOTE:
 * =====
 * This Application implementation queries Ext.manifest for packages which are defined as
 * "used" in app.json and have the "coon-js" section configured with an entry "packageController"
 * configured:
 * @examples
 *    "coon-js" : {"package" : {"controller" : true}}
 *
 * This packages will dynamically loaded by THIS application implementation, and
 * THIS application will make sure that Ext.env.Ready is blocked until all packages
 * where loaded, before the regular application startup pipeline is continued.
 * We're actively overwriting onProfilesReady for this.
 *
 * Any predefined launch()-method will only be called if the preLaunchHook()-process
 * returns true.
 * preLaunchHook() will also take care of properly setting the mainView up if, and only
 * if all associated PackageController will return true in their preLaunchHook().
 *
 */
Ext.define("coon.core.app.Application", {

    extend: "Ext.app.Application",

    requires : [
        "Ext.Package",
        "coon.core.app.PackageController",
        "coon.core.Util",
        "coon.core.ConfigManager"
    ],


    /**
     * Maps fqn of coon.core.app.PackageController instances
     * to their packages they were defined in.
     * @type {Object}
     * @private
     */
    packageMap : null,

    /**
     * Stack for routes which were added using the method #addRouteActionToStackAndStop
     * @type {Array} routeActionStack
     * @private
     */
    routeActionStack : null,

    /**
     * @type {Mixed} applicationView
     * The view-config hat is being used as the {@link #mainView}.
     * The mainview's contents will be copied to this property to
     * make sure setting the MainView is directed by this Application
     * implementation.
     * See #launchHook which will take care of properly setting the mainView
     * once all preLaunchHookProcesses have returned true.
     *
     * @private
     */
    applicationView : null,


    /**
     * @inheritdocs
     *
     * @throws Exception if any of the required class configs are not available,
     * or if  {@link #mainView} were not loaded already.
     */
    constructor : function (config) {

        var me = this;

        config = config || {};


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
    applyMainView: function (value) {

        const me = this;

        if (me.getMainView()) {
            Ext.raise({
                msg : "mainView was already set."
            });
        }


        if (!Ext.isObject(value) || value.cn_prelaunch !== true) {
            me.applicationView = value;
            return undefined;
        }

        let view = value.view;

        if (!view || Ext.Object.isEmpty(view)) {
            Ext.raise({
                msg : "Unexpected empty value for view."
            });
        }

        if (Ext.isString(view) && !coon.core.Util.unchain(view, window)) {
            Ext.raise({
                msg : "The class \"" + view + "\" was not loaded and cannot be used as the mainView."
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
     * be called.
     *
     * @returns {boolean} false if the {@link #mainView} should not be
     * rendered, otherwise true
     *
     * @protected
     *
     * @throws if {@link #mainView} was already initialized
     */
    preLaunchHookProcess : function () {

        var me = this;

        if (me.getMainView()) {
            Ext.raise({
                sourceClass : "coon.core.app.Application",
                mainView    : me.getMainView(),
                msg         : "coon.core.app.Application#preLaunchHookProcess cannot be run since mainView was already initialized."
            });
        }

        var ctrl = null,
            res  = true,
            controllers = this.controllers.getRange();

        for (var i = 0, len = controllers.length; i < len; i++) {

            ctrl = controllers[i];

            if (ctrl instanceof coon.core.app.PackageController) {

                ctrl.visitPlugins(me);

                if (Ext.isFunction(ctrl.preLaunchHook) && res !== false) {
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
    launchHook : function () {
        var me = this;

        if (me.preLaunchHookProcess() !== false) {
            me.setMainView({cn_prelaunch : true, view : me.applicationView});
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
    runPostLaunch : function () {
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
    releaseLastRouteAction : function (routeActionStack) {

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
    interceptAction : function (action) {
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
    shouldPackageRoute : function (packageController, action) {
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
    postLaunchHookProcess : Ext.emptyFn,


    /**
     * Returns the configuration for the package represented by the
     * specified controller.
     *
     * @param {Ext.}controller
     * @param {String }key
     *
     * @see coon.core.ConfigManager#get
     *
     * @throws if there is no package registered with this controller in
     * #packageMap
     */
    getPackageConfig : function (controller, key) {
        const me            = this,
            ConfigManager = coon.core.ConfigManager,
            args          = [me.getPackageNameForController(controller)];

        if (key !== undefined) {
            args.push(key);
        }
        return coon.core.ConfigManager.get.apply(ConfigManager, args);
    },


    /**
     * Returns the package name this controller is associated with.
     * Returns null if no associated package was found.
     * Note: This method can only be called after packages and their corresponding
     * controllers were computed in #findCoonJsPackageControllers.
     *
     * @param {Ext.app.Controller} controller
     *
     * @return {null|String}
     *
     * @see packageMap
     */
    getPackageNameForController : function (controller) {

        const me  = this,
            fqn = Ext.getClassName(controller);

        if (!me.packageMap[fqn]) {
            Ext.raise("No package registered for \"" + fqn + "\"");
        }

        return me.packageMap[fqn];
    },


    /**
     * Overridden to make sure that all coon.js PackageControllers found in
     * Ext.manifest are loaded before the application is initiated.
     * Starts loading required packages by calling "handlePackage()" and
     * returns all found packageController that are required by this app.
     * Will also make sure that those controllers are added to THIS applications
     * #controllers-list.
     * While packages are loaded, Ext.env.Ready is blocked and the original
     * Ext.app.Application.prototype.onProfilesReady is registered with Ext.onReady.
     * Ext.env.Ready is unblocked in #handlePackageLoad.
     *
     * @return {Object} all the coon-js packages that should have been marked for
     * loading (available after Ext.onReady was called).
     *
     * @see findCoonJsPackageControllers
     * @see handlePackageLoad
     */
    onProfilesReady : function () {

        const me          = this,
            orgPackages = me.findCoonJsPackageControllers(Ext.manifest),
            packages    = Ext.clone(orgPackages);

        if (!me.controllers) {
            me.controllers = [];
        }

        if (packages.length) {

            packages.forEach(function (packageConfig) {
                if (packageConfig.controller !== false) {
                    me.controllers.push(packageConfig.controller);
                    Ext.app.addNamespaces(packageConfig.namespace);
                }

            });

            Ext.env.Ready.block();

            Ext.onReady(function () {
                try {
                    me.mapControllerPlugins(orgPackages);
                } catch (e) {
                    Ext.raise({
                        "msg" : "Mapping the plugins failed",
                        "reason" : e
                    });
                }

                Ext.app.Application.prototype.onProfilesReady.call(me);
            });

            me.handlePackageLoad(packages.pop(), packages);


        } else {
            Ext.app.Application.prototype.onProfilesReady.call(me);
        }


        return orgPackages;
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
     */
    getController : function (name, preventCreate) {

        const 
            me = this, 
            controller = me.callParent(arguments);

        if (controller && (controller instanceof coon.core.app.PackageController)) {

            const
                fqn = Ext.getClassName(controller),
                plugins = me.pluginMap[fqn];

            if (!plugins) {
                return controller;
            }
            
            plugins.forEach (function (plugin) {
                controller.addPlugin(Ext.create(plugin));
            });

            delete me.pluginMap[fqn];
        }

        return controller;
    },


    /**
     * Called by overridden implementation of onProfilesReady to load all packages
     * available in remainingPackages.
     * The method will call itself until all entries of remainingPackages have been
     * processed by Ext.Package#load. Once this is done, the original implementation
     * of Ext.app.Application.onProfilesReady will be called.
     *
     * The process utilizes Promises and will also take care of additional config-files
     * which are optional for the loaded coon.js-Package. This usually happens if the
     * "coon-js"-section in the packages "package.json" has a section "config" in "package"
     * available:
     * @example
     *
     *     "coon-js" : {
     *         "package" : {"controller" : true, "config" : true}
     *     }
     *
     * Config files will be searched at the URL returned by computePackageConfigUrl().
     * The file should be a valid JSON file. It's contents will be made available to
     * the coon.core.ConfigManager.
     * If "package.config" in the package.json is a configuration object, its key/value pairs
     * will get overridden by key/value pairs by the same name in the custom config file.
     * See #registerPackageConfig.
     * Note: The config files for each Package will be loaded BEFORE the package gets loaded,
     * so that the packages can take advantage of already loaded configurations.
     *
     * @param {String} packageName
     * @param {Array} remainingPackages
     *
     * @private
     *
     * @see loadPackageConfig
     * @see packageConfigLoadResolved
     * @see packageConfigLoadRejected
     */
    handlePackageLoad : function (packageConfig, remainingPackages) {

        const me = this;

        if (!packageConfig) {
            Ext.env.Ready.unblock();
            return;
        }

        let load = function (packageConfig) {

            if (packageConfig.included) {
                return Promise.resolve();
            }
            return Ext.Package.load(packageConfig.name);
        };

        me.loadPackageConfig(packageConfig)
            .then(
                me.packageConfigLoadResolved.bind(me),
                me.packageConfigLoadRejected.bind(me)
            )
            .then(
                load.bind(me, packageConfig)
            )
            .then(
                me.handlePackageLoad.bind(me, remainingPackages.pop(), remainingPackages),
                (e) => {Ext.raise({msg : "Error while loading package", error : e});}
            );
    },


    /**
     * Queries all available packages in Ext.manifest.packages and returns
     * an array containing objects with the following informations:
     * name : [package-name]
     * controller: [packageNamespace].app.PackageController,
     * namespace : [packageNamespace]
     * metadata : [information from the package as found in the manifest]
     * if, and onlyif:
     *  - The packages was not yet loaded
     *  - The property "included" of the package is not equal to "true"
     *  - The package has a property named "coon-js" which is an object and
     *    has the property "package.controller" set to true
     *
     * @param {Object} manifest an object providing manifest information (Ext.manifest)
     *
     * @return {Array}
     *
     * @private
     *
     * @throws if a controller for a package gets registered in packageMap
     * and the entry already exists
     */
    findCoonJsPackageControllers : function (manifest) {

        const me          = this,
            packages = [],
            mp          = manifest && manifest.packages ? manifest.packages : {},
            keys        = Object.keys(mp);

        if (!me.packageMap) {
            me.packageMap = {};
        }

        keys.forEach(function (key) {

            let entry = mp[key], ns, fqn,
                cPackage = coon.core.Util.unchain("coon-js.package", entry);

            if (cPackage !== undefined) {
                ns  = entry.namespace;
                fqn = ns + ".app.PackageController";

                packages.push({
                    included : entry.included === true,
                    name     : key,
                    metadata : entry,
                    controller : cPackage && cPackage.controller === true ? fqn : false,
                    namespace  : ns
                });

                if (me.packageMap[fqn]) {
                    Ext.raise(
                        "Unexpected error: PackageController \"" + fqn +
                        "\" was already registered (via package \"" + me.packageMap[fqn] + "\")");
                }
                me.packageMap[fqn] = key;
            }
        });


        return packages;
    },


    privates : {

        /**
         * Returns a Promise responsible for loading a json-file holding
         * configuration options for the package represented by loadedPackageEntry.
         *
         * @param {Object} packageEntry
         *
         * @return {Promise}
         *
         * @private
         *
         * @see getPackageConfigUrl
         */
        loadPackageConfig : function (packageEntry) {

            const me = this,
                packageName   = packageEntry.name,
                defaultConfig = coon.core.Util.unchain("metadata.coon-js.package.config", packageEntry);

            if (defaultConfig !== undefined) {

                return Ext.Ajax.request({
                    method : "GET",
                    url: me.computePackageConfigUrl(packageName),
                    defaultPackageConfig : defaultConfig,
                    params : {
                        packageName : packageName
                    },
                    scope : me
                });
            }

            // eslint-disable-next-line
            console.info("No default \"packageConfig\" found in package.json for \"" + packageName + "\".");
            return Ext.Deferred.resolved(packageName);
        },


        /**
         * Returns the url for the specified packageName for which the
         * configuration file should be loaded, matching the
         * following pattern:
         * [app_name]/resources/coon-js/[package-name].conf.json
         *
         * @param {String} packageName
         *
         * @return {String}
         */
        computePackageConfigUrl : function (packageName) {
            return Ext.getResourcePath("coon-js/" + packageName, null, "") + ".conf.json";
        },


        /**
         * Resolver-Function for a successful request made by #loadPackageConfig
         * Delegates to #registerPackageConfig to merge default config with
         * custom config.
         *
         * @param {Object} request
         *
         * @see registerPackageConfig
         */
        packageConfigLoadResolved : function (request) {

            const me = this;

            if (Ext.isString(request)) {
                return request;
            }

            let ajax = request.request,
                packageName = ajax.params.packageName;

            me.registerPackageConfig(
                packageName,
                ajax.defaultPackageConfig,
                Ext.decode(request.responseText)
            );

            return packageName;
        },

        /**
         * Reject-Function for a failed attempt made by #loadPackageConfig
         * requesting a configuration file, or if there was no configuration-section
         * available at first.
         * If the request did not find a configuration file, registerPackageConfig
         * will be called with the default-config and an empty object.
         *
         * @param {Object} request
         *
         * @see registerPackageConfig
         */
        packageConfigLoadRejected : function (request) {

            const me = this;

            if (request === false) {
                return;
            }

            let ajax = request.request,
                packageName = ajax.params.packageName;

            console.warn("No custom configuration file for \"" + packageName + "\" found.");

            me.registerPackageConfig(
                packageName,
                ajax.defaultPackageConfig,
                {}
            );

            return packageName;
        },


        /**
         * Will merge defaultConfig and customConfig in one configuration object and make it
         * available in coon.core.ConfigManager.
         * @param {String} packageName
         * @param {Object} defaultConfig
         * @param {Object} customConfig
         *
         * @private
         */
        registerPackageConfig : function (packageName, defaultConfig, customConfig) {

            const cloned = Ext.isObject(defaultConfig) ? Ext.clone(defaultConfig) : {};
            coon.core.ConfigManager.register(packageName, Ext.apply(cloned, customConfig));
        },


        /**
         * Iterates through the packages and check their configuration (if any) if there are
         * any ControllerPlugins configured.
         * Will map the class-names (fqn) of the ControllerPlugins to the class-name of the Controller
         * (fqn) in pluginMap.
         *
         * @param {Array} packages
         *
         * @return {Object} pluginMap
         *
         * @private
         */
        mapControllerPlugins : function (packages) {

            const me = this;

            packages.forEach(function (pck) {

                let plugins = coon.core.ConfigManager.get(pck.name, "plugins.controller");
                if (!plugins) {
                    return me.pluginMap;
                }

                plugins.forEach(function (plugin) {

                    let ctrl = pck.controller,
                        fqn = Ext.manifest.packages[plugin].namespace + ".app.ControllerPlugin";

                    me.pluginMap[ctrl] = me.pluginMap[ctrl] || [];
                    me.pluginMap[ctrl].push(fqn);
                });
            });

            return me.pluginMap;
        }

    }

});