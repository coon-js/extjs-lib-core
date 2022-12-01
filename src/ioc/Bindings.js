/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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
 * Object for managing bindings used by the ioc-container.
 * This class should not be used directly. Instead, the owning ioc-container should  manage it.
 *
 * @example
 *    const bindings = Ext.create("coon.core.ioc.Bindings", {});
 *    const data = bindings.getData(); // {}
 *
 *    bindigs.merge({"com.acme": {requestConfigurator: "coon.core.data.request.Configurator"}});
 *    bindings.getData(); // {"com.acme": {requestConfigurator: "coon.core.data.request.Configurator"}}
 *
 *    bindigs.merge({"com.acme.Class": {requestConfigurator: "com.acme.RequestConfigurator"}});
 *    bindings.getData(); // {
 *    // "com.acme.Class": {requestConfigurator: "com.acme.RequestConfigurator"},
 *    // "com.acme": {requestConfigurator: "coon.core.data.request.Configurator"}
 *    // }
 *
 */
Ext.define("coon.core.ioc.Bindings", {


    /**
     * @type {Object} data
     */
    constructor (data) {
        this.data = {};
        this.merge(data || {});
    },


    getData () {
        return this.data;
    },


    /**
     * Merge bindings.
     * Existing data is being overwritten with new data.
     * Will sort the entries after data has been merged to make sure entries with more
     * namespace information appear first, and more general entries are found at the end ot the
     * data-container.
     *
     * @param {Object} data An object containing key-value pairs, with keys representing class-names/namespaced,
     * and values representing types or type configuration that need to get resolved by the implemention ioc.container
     */
    merge (data) {

        const me = this;

        me.data = Object.assign(me.data, data);

        me.data = Object.fromEntries(Object.entries(me.data).sort((lft, rt) => {

            lft = lft[0];
            rt = rt[0];

            let lftParts = lft.split(".");
            let rtParts  = rt.split(".");

            if(lftParts.length < rtParts.length) {
                return 1;
            }

            if(lftParts.length > rtParts.length) {
                return -1;
            }

            return 0;


        }));

        return me.data;
    }

});
