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

/**
 * Tests for issue
 * https://www.sencha.com/forum/showthread.php?339006-Sencha-6-2-GPL-Commercial-auto-generated-id-of-App-Controller-is-NOT-FQN-of-class&p=1178063#post1178063
 */
describe('conjoon.cn_core.overrides.cn_core.app.PackageControllerTest', function(t) {

    var controller;

    t.beforeEach(function() {
        controller = Ext.create('conjoon.cn_core.app.PackageController');
    });

// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------


    t.it('Should compute the id of the PackageController erroneously', function(t) {

        Ext.define('Test.subname.controller.ControllerName', {
            extend : 'conjoon.cn_core.app.PackageController',
            namespace : ['Test.subname']
        }, function() {

            var controller = Ext.create('Test.subname.controller.ControllerName');

            t.expect(controller.getId()).toBe('ControllerName');
        });

        Ext.define('Test.subname.app.controller.ControllerName', {
            extend : 'conjoon.cn_core.app.PackageController',
            namespace : ['Test.subname']
        }, function() {

            var controller = Ext.create('Test.subname.app.controller.ControllerName');

            t.expect(controller.getId()).toBe('Test.subname.app.controller.ControllerName');
        });

    });


    t.requireOk('conjoon.cn_core.overrides.cn_core.app.PackageController', function() {

        t.it('Should compute the id properly with override', function(t) {

            Ext.define('Test.subname.controller.ControllerName', {
                extend : 'conjoon.cn_core.app.PackageController',
                namespace : ['Test.subname']
            }, function() {

                var controller = Ext.create('Test.subname.controller.ControllerName');

                t.expect(controller.getId()).toBe('Test.subname.controller.ControllerName');
            });

            Ext.define('Test.subname.app.controller.ControllerName', {
                extend : 'conjoon.cn_core.app.PackageController',
                namespace : ['Test.subname']
            }, function() {

                var controller = Ext.create('Test.subname.app.controller.ControllerName');

                t.expect(controller.getId()).toBe('Test.subname.app.controller.ControllerName');
            });

        });

    });


});
