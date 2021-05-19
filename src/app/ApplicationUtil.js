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
 *  Internal utility class used by coon.core.app.Application to fetch various informations
 *  out of manifest files.
 *
 *  @private
 */
Ext.define("coon.core.app.ApplicationUtil",{

    requires : [
        "coon.core.Util",
        "coon.core.Environment",
        "coon.core.app.BatchConfigLoader",
        "coon.core.data.request.file.FileLoader",
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

        me.configLoader = new coon.core.app.ConfigLoader(
            new coon.core.data.request.file.FileLoader()
        );
        me.batchConfigLoader = new coon.core.app.BatchConfigLoader(me.configLoader);

    },


    /**
     * Queries all available packages provided to a call to this method and returns
     * an array containing objects with the exact same information as in the manifest itself,
     * if, and only if the package
     *  - has a property named "coon-js" which is an object
     *  - the "coon-js"-property's value holds a "package" property that is either set to true or is
     *  an object containing further information to consume the package by this application.
     * If there is a "controller" property in "coon.js.package", and its value is set to true,
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
     *    // not consumed by this method :
     *    foo : {
     *        "coon-js" : true
     *    }
     *    //or
     *    bar : {
     *        "coon-js" : "packageinfo"
     *    }
     *
     *
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
                coonPackage = coon.core.Util.unchain("coon-js.package", packageConfig);

            if (coonPackage !== undefined) {
                packages[packageName] = Ext.clone(packageConfig);

                if (coonPackage.controller === true) {
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
            applicationName = Environment.get("name"),
            env =  Environment.get("coon-js.env"),
            envPath = env ? "coon-js/" + [applicationName, ".", env, ".conf.json"].join("") : undefined;

        return {
            default : Environment.getPathForResource("coon-js/" + applicationName + ".conf.json"),
            environment : env ? Environment.getPathForResource(envPath) : undefined
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
     */
    getPackageNameForController (controller, manifestPackages) {
        "use strict";

        const
            me  = this,
            packages = me.getCoonPackages(manifestPackages);

        let found = undefined;
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
     * their "coon-js"-section (if any) for any ControllerPlugins configured.
     * Will map the class-names (fqn) of the ControllerPlugins to the class-name of the Controller
     * (fqn).
     * Controller plugins can be configured in two ways: either set an entry to the package-name the
     * controller can be found in (the fqn will be computed by this class then) or specify the fqn by hand.
     * Note: controllers specified with their fqn must have their corresponding "coon-js"-packages in the
     * environment.
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
     *                                                    // "conjoon.cn_material.app.plugins.ControllerPlugin"
     *             }
     *         }
     *     }
     *     // or
     *    {
     *         "coon-js" : {
     *             "plugins" : {
     *                 "controller" : "conjoon.cn_material.app.plugins.ControllerPlugin"
     *             }
     *         }
     *     }
     *
     *     this.getControllerPlugins(pck); // returns {"conjoon.cn_user.app.PackageController" : ["conjoon.cn_material.app.plugins.ControllerPlugin"]}
     *
     *
     *
     * @param {Object} packages The object containing all packlage informations available in the environment.
     *
     * @return {Object} an object where all controllers are mapped with an array of plugins they should be using
     *
     * @private
     */
    getControllerPlugins (manifestPackages) {
        "use strict";

        const
            me = this,
            coonPackages = me.getCoonPackages(manifestPackages),
            pluginMap = {};

        Object.entries(coonPackages).forEach( (entry) => {

            let [, packageConfig] = entry;

            const plugins = [].concat(coon.core.Util.unchain(
                "coon-js.package.config.plugins.controller",
                packageConfig,
                []
            ));

            if (!plugins.length) {
                return;
            }

            const ctrl = coon.core.Util.unchain("coon-js.package.controller", packageConfig);


            plugins.forEach(function (plugin) {

                let fqn;

                // query the packages to see if there are fqns specified for the
                // namespaces found in the packages.
                Object.entries(coonPackages).some( (entry) => {

                    let [, packageConfig] = entry;

                    if (plugin.indexOf(packageConfig.namespace) === 0) {
                        fqn = plugin;
                        return true;
                    }
                });

                if (!fqn && coon.core.Environment.get(`packages.${plugin}`)) {
                    fqn = `${coon.core.Environment.get(`packages.${plugin}.namespace`)}.app.plugins.ControllerPlugin`;
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
     * Loads the application config - if available - and registers it with the ConfigManager
     * given the application name as the domain.
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
     * @throws throws the coon.core.app.ConfigurationException that might be thrown
     * by the used ConfigLoader.
     */
    async loadApplicationConfig () {
        "use strict";

        const
            me = this,
            urls = me.getApplicationConfigUrls(),
            envUrl = urls.environment,
            defaultUrl = urls.default,
            appName = coon.core.Environment.get("name");

        let skipDefault = !!envUrl,
            loadedConfig;

        if (skipDefault) {
            try {
                loadedConfig = await me.configLoader.load(appName, envUrl);
            } catch (e) {
                if (typeof e.getCause === "function" && (e.getCause() instanceof coon.core.data.request.HttpRequestException)) {
                    skipDefault = false;
                } else {
                    throw e;
                }
                skipDefault = false;
            }
        }

        if (!skipDefault) {
            try {
                loadedConfig = await me.configLoader.load(appName, defaultUrl);
            } catch (e) {
                if (typeof e.getCause === "function" && !(e.getCause() instanceof coon.core.data.request.HttpRequestException)) {
                    throw e;
                }
            }
        }

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
     *         "package" : {"controller" : true, "config" : true}
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
            let [, packageConfig] = entry,
                controller = coon.core.Util.unchain("coon-js.package.controller", packageConfig),
                config = coon.core.Util.unchain("coon-js.package.config", packageConfig);

            if (controller) {
                controllers.push(controller);
            }

            batchLoader.addDomain(packageConfig.name, typeof config === "object" ? config : undefined);
        });

        await batchLoader.load();

        await Promise.all(entries.map(async (entry) => {

            let [name, config] = entry;

            if (config.included) {
                return;
            }
            return await coon.core.Environment.loadPackage(name);
        }));

        return controllers;
    }


});