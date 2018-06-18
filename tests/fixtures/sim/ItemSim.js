/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * lib-cn_core
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Ext.ux.ajax.SimManager hook for fixture data.
 */
Ext.define('conjoon.cn_core.fixtures.sim.ItemSim', {

    requires : [
        'conjoon.cn_core.fixtures.sim.Init'
    ]

}, function() {

    var items = [];

    for (var i = 0, len = 500; i < len; i++) {
        items.push({
            id       : (i + 1) + '',
            testProp : i,
            testPropForIndexLookup : (i + 1)
        });
    }

    Ext.ux.ajax.SimManager.register({
        type : 'json',

        url  : /cn_core\/fixtures\/PageMapItems(\/\d+)?/,


        data: function(ctx) {

            var idPart  = ctx.url.match(this.url)[1],
                filters = ctx.params.filter,
                id

            if (idPart) {
                id = parseInt(idPart.substring(1), 10);
                return {data : Ext.Array.findBy(
                    items,
                    function(item) {
                        return item.id === '' + id;
                    }
                )};
            } else if (filters) {
                Ext.raise('no filter supported');
            } else {

                return items;
            }
        }
    });



});