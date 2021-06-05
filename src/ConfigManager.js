/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2020-2021 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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
 * Utility class for covenient access to configurations.
 * Configurations are identified by domains which hold a specific block of configuration-
 * options.
 *
 * @example
 *
 *      coon.core.ConfigManager.register("dev-cn_imapusersim", {authUrl : "/foo/bar", "section" : {"a" : "b"}});
 *      coon.core.ConfigManager.register("dev-cn_imapusersim", {authUrl : "/foo/bar"}); // throws exceptin
 *      coon.core.ConfigManager.get("dev-cn_imapusersim"); // {authUrl : "/foo/bar"}
 *      coon.core.ConfigManager.get("dev-cn_imapusersim", "section.a"); // "b"
 *      coon.core.ConfigManager.get("dev-cn_imapusersim", "prop"); // undefined
 *      coon.core.ConfigManager.get("dev-cn_imapusersim", "prop", "someDefaultValue"); // "someDefaultValue"
 */
Ext.define("coon.core.ConfigManager", {

    requires: [
        // @define l8.core
        "l8.core",
        "coon.core.exception.AlreadyExistsException"
    ],

    singleton: true,

    /**
     * @type {Object} object
     * @private
     */
    configs: null,


    /**
     * Registers as domain with the specified config.
     *
     * @param {String} domain
     * @param {Object} config
     *
     * @return {Object} The config applied for the domain, or null
     * if the domain was not a valid string
     *
     * @throws {coon.core.exception.AlreadyExistsException} if "domain" was already registered
     */
    register: function (domain, config) {

        const me = this;

        if (!domain || !Ext.isString(domain)) {
            return null;
        }

        if (!me.configs) {
            me.configs = {};
        }

        if (me.configs[domain]) {
            throw new coon.core.exception.AlreadyExistsException("domain \"" + domain + "\" was already registered.");
        }

        me.configs[domain] = config;

        return config;
    },


    /**
     * Returns the configuration object/value for the specified arguments
     *
     * @param {String} domain The domain for which the config should be returned
     * @param {String} key the property to look up. If the value contain ".", it will be assumed
     * the key is a path to a config value
     * @param {Mixed} defaultValue The value to return if no configuration for the domain and
     * key was found
     *
     * @returns {Mixed} undefined if no configuration was found for the specified domain and key,
     * otherwise the (default) value. Returns the complete configuration for the domain if only
     * the domain was specified.
     */
    get: function (domain, key, defaultValue) {

        const me = this;

        if (!me.configs) {
            return undefined;
        }

        if (arguments.length === 1) {
            return me.configs[domain];
        }
        const value = l8.core.unchain(key, me.configs[domain]);

        if (value === undefined) {
            return defaultValue;
        }

        return value;
    }

});
