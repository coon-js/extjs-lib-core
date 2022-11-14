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
 * Assembles a JSON:API compliant value for sort parameters used with Sencha Ext JS sorters.
 * The sort parameter will represent a comma-separated list of fields that should be sorted.
 * First values appearing in the list are sorted first. A field prefixed with a "-" will be sorted in
 * descending direction.
 *
 * @see https://jsonapi.org/format/1.1/#fetching-sorting
 */
Ext.define("coon.core.data.jsonApi.SorterEncoder", {


    /**
     * Returns the transformed sorter to be used with the sort query
     * parameter.
     *
     * @param {Array} sorters
     *
     * @returns {string}
     */
    encode (sorters) {
        const res = [];
        let field, dir;
        sorters.forEach(sorter => {
            field = sorter.getProperty();
            dir   = sorter.getDirection();

            res.push(
                (dir === "DESC" ? "-" : "") + field
            );
        });


        return res.join(",");
    }


});
