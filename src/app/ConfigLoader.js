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
 * Loader for configuration files represented by a domain.
 * The found config for the domain will be registered with the coon.core.ConfigManager.
 * Base-paths for domains are computed via the return value of {coon.core.Environment#getPathForResource}.
 *
 * * @example
 *    // existing json-file at [resource_path]/[coon-js.resourcePath]/app-cn_mail.conf.json
 *    const configLoader = new coon.core.app.ConfigLoader(new coon.core.data.request.file.XmlHttpRequestFileLoader());
 *    const res = await configLoader.load("app-cn_mail");
 *    console.log(res); // json-decoded contents of the json file on success
 *
 */
Ext.define("coon.core.app.ConfigLoader", {

    requires: [
        // @define l8
        "l8",
        "coon.core.ConfigManager",
        "coon.core.Environment",
        "coon.core.app.ConfigurationException",
        "coon.core.exception.IllegalArgumentException",
        "coon.core.data.request.file.FileLoader",
        "coon.core.exception.ParseException"
    ],

    /**
     * @type {coon.core.data.request.file.FileLoader}
     * @var fileLoader
     * @private
     */


    /**
     * Creates a new instance of this class.
     *
     * @param {coon.core.data.request.file.FileLoader} fileLoader
     *
     * @throws {coon.core.exception.IllegalArgumentException} if fileLoader is not an
     * instance of {coon.core.data.request.file.FileLoader}
     */
    constructor (fileLoader) {

        if (!(fileLoader instanceof coon.core.data.request.file.FileLoader)) {
            throw new coon.core.exception.IllegalArgumentException(
                "\fileLoader\" must be an instance of coon.core.data.request.file.FileLoader"
            );
        }


        Object.defineProperty(this, "fileLoader", {
            value: fileLoader,
            writable: false,
            configurable: false
        });

    },


    /**
     * Loads the config file for the specified domain and registers it with the
     * {coon.core.ConfigManager}, if registerConfig is not set to "false".
     *
     * @param {String} domain The domain for which the configuration should be loaded.
     * @param {String} url The url where the configuration file for exactly this domain can be found.
     *                     Will fall back to #getPathForDomain if not specified, of which first the environment
     *                     related config will be loaded. If this file does not exist, the default configuration
     *                     file will be loaded..
     * @param {String} configPath a path in the loaded json that should be used as the configuration object.
     * empty object will be registered if a path is specified and the target does not exist.
     * @param {Boolean|undefined} registerConfig optional argument to specify whether the config
     * loaded should be registered with the ConfigManager, or simply returned
     *
     * @returns {Object|Promise|undefined} undefined if the url to use is not existing
     *
     * @throws IllegalArgumentException, PromiseExecutionException
     *
     * @see {coon.core.ConfigManager}
     * @see #getPathForDomain
     *
     * @throws {coon.core.app.ConfigurationException} when an exception occurs.
     * The exception that caused this exception will be wrapped.
     */
    async load (domain, url, configPath, registerConfig) {
        "use strict";

        const me = this;

        if (!url) {
            const paths = me.getPathForDomain(domain);
            let exists = await me.fileLoader.ping(paths.environment);

            url = url ? url : exists ? paths.environment : paths.default;

            if (url !== paths.environment && await me.fileLoader.ping(url) === false) {
                return undefined;
            }
        }

        let config = {}, txt;

        try {
            txt = await me.fileLoader.load(url);
        } catch (e) {
            throw new coon.core.app.ConfigurationException(e, e);
        }

        try {
            if (txt) {
                config = JSON.parse(txt);
            }
        } catch (e) {
            throw new coon.core.exception.ParseException(e);
        }

        config = configPath ? l8.unchain(configPath, config, {}) : config;

        if (registerConfig !== false) {
            coon.core.ConfigManager.register(
                domain, config
            );
        }


        return config;
    },


    privates: {

        /**
         * Returns an object that contains file names for the domain configuration.
         * The object contains a key/value-pair for the default-name of the domain, i.e.
         * {default : [domain].conf.json}
         *  and the name of the configuration file that depends on the application's coon-js.env-setting
         * {environment : [domain].[coon-js.env].conf.json}
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
         * @example
         *  // app.json
         *  // {"development" : {"coon-js" : {"env" : "development"}}}
         *  loader.getFileNameForDomain("app-cn_mail"); // {default : "app-cn_mail.conf.json",
         *                                              // environment: "app-cn_mail.development.conf.json"}
         *
         *
         * @param {String} domain
         *
         * @return {Object} fileInfo The object containing information about the configuration files
         * @return {Object} fileInfo.default domain + ".conf.json"
         * @return {Object} fileInfo.environment domain + ".conf.json"
         */
        getFileNameForDomain (domain) {

            const
                Environment = coon.core.Environment,
                env =  Environment.getManifest("coon-js.env");

            return {
                default: domain + ".conf.json",
                environment: env ? domain + "." + env + ".conf.json" : undefined
            };
        },


        /**
         * Returns the paths to the resource the domain is representing.
         * Note: This method does not check if the file is existing.
         *
         * @example
         *
         *    // app.json:
         *    {    ...
         *        "production": {
         *            "coon-js": {
         *                "env" : "production",
         *                "resourcePath": "coon-js/files"
         *            }
         *        }
         *        ...
         *    }
         *
         *     coon.core.Environment.getManifest("coon-js.resourcePath"); // returns "coon-js/files";
         *     coon.core.Environment.getPathForResource(""); // returns "./resources"
         *     this.getFileNameForDomain("domain").default; // returns "domain.conf.json"
         *     this.getFileNameForDomain("domain").environment; // returns "domain.production.conf.json"
         *     this.getPathFormDomain("domain").default; // returns "./resources/coon-js/files/domain.conf.json"
         *     this.getPathFormDomain("domain").environment; // returns "./resources/coon-js/files/domain.production.conf.json"
         *
         * @param {String} domain
         *
         * @return {Object} pathInfo The relative path to the resource from the location
         * this script was executed. Will weave the value found in the "coon-js.resourcePath"-environment
         * in if available.
         * @return {Object} pathInfo.default
         * @return {Object} pathInfo.environment
         *
         * @see getFileNameForDomain
         * @see {coon.core.Environment#getPathForResource}
         */
        getPathForDomain (domain) {

            const
                me = this,
                Environment = coon.core.Environment,
                fileInfo    = me.getFileNameForDomain(domain);

            let resourcePath = Environment.getManifest("coon-js.resourcePath");

            resourcePath = resourcePath ? resourcePath +"/" : "";

            return {
                default: Environment.getPathForResource(resourcePath + fileInfo.default),
                environment: fileInfo.environment ? Environment.getPathForResource(resourcePath + fileInfo.environment) : undefined
            };
        }


    }

});
