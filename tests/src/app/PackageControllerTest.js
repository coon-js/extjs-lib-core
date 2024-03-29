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

StartTest((t) => {

    var controller;

    t.beforeEach(function () {
        controller = Ext.create("coon.core.app.PackageController");
    });

    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------

    /**
     * Test create
     */
    t.it("Should create an instance of coon.core.app.PackageController", (t) => {
        t.expect(controller instanceof coon.core.app.PackageController).toBeTruthy();

        t.expect(controller.mixins["coon.core.app.plugin.ComponentPluginMixin"]).toBeDefined();
    });

    /**
     * Test preLaunchHook
     */
    t.it("preLaunchHook should equal to Ext.emptyFn", (t) => {
        t.expect(controller.preLaunchHook).toBe(Ext.emptyFn);
    });

    /**
     * Test getMetaItems
     */
    t.it("postLaunchHook should equal to Ext.emptyFn", (t) => {
        t.expect(controller.postLaunchHook).toBe(Ext.emptyFn);
    });

    /**
     * Test configureView
     */
    t.it("configureView should equal to Ext.emptyFn", (t) => {
        t.expect(controller.configureView).toBe(Ext.emptyFn);
    });


    /**
     * @see https://github.com/conjoon/extjs-lib-core/issues/1
     * @see https://github.com/coon-js/extjs-lib-core/issues/5
     */
    t.it("Test changes regarding extjs-lib-core#5", (t) => {

        var exc, routes, nRoutes;

        // +---------------------------------------------
        // | updateRoutes
        // +---------------------------------------------
        nRoutes = {};
        routes  = [{
            routes: {
                "myurl": "someAction"
            },
            expected: {
                myurl: {
                    action: "someAction",
                    before: "onBeforePackageRoute"
                }
            }
        }, {
            routes: {
                myconfiguredurl: {
                    action: "someAction"
                }
            },
            expected: {
                myconfiguredurl: {
                    action: "someAction"
                }
            }
        }, {
            routes: {
                myconfiguredurl: {
                    action: "someAction"
                },
                myurl: "someAction"
            },
            expected: {
                myconfiguredurl: {
                    action: "someAction"
                },
                myurl: {
                    action: "someAction",
                    before: "onBeforePackageRoute"
                }
            }
        }];

        for (var i = 0, len = routes.length; i < len; i++) {
            nRoutes = Ext.apply({}, routes[i]["routes"]);
            controller.updateRoutes(nRoutes);
            t.expect(nRoutes).toEqual(routes[i]["expected"]);

        }

        //_____________________________________________________
        //
        //             TESTS  WITHOUT APP
        //_____________________________________________________
        // +---------------------------------------------
        // | isMainViewAvailable / -app
        // +---------------------------------------------
        exc = undefined;
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
        exc = undefined;
        try {
            t.expect(controller.isActionRoutable());
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("not used in an application");


        // +---------------------------------------------
        // | onBeforePackageRoute / -app
        // +---------------------------------------------
        exc = undefined;
        try {
            t.expect(controller.onBeforePackageRoute({}));
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("not used in an application");

        //_____________________________________________________
        //
        //                  TESTS  WITH APP
        //_____________________________________________________
        Ext.define("Issue1.nomainview.PackageController", {
            extend: "coon.core.app.PackageController",
            mockApp: null,
            getApplication: function () {
                if (!this.mockApp) {
                    this.mockApp = {
                        getMainView: function () {
                            return null;
                        },
                        shouldPackageRoute: Ext.emptyFn,
                        interceptAction: function () {return false;}
                    };
                }
                return this.mockApp;
            }
        });

        t.waitForMs(t.parent.TIMEOUT, () => {
            var controller = Ext.create("Issue1.nomainview.PackageController"),
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
            controller.getApplication().shouldPackageRoute = function () {
                return true;
            };
            t.expect(resumed).toBe(0);
            t.expect(controller.onBeforePackageRoute({resume: function (){
                resumed++;
            }})).not.toBe(false);
            t.expect(resumed).toBe(1);

            // +------------------------------------------------------
            // | onBeforePackageRoute / +app / shouldPackeRoute:false
            // +------------------------------------------------------
            resumed = 0;
            controller.getApplication().shouldPackageRoute = function () {
                return false;
            };
            t.expect(resumed).toBe(0);
            t.expect(controller.onBeforePackageRoute({resume: function (){
                resumed++;
            }})).toBe(false);
            t.expect(resumed).toBe(0);

            // +---------------------------------------------
            // | isMainViewAvailable / +app+mainview
            // +---------------------------------------------
            // +---------------------------------------------
            // | isActionRoutable / +app+mainview
            // +---------------------------------------------
            controller.getApplication().getMainView = function () {
                return {};
            };
            t.expect(controller.isMainViewAvailable()).toBe(true);
            t.expect(controller.isActionRoutable({})).toBe(true);

        });

    });


    // extjs-lib-core#14
    t.it("isPreLaunchForceable()", (t) => {
        t.expect(controller.isPreLaunchForceable).toBeUndefined();
    });


    t.it("addPlugin()", (t) => {

        let exc = null;
        try {
            controller.addPlugin({});
        } catch (e) {
            exc = e;
        }
        t.expect (exc.msg).toContain("must be an instance of");

        let plugin1 = Ext.create("coon.core.app.plugin.ControllerPlugin");
        plugin1.run = function () {};
        let plugin2 = Ext.create("coon.core.app.plugin.ControllerPlugin", {id: "someid"});
        plugin2.run = function () {};

        t.isCalledNTimes("run", plugin1, 1);
        t.isCalledNTimes("run", plugin2, 1);

        controller.addPlugin(plugin1);
        controller.addPlugin(plugin2);

        controller.visitPlugins();
    });


    t.it("addPlugin() - plugin with the same id is not added again", (t) => {

        let plugin1 = Ext.create("coon.core.app.plugin.ControllerPlugin");
        plugin1.run = function () {};
        let plugin2 = Ext.create("coon.core.app.plugin.ControllerPlugin");
        plugin2.run = function () {};

        t.isCalledNTimes("run", plugin1, 1);
        t.isCalledNTimes("run", plugin2, 0);

        controller.addPlugin(plugin1);
        controller.addPlugin(plugin2);

        t.expect(controller.plugins.length).toBe(1);
        t.expect(controller.plugins[0]).toBe(plugin1);

        controller.visitPlugins();
    });


    t.it("visitPlugins() throws", (t) => {

        let exc = null;

        let plugin1 = Ext.create("coon.core.app.plugin.ControllerPlugin");
        plugin1.run = function () {
            // eslint-disable-next-line
            sf
        };

        controller.addPlugin(plugin1);

        try {
            controller.visitPlugins();
        } catch (e) {
            exc = e;
        }
        t.expect (exc.msg).toContain("Executing the PluginController failed");

    });


});
