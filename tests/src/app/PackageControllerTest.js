/**
 * conjoon
 * (c) 2007-2016 conjoon.org
 * licensing@conjoon.org
 *
 * lib-cn_core
 * Copyright (C) 2016 Thorsten Suckow-Homberg/conjoon.org
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

describe('conjoon.cn_core.app.PackageControllerTest', function(t) {

    var controller;

    t.beforeEach(function() {
        controller = Ext.create('conjoon.cn_core.app.PackageController');
    });

// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    /**
     * Test create
     */
    t.it('Should create an instance of conjoon.cn_core.app.PackageController', function(t) {
        t.expect(controller instanceof conjoon.cn_core.app.PackageController).toBeTruthy();
    });

    /**
     * Test preLaunchHook
     */
    t.it('preLaunchHook should equal to Ext.emptyFn', function(t) {
        t.expect(controller.preLaunchHook).toBe(Ext.emptyFn);
    });

    /**
     * Test getMetaItems
     */
    t.it('getMetaItems should equal to Ext.emptyFn', function(t) {
        t.expect(controller.postLaunchHook).toBe(Ext.emptyFn);
    });

});
