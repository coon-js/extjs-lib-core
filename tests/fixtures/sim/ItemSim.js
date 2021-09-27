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
 * Ext.ux.ajax.SimManager hook for fixture data.
 */
Ext.define("coon.core.fixtures.sim.ItemSim", {

    requires: [
        "coon.core.fixtures.sim.Init"
    ]

}, () => {

    var items = [];

    for (var i = 0, len = 500; i < len; i++) {
        items.push({
            id: (i + 1) + "",
            testProp: i,
            testPropForIndexLookup: (i + 1)
        });
    }

    Ext.ux.ajax.SimManager.register({
        type: "json",

        url: /cn_core\/fixtures\/PageMapItems(\/\d+)?/,


        data: function (ctx) {

            var idPart  = ctx.url.match(this.url)[1],
                filters = ctx.params.filter,
                empty   = ctx.params.empty,
                id;

            if (idPart) {
                id = parseInt(idPart.substring(1), 10);
                return {data: Ext.Array.findBy(
                    items,
                    function (item) {
                        return item.id === "" + id;
                    }
                )};
            } else if (filters) {
                Ext.raise("no filter supported");
            } else {
                if (empty) {
                    return [];
                }
                return items;
            }
        }
    });


});