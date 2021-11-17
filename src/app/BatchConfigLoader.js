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
 * Loader for batching the loading of multiple configuration files represented by different domains.
 * The found configurations for the domain will be registered with the coon.core.ConfigManager.
 * Actual loading will be delegated to the {coon.core.app.ConfigLoader} an instance of this class
 * was configured with.
 * Registering domains will be done by calling add(), specifying the domain to load and optionally
 * passing a default configuration to the method that will be registered with the domain in case the
 * configuration file cannot be loaded since its resource was not accessible (indicated by a HttpRequestException
 * thrown by the FileLoader used by the ConfigLoader). Any other exceptions will bubble up and stored
 * with the owning domain key in a batchResult-object, which will be returned by load().
 *
 * @example
 *    // existing json-file for domain "app-cn_mail" at [resource_path]/app-cn_mail.conf.json,
 *    // defaultConfig: {"foo": "bar"}
 *    //
 *    // NOT existing json-file for domain "foobar",
 *    // defaultConfig: {"not" : "found"}
 *    //
 *    // existing file for domain "snafu", [resource_path]/snafu.conf.json, but does not contain valid JSON
 *    //  defaultConfig: {"completely" : "ignored"}
 *    //
 *    const batchLoader = new coon.core.app.BatchConfigLoader(new coon.core.app.ConfigLoader());
 *
 *    // add the domains along with their configuration
 *    batchLoader.addDomain("app-cn_mail", {"foo": "bar"});
 *    batchLoader.addDomain("foobar", {"not": "found"});
 *    batchLoader.addDomain("snafu", {"completely": "ignored"});
 *
 *
 *    const res = await configLoader.load();
 *    console.log(res); // equals to an object with the following entries:
 *    //
 *    //    {
 *    //     "app-cn_mail" : {[The configuration as found at [resource_path]/app-cn_mail.conf.json]},
 *    //     "foobar" : {"not" : "found"}, // this is the defaultConfig as specified when calling add()
 *    //     "snafu" : [an exception of the type coon.core.exception.ConfigurationException, wrapping an
 *    //                exception of the type coon.core.exception.ParseException]
 *    //    }
 *    //
 *    //
 *
 */
Ext.define("coon.core.app.BatchConfigLoader", {

    requires: [
        // @define
        "l8",
        "coon.core.app.ConfigLoader",
        "coon.core.ConfigManager",
        "coon.core.exception.IllegalArgumentException"
    ],

    /**
     * @var configLoader
     * @type {coon.core.app.ConfigLoader}
     * @private
     */

    /**
     * The list of domains this ConfigLoaderUtil should manage.
     * @var domains
     * @type {Array}
     * @private
     */

    /**
     *
     * @param configLoader
     *
     * @throws {coon.core.exception.IllegalArgumentException} if configLoader is not
     * an instance of coon.core.app.ConfigLoader
     */
    constructor (configLoader) {

        if (!(configLoader instanceof coon.core.app.ConfigLoader)) {
            throw new coon.core.exception.IllegalArgumentException(
                "configLoader must be an instanceof coon.core.app.ConfigLoader"
            );
        }

        const me = this;

        me.configLoader = configLoader;
    },


    /**
     * Adds the domain to the list of domains this util should take care of during
     * loading.
     * If the file for the domain could not be loaded, the
     * specified defaultConfig will be registered with the domain name.
     * If a fileName is specified, _this_ file will be loaded (after being resolved to
     * its proper path) for the configuration, instead of relying on auto computing the
     * filename.
     *
     * @param {String} domain
     * @param {Object} [defaultConfig]
     * @param {String} [fileName]
     *
     */
    addDomain (domain, defaultConfig , fileName) {

        const me = this;

        if (!me.domains) {
            me.domains = {};
        }

        if (me.domains[domain]) {
            return false;
        }

        me.domains[domain] = {
            defaultConfig: defaultConfig
        };

        if (l8.isString(fileName)) {
            me.domains[domain].fileName = fileName;
        }

        return true;
    },


    /**
     * Initiates loading of the config for all the domains
     * this batch-loader maintains.
     *
     * @returns {Object} Returns an object containing the domains as keys and their
     * operation result as the value. The operation result will either be
     * the configuration that was loaded for the domain, or an exception of
     * the type coon.core.app.ConfigurationException, representing the
     * causing Error.
     *
     * @see #loadDomain
     */
    async load () {

        const
            me = this,
            domains = me.domains || {};

        let entries = Object.entries(domains),
            batchResult;

        // unfortunately, not properly compiling with SenchaCMD7.4.0's Closure Compiler
        // -> for await (const [domain, defaultConfig] of  Object.entries(domains)) {
        // also, destructuring assignments do not properly work w/ 7.4.0, so we have to
        // assign the [domain, defaultConfig] manually
        batchResult = await Promise.all(entries.map( async entry => {

            let result, domain, domainConfig;

            domain = entry[0];
            domainConfig = entry[1];

            try {
                result = await me.loadDomain(domain, domainConfig);
            } catch (e) {
                result = e;
            }

            return [domain, result];
        }));

        return Object.fromEntries(batchResult);
    },


    /**
     * Loads the domain and registers the defaultConfig if the configuration file
     * for the specified domain could not be loaded, indicated by a
     * {coon.core.data.request.HttpRequestException}, which this method will test a
     * thrown ConfigurationException for.
     * Will re-throw any other coon.core.app.ConfigurationException that does not wrap
     * a coon.core.data.request.HttpRequestException.
     *
     * @param {String} domain
     * @param {Object} domainConfig
     * @param {Object} [domainConfig.defaultConfig] The default config used for the domain
     * @param {String} [domainConfig.fileName] if this attribute is present and holds a value,
     * _this_ file will be loaded for the configuration, instead of a file name computed given the
     * package and the environment. See #addDomain.
     *
     * @return {Object} either the config loaded by the used ConfigLoader, or the defaultConfig
     * if a HttpRequestException during the attempt to load the configuration file for
     * the given domain.
     *
     * @private
     *
     * @throws {coon.core.app.ConfigurationException} re-throws any ConfigurationException thrown
     * by the ConfigLoader is the cause was not a HttpRequestException
     */
    async loadDomain (domain, domainConfig) {

        const
            me = this,
            Manager = coon.core.ConfigManager,
            configLoader = me.configLoader,
            Environment = coon.core.Environment,
            getResourcePath = (file) =>
                Environment.getPathForResource(Environment.getManifest("coon-js.resourceFolder") + "/" + file);

        try {
            let
                url,
                fileName = domainConfig.fileName;

            if (fileName) {
                url = getResourcePath(fileName);
            }

            await configLoader.load(domain, url);
        } catch (e) {
            let cause = e.getCause() || {};
            if (!(cause instanceof coon.core.data.request.HttpRequestException)) {
                // re-throw the ConfigurationException thrown by the ConfigLoader
                throw (e);
            }
        }

        // the ConfigLoader will have registered the domain with the config already
        // if it could be successfully loaded and parsed as a JSON Object.
        // We will check for the domain here and apply defaultConfig if it does not exist,
        // otherwise, we will return the loaded configuration as an object.
        // This will be wrapped in a resolved promise.
        return Manager.get(domain) || Manager.register(domain, domainConfig.defaultConfig);
    }

});
