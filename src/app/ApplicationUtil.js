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

/**
 *  Internal utility class used by coon.core.app.Application to fetch various informations
 *  out of manifest files, map plugins and load configurations.
 *
 *  @private
 */
Ext.define("coon.core.app.ApplicationUtil",{

    requires: [
        // @define l8
        "l8",
        "coon.core.FileLoader",
        "coon.core.Environment",
        "coon.core.app.BatchConfigLoader",
        "coon.core.data.request.file.XmlHttpRequestFileLoader",
        "coon.core.app.ConfigLoader",
        "coon.core.data.request.HttpRequestException"
    ],

    /**
     * @var batchConfigLoader
     * @type {coon.core.app.BatchConfigLoader}
     */

    /**
     * @var configLoader
     * @type {coon.core.app.ConfigLoader}
     */

    /**
     * @constructor
     */
    constructor () {
        const me = this;

        me.configLoader = Ext.create("coon.core.app.ConfigLoader",
            coon.core.FileLoader
        );
        me.batchConfigLoader = Ext.create("coon.core.app.BatchConfigLoader", me.configLoader);

    },


    /**
     * Queries all available packages provided to a call to this method and returns
     * an array containing objects with the exact same information as in the manifest itself,
     * if, and only if the package
     *  - has a property named "coon-js" which is an object
     *  - the "coon-js"-property's value holds a "package" property that is either set to true or is
     *  an object containing further information to consume the package by this application.
     * If there is a "registerController" property in "coon-js.package.autoLoad", and its value is set to true,
     * it will be automatically computed to a string given the following pattern: [namespace].app.PackageController
     *
     *
     * @example:
     *    // consumed by this method:
     *    foo : {
     *        "coon-js" : {
     *            "package" : true
     *        }
     *    }
     *    // or
     *    bar : {
     *        "coon-js" : {
     *            "package" : {
     *                some : "information"
     *            }
     *        }
     *    }
     *
     * @param {Object} manifest an object providing package manifest information
     *
     * @return {Object}
     *
     * @private
     */
    getCoonPackages: (manifestPackages) => {
        "use strict";

        const packages = {};

        Object.entries(manifestPackages).forEach((entry) => {

            let [packageName, packageConfig] = entry,
                coonPackage = l8.unchain("coon-js.package", packageConfig);

            if (coonPackage !== undefined) {
                packages[packageName] = Ext.clone(packageConfig);

                if (l8.isObject(coonPackage.autoLoad) && coonPackage.autoLoad.registerController === true) {
                    packages[packageName]["coon-js"].package.controller = `${packageConfig.namespace}.app.PackageController`;
                }

            }
        });

        return packages;
    },


    /**
     * Returns an object that contains urls for the application-configuration.
     * The object contains a key/value-pair for the default-name of the application, i.e.
     * {default : [application_name].conf.json}
     *  and the name of the configuration file that depends on the application's coon-js.env-setting
     * {environment : [application_name].[coon-js.env].conf.json}
     * Will leave the environment-value undefined if no entry in the app.json could be found for it.
     *
     * @example
     *
     *  // app.json
     *  // sencha app build --dev --uses
     *  // {"development" : {"coon-js" : {"env" : "development"}}}
     *  const urlObj = this.getApplicationConfigUrls();
     *  console.log(urlObj);
     *  // outputs
     *  // {default : "[path]/resources/coon-js/[application_name].conf.json",
     *  // environment : "[path]/resources/coon-js/[application_name].development.conf.json"}
     *
     *
     * @return {Object}
     */
    getApplicationConfigUrls: () => {
        "use strict";

        const
            Environment = coon.core.Environment,
            applicationName = Environment.getManifest("name"),
            env =  Environment.getManifest("coon-js.env"),
            envPath = env ? "coon-js/" + [applicationName, ".", env, ".conf.json"].join("") : undefined;

        return {
            default: Environment.getPathForResource("coon-js/" + applicationName + ".conf.json"),
            environment: env ? Environment.getPathForResource(envPath) : undefined
        };
    },


    /**
     * Returns the package name this controller is associated with.
     * Returns undefined if no associated package was found.
     *
     * @param {String} controller The FQN of the controller
     * @param {Object} manifestPackages object with package information out of the manifest
     *
     * @return {undefined|String}
     *
     * @throws if manifestPackages is not an Object.
     */
    getPackageNameForController (controller, manifestPackages) {
        "use strict";

        if (!l8.isObject(manifestPackages)) {
            throw("\"manifestPackages\" must be an object");
        }

        const
            me  = this,
            packages = me.getCoonPackages(manifestPackages);

        let found;

        Object.entries(packages).some((entry) => {

            let [packageName, config] = entry;

            if (config["coon-js"].package.controller === controller) {
                found = packageName;
                return true;
            }
        });

        return found;
    },


    /**
     * Iterates through the packages, picks any as coon.js-package declared entries and checks
     * their "coon-js"-section (if any) for any ControllerPlugins configured. Will first check the
     * ConfigManager for configuration of packages, then fall back to the PackageConfiguration.
     * Will map the class-names (fqn) of the ControllerPlugins to the class-name of the Controller
     * (fqn).
     * Controller plugins can be configured in several ways: either set an entry to the package-name the
     * controller can be found in (the fqn will be computed by this class then) or specify the fqn by hand.
     * Note: controllers specified with their fqn must have their corresponding "coon-js"-packages in the
     * environment.
     * A controller plugin can also be configured with arguments that get applied to the constructor of
     * the ControllerPlugin. For specifying constructor arguments, the configuration for the controller
     * plugin has to be an object with the keys "xclass" holding the fqn of the controller plugin, and
     * "args", which is an array of argument that get passed to the constructor.
     *
     * @example
     *     // package.json of "app-cn_user" with the namespace "conjoon.cn_user"
     *     // "theme-cn_material" is a package that is required by the package that defines
     *     // this plugin in it's config. It has the namespace "conjoon.cn_material"
     *     // The plugin will be configured with the PackageController of "app-cn_user":
     *
     *     let pck = {
     *         "coon-js" : {
     *             "plugins" : {
     *                 "controller" : "theme-cn_material" // will set the value of "controller" to
     *                                                    // "conjoon.cn_material.app.plugin.ControllerPlugin"
     *             }
     *         }
     *     }
     *     // or
     *    {
     *         "coon-js" : {
     *             "plugins" : {
     *                 "controller" : ["conjoon.cn_material.app.plugin.ControllerPlugin"]
     *             }
     *         }
     *     }
     *    // or
     *    {
     *        "coon-js": {
     *            "plugins": {
     *                 "controller" : [{
     *                     "xclass": "conjoon.cn_material.app.plugin.ControllerPlugin",
     *                     "args": [{property: "value"}] // {property: "value"} is passed as the first argument to
     *                                                   // the constructor
     *                 }]
     *            }
     *
     *        }
     *
     *
     *
     *    }
     *     this.getControllerPlugins(pck); // returns {"conjoon.cn_user.app.PackageController" : ["conjoon.cn_material.app.plugin.ControllerPlugin"]}
     *
     *
     *
     * @param {Object} packages The object containing all package informations available in the environment.
     * @param {String} forController The fqn of the controller for which the pluginMap should be created. If undefined,
     * the pluginMap for all existing package controllers will be created
     *
     * @return {Object} an object where all controllers are mapped with an array of plugins they should be using
     *
     * @private
     */
    getControllerPlugins (manifestPackages, forController) {
        "use strict";

        return this.getPluginsForType("controller", manifestPackages, forController);
    },


    /**
     * Iterates through the packages, picks any as coon.js-package declared entries and checks
     * their "coon-js"-section (if any) for any ComponentPlugins configured. Will first check the
     * ConfigManager for configuration of packages, then fall back to the PackageConfiguration.
     * Will map the class-names (fqn) of the ComponentPlugins to the class-name of the Controller
     * (fqn).
     * A plugin configuration itself in the application-configuration has the following key/value-pairs:
     * - cmp: A valid component query the application uses to look up the represented component.
     * - event: The name of the event that should be listened to for instantiating and registering the plugin
     * - pclass/fclass: The fqn (i.e. class name, including namespaces) for the plugin to use. For a
     * plugin that extends Ext.plugin.Abstract, "pclass" should be used. If a grid-feature is referenced (i.e.
     * extending Ext.grid.feature.Feature), "fclass" should be used.
     *
     * @example
     *      "components": [
     *      {
     *          "cmp": "cn_navport-tbar",
     *          "pclass": "conjoon.theme.material.plugin.ModeSwitchPlugin",
     *          "event": "beforerender"
     *      }]
     *
     * @param {Object} packages The object containing all package informations available in the environment.
     * @param {String} forController The fqn of the controller for which the pluginMap should be created. If undefined,
     * the pluginMap for all existing package controllers will be created
     *
     * @return {Object} an object where all controllers are mapped with an array of plugins they should be using
     *
     * @private
     */
    getComponentPlugins (manifestPackages, forController) {
        "use strict";

        return this.getPluginsForType("components", manifestPackages, forController);
    },


    /**
     * Queries PackageConfiguration for plugins. Type of plugin can be specified
     * with "pluginType". Supported types are "controller" and "components".
     *
     * @param {String} pluginType
     * @param {Object} manifestPackages
     * @param {String} forController
     *
     * @returns {Object} an object with keys being the fqn of the controller and the value
     * being the queried plugins.
     *
     * @private
     */
    getPluginsForType (pluginType, manifestPackages, forController ) {
        "use strict";

        const types = ["controller", "components"];

        if (!types.includes(pluginType)) {
            throw new Error(`"pluginType" must be one of ${types.join(", ")}`);
        }

        const
            me = this,
            coonPackages = me.getCoonPackages(manifestPackages),
            pluginMap = {};

        Object.entries(coonPackages).forEach( (entry) => {

            let [packageName, packageConfig] = entry;

            const plugins = [].concat(
                coon.core.ConfigManager.get(packageName, `plugins.${pluginType}`, null) ||
                l8.unchain(`coon-js.package.config.plugins.${pluginType}`, packageConfig, [])
            );

            if (!plugins.length) {
                return;
            }

            const ctrl = l8.unchain("coon-js.package.controller", packageConfig);

            if (forController !== undefined && ctrl !== forController) {
                return;
            }

            plugins.forEach(function (plugin) {

                let fqn = plugin;
                if (l8.isString(plugin)) {
                    fqn = me.getFqnForPlugin(plugin, coonPackages, "controller");
                }

                if (fqn) {
                    pluginMap[ctrl] = pluginMap[ctrl] || [];
                    pluginMap[ctrl].push(fqn);
                }

            });
        });

        return pluginMap;
    },


    /**
     * Iterates through the list of plugin-names this method gets called with and returns an array with fqn
     * representing the classes of the type {coon.core.app.plugin.ApplicationPlugin} that should be used as
     * application plugins.
     * Application plugins can be configured in two ways: either set an entry to the package-name the
     * plugin can be found in (the fqn will be computed by this class then) or specify the fqn by hand.
     * Note: application plugins specified with their fqn must have their corresponding "coon-js"-packages in the
     * environment.
     *
     * @example
     *     // conjoon.conf.json of an application named "conjoon".
     *     // "theme-cn_material" is a package that is required by the package that defines
     *     // this plugin in it's config. It has the namespace "conjoon.cn_material":
     *
     *     {
     *         "conjoon" : {
     *              "plugins": {
     *                  "application": [
     *                      "theme-cn_material", // will compute the fqn to "conjoon.cn_material.app.plugin.ApplicationPlugin"
     *                     "some.other.plugins.Fqn"
     *                  ]
     *              }
     *         }
     *     }
     *
     *     this.getApplicationPlugins(pck); // returns ["conjoon.cn_material.app.plugin.ApplicationPlugin", "some.other.plugins.Fqn"]
     *
     * @param {Array} plugins
     * @param {Object} manifestPackages The object containing all package informations available in the environment.
     *
     * @return {Array} an array containing all fqns of the plugins found based on the information available in applicationConfig
     *
     * @private
     */
    getApplicationPlugins (plugins, manifestPackages) {
        "use strict";

        const
            me = this,
            coonPackages = me.getCoonPackages(manifestPackages),
            fqns = [];

        plugins.forEach( (plugin) => {

            let fqn = me.getFqnForPlugin(plugin, coonPackages, "application");

            if (fqn) {
                fqns.push(fqn);
            }
        });

        return fqns;
    },


    /**
     * Loads the application config - if available - and registers it with the ConfigManager
     * given the application name as the domain.
     * The configuration registered with the ConfigManager is the value of the "application"-property
     * found in the configuration file.
     * Will compute an url for the config based on the environment the application is used,
     * which can be specified in the app.json by configuring a "coon-js"-object with an "env"-property.
     * The value of this property will be used as an additional token in the file-name the loader looks up.
     * The pattern for this is [application_name].[env_value].conf.json.
     * If loading this specific environment-configuration fails, the loader will try to fetch the
     * configuration file that fits the pattern [application_name].conf.json.
     * Note: environment specific configurations will only be loaded if there is a "coon-js"-section configured
     * with an "env"-property.
     * This method will not throw if the configuration files could not be loaded due to a
     * coon.core.data.request.HttpRequestException.
     *
     * @example
     *  // production environment.
     *  // app.json has a "production-setting configured:
     *  // "name" : "conjoon",
     *  // "production": {
     *  //     "coon-js" : {
     *  //     "env" : "production"
     *  //    },
     *  this.loadApplicationConfig(); // tries to load "conjoon.production.conf.json",
     *                                // and fall back to "conjoon.conf.json"
     *                                // if the environment specific configuration file
     *                                // cannot be found.
     *
     *
     * @returns {Object} The configuration loaded for the application, if any.
     *
     * @see getApplicationConfigUrls
     *
     * @throws throws any expection from the used ConfigLoader's load
     *
     * @see coon.core.ConfigLoader#load
     */
    async loadApplicationConfig () {
        "use strict";

        const
            me = this,
            appName = coon.core.Environment.getManifest("name"),
            loadedConfig = await me.configLoader.load(
                appName,
                undefined,
                `${appName}`,
                false
            );

        coon.core.ConfigManager.register(
            appName, loadedConfig && loadedConfig.application
        );

        return loadedConfig;
    },


    /**
     * Loads all packages tagged as coon.js-Package based on the passed package-information.
     *
     * This will also take care of additional config-files which are optional for the loaded
     * coon.js-Package. This usually happens if the "coon-js"-section in the packages
     * "package.json" has a section "config" in "package"available:
     * @example
     *
     *     "coon-js" : {
     *         "package" : {"autoLoad" : true, "config" : true}
     *     }
     *
     * It's contents will be made available to the coon.core.ConfigManager by the used BatchConfigLoader.
     * If "package.config" in the package.json is a configuration object, its key/value pairs
     * will get overridden by key/value pairs by the same name in the custom config file.
     * See #registerPackageConfig.
     * Note: The config files for all Packages will be loaded BEFORE the package gets loaded,
     * so that the packages can take advantage of already loaded configurations.
     * This method will also take care of adding the namespaces of the packages to Ext.app and
     * pushes the controller-names found in the package-configuration to the collection
     * of controllers used by the application, if the package was configured with a PackageController.
     * Packages will not get loaded if they are either already included, or if their "autoLoad"-property
     * is set to "false".
     *
     * @param {Array} packages The array containing the package informations
     *
     * @return {Array} an array of PackageControllers that were collected during inspecting the available
     * coon.js-package information, if any
     *
     * @private
     */
    async loadPackages (manifestPackages) {
        "use strict";

        const
            me = this,
            batchLoader = me.batchConfigLoader,
            coonPackages = me.getCoonPackages(manifestPackages),
            controllers = [],
            entries = Object.entries(coonPackages);

        entries.forEach((entry) => {
            let [name, packageConfig] = entry,
                controller = l8.unchain("coon-js.package.controller", packageConfig),
                config = l8.unchain("coon-js.package.config", packageConfig),
                loadFromFile = l8.unchain("coon-js.package.loadFromFile", packageConfig);

            if (controller) {
                controllers.push(controller);
            }

            if (!config) {
                return;
            }

            if (l8.isObject(config) && loadFromFile === false) {
                coon.core.ConfigManager.register(name, config);
            } else if (l8.isString(config)) {
                batchLoader.addDomain(name, {}, config);
            } else if (config === true || l8.isObject(config)) {
                batchLoader.addDomain(name, l8.isObject(config) ? config : undefined);
            }
        });

        await batchLoader.load();

        await Promise.all(entries.map(async (entry) => {

            let [name, config] = entry;

            // packages might have autoLoad=true, but are already included, such as themes
            if (config.included || l8.unchain("coon-js.package.autoLoad", config) === false) {
                return;
            }
            return await coon.core.Environment.loadPackage(name);
        }));

        return controllers;
    },


    /**
     * @private
     */
    getFqnForPlugin: function (plugin, coonPackages, type) {
        "use strict";

        type = (""+type).toLowerCase();

        if (["application", "controller"].indexOf(type) === -1) {
            return;
        }

        let fqn;

        Object.entries(coonPackages).some( (entry) => {

            let [, packageConfig] = entry;

            // check first if a package can be identified under the name of the plugin
            // this will be given precedence
            if (coon.core.Environment.getPackage(plugin)) {
                fqn = `${coon.core.Environment.getPackage(plugin).namespace}.app.plugin.`+
                      `${type === "application" ? "Application" : "Controller"}Plugin`;
                return true;
            }

            if (plugin.indexOf(packageConfig.namespace) === 0) {
                fqn = plugin;
                return true;
            }
        });

        return fqn;
    }


});
