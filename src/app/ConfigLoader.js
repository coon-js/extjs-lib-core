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
 * Loader for configuration files represented by a domain.
 * The found config for the domain will be registered with the coon.core.ConfigManager.
 * Paths for domains are computed via the return value of {coon.core.Environment#getPathForResource}.
 *
 *
 * @example
 *    // existing json-file at [resource_path]/app-cn_mail.conf.json
 *    const configLoader = new coon.core.app.ConfigLoader(new coon.core.data.request.file.FileLoader());
 *    const res = await configLoader.load("app-cn_mail");
 *    console.log(res); // json-decoded contents of the json file on success
 *
 */
Ext.define("coon.core.app.ConfigLoader", {

    requires : [
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
            throw new coon.core.exception.IllegalArgumentException("\fileLoader\" must be an instance of coon.core.data.request.file.FileLoader");
        }


        Object.defineProperty(this, "fileLoader", {
            value : fileLoader,
            writable : false,
            configurable : false
        });

    },


    /**
     * Loads the config file for the specified domain and registers it with the
     * {coon.core.ConfigManager}.
     *
     * @param {String} domain The domain for which the configuration should be loaded.
     *
     * @returns {Object|Promise}
     *
     * @throws IllegalArgumentException, PromiseExecutionException
     *
     * @see {coon.core.ConfigManager}
     * @see #getPathForDomain
     *
     * @throws {coon.core.app.ConfigurationException} when an exception occurs.
     * The exception that caused this exception will be wrapped.
     */
    async load (domain) {

        const
            me = this,
            url = me.getPathForDomain(domain);

        let config = {};

        try {
            let txt = await me.fileLoader.load(url);

            try {
                config = JSON.parse(txt);
            } catch (e) {
                // wrap the ParseException later on
                throw new coon.core.exception.ParseException(e);
            }

            coon.core.ConfigManager.register(domain, config);

        } catch (e) {
            throw new coon.core.app.ConfigurationException(e.getMessage(), e);
        }

        return config;
    },


    privates : {

        /**
         * Returns the expected configuration-file name for the specified domain.
         *
         * @example
         *  loader.getFileNameForDomain("app-cn_mail"); // "app-cn_mail.conf.json"
         *
         *
         * @param {String} domain
         *
         * @return {String}
         */
        getFileNameForDomain (domain) {
            return domain + ".conf.json";
        },


        /**
         * Returns the path to the resource teh domain is representing.
         * Note: This method does not check if the file is existing.
         *
         * @param {String} domain
         *
         * @return {String} The relative path to the resource from the location
         * this script was executed.
         *
         * @see getFileNameForDomain
         * @see {coon.core.Environment#getPathForResource}
         */
        getPathForDomain (domain) {
            return coon.core.Environment.getPathForResource(this.getFileNameForDomain(domain));
        }


    }


});

