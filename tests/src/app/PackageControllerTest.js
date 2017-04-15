/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * lib-cn_core
 * Copyright (C) 2017 Thorsten Suckow-Homberg/conjoon.org
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
    t.it('postLaunchHook should equal to Ext.emptyFn', function(t) {
        t.expect(controller.postLaunchHook).toBe(Ext.emptyFn);
    });

    /**
     * @see https://github.com/conjoon/lib-cn_core/issues/1
     */
    t.it('Test changes regarding lib-cn_core/issues/1', function(t) {

        var exc, e, routes, nRoutes;

        // +---------------------------------------------
        // | updateRoutes
        // +---------------------------------------------
        nRoutes = {};
        routes  = {
            'myurl' : {
                value    : 'someAction',
                expected : {
                    action : 'someAction',
                    before : 'onBeforePackageRoute'
                }
            },
            'myconfiguredurl' : {
                value    : {action : 'someAction'},
                expected : {
                    action : 'someAction'
                }
            }
        };
        for (var i in routes) {
            nRoutes[i] = Ext.apply({}, routes[i]['expected'])
        }
        controller.updateRoutes(nRoutes);
        for (var i in nRoutes) {
            t.expect(nRoutes[i]).toEqual(routes[i]['expected']);
        }

        //_____________________________________________________
        //
        //             TESTS  WITHOUT APP
        //_____________________________________________________
        // +---------------------------------------------
        // | isMainViewAvailable / -app
        // +---------------------------------------------
        exc = e = undefined;
        try {
            controller.isMainViewAvailable();
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("not used in an application");


        // +---------------------------------------------
        // | isActionRoutable / -app
        // +---------------------------------------------
        exc = e = undefined;
        try {
            t.expect(controller.isActionRoutable())
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("not used in an application");


        // +---------------------------------------------
        // | onBeforePackageRoute / -app
        // +---------------------------------------------
        exc = e = undefined;
        try {
            t.expect(controller.onBeforePackageRoute({}))
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("not used in an application");

        //_____________________________________________________
        //
        //                  TESTS  WITH APP
        //_____________________________________________________
        Ext.define('Issue1.nomainview.PackageController', {
            extend : 'conjoon.cn_core.app.PackageController',
            mockApp : null,
            getApplication : function() {
                if (!this.mockApp) {
                    this.mockApp = {
                        getMainView : function() {
                            return null;
                        },
                        shouldPackageRoute : Ext.emptyFn,
                        interceptAction    : Ext.emptyFn
                    };
                }
                return this.mockApp;
            }
        });

        t.waitForMs(500, function() {
            var controller = Ext.create('Issue1.nomainview.PackageController'),
                resumed;
            // +---------------------------------------------
            // | isMainViewAvailable / +app-mainview
            // +---------------------------------------------
            // +---------------------------------------------
            // | isActionRoutable / +app-mainview
            // +---------------------------------------------
            t.expect(controller.isMainViewAvailable()).toBe(false);
            t.expect(controller.isActionRoutable({})).toBe(false);

            // +------------------------------------------------------
            // | onBeforePackageRoute / +app / shouldPackeRoute:true
            // +------------------------------------------------------
            resumed = 0;
            controller.getApplication().shouldPackageRoute = function() {
                return true;
            };
            t.expect(resumed).toBe(0);
            controller.onBeforePackageRoute({resume : function(){
                resumed++;
            }});
            t.expect(resumed).toBe(1);

            // +------------------------------------------------------
            // | onBeforePackageRoute / +app / shouldPackeRoute:false
            // +------------------------------------------------------
            resumed = 0;
            controller.getApplication().shouldPackageRoute = function() {
                return false;
            };
            t.expect(resumed).toBe(0);
            controller.onBeforePackageRoute({resume : function(){
                resumed++;
            }});
            t.expect(resumed).toBe(0);

            // +---------------------------------------------
            // | isMainViewAvailable / +app+mainview
            // +---------------------------------------------
            // +---------------------------------------------
            // | isActionRoutable / +app+mainview
            // +---------------------------------------------
            controller.getApplication().getMainView = function() {
                return {};
            };
            t.expect(controller.isMainViewAvailable()).toBe(true);
            t.expect(controller.isActionRoutable({})).toBe(true);

        });

    });

});
