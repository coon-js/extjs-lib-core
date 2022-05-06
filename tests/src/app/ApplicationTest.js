/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2017-2022 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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
 * The PackageControllerMock used in this tests returns falsy when
 * its prelaunchHook() is called for the first time, after this it returns
 * always truthy.
 * This is needed since an Application tries to call launch() the first time
 * it is executed - checking the preLaunchHook of each controller if it returns
 * true, the initiates the main view if that is the case.
 * In most of the test cases we rely on the fact that there is no main view
 * created until we call launch() by hand.
 */
StartTest(t => {

    let app = null,
        ORIGINAL_MANIFEST,
        ONPROFILESREADY,
        INITPACKAGESANDCONFIGURATION,
        INITAPPLICATIONPLUGINS;

    let MOCKCTRLORDER = [];

    const defineControllerMocks = function () {
        Ext.define("coon.test.app.mock.app.MockCtrlTrue", {
            extend: "coon.core.app.PackageController",
            preLaunchHook: function () {
                MOCKCTRLORDER.push("MockCtrlTrue");
                return true;
            }
        });
        Ext.define("coon.test.app.mock.app.MockCtrlFalse", {
            extend: "coon.core.app.PackageController",
            preLaunchHook: function () {
                MOCKCTRLORDER.push("MockCtrlFalse");
                return false;
            }
        });

        Ext.define("coon.test.app.mock.app.MockCtrlUndefined", {
            extend: "coon.core.app.PackageController",
            preLaunchHook: function () {
                MOCKCTRLORDER.push("MockCtrlUndefined");
                return undefined;
            }
        });
    };

    const buildManifest = function () {

        const manifest = {};

        manifest.name = "ApplicationTest";
        manifest["coon-js"] = {env: "dev"};
        manifest.packages = {
            "p_foo": {
                included: false,
                isLoaded: false,
                namespace: "foo",
                "coon-js": {package: {autoLoad: {registerController: true}}}
            },
            "p_bar": {
                included: true,
                isLoaded: false,
                namespace: "bar",
                "coon-js": {package: {autoLoad: {registerController: true}}}
            },
            "p_foobar": {
                included: false,
                isLoaded: false,
                namespace: "foobar",
                "cs": {package: {autoLoad: {registerController: true}}}
            },
            "t_snafu": {
                included: false,
                isLoaded: false,
                namespace: "snafu",
                "coon-js": {package: {autoLoad: {registerController: true}}}
            }
        };
        manifest.resources = {path: "./fixtures", shared: "../bar"};
        return manifest;
    };

    /**
     *
     * @param reset
     */
    const switchManifest = (reset) => {
            if (!reset) {
                ORIGINAL_MANIFEST = Ext.manifest;
                Ext.manifest = buildManifest();
            } else {
                Ext.manifest = ORIGINAL_MANIFEST;
            }
        },
        switchInitApplicationConfigurationAndPlugins = (origin) => {
            if (!origin) {
                INITAPPLICATIONPLUGINS = coon.core.app.Application.prototype.initApplicationConfigurationAndPlugins;
                coon.core.app.Application.prototype.initApplicationConfigurationAndPlugins = async () =>{return [];};
                return INITAPPLICATIONPLUGINS;
            } else if (INITAPPLICATIONPLUGINS) {
                coon.core.app.Application.prototype.initApplicationConfigurationAndPlugins = INITAPPLICATIONPLUGINS;
            }
        },
        switchInitPackagesAndConfiguration = (origin) => {
            if (!origin) {
                INITPACKAGESANDCONFIGURATION = coon.core.app.Application.prototype.initPackagesAndConfiguration;
                coon.core.app.Application.prototype.initPackagesAndConfiguration = async () =>{return [];};
                return INITPACKAGESANDCONFIGURATION;
            } else if (INITPACKAGESANDCONFIGURATION) {
                coon.core.app.Application.prototype.initPackagesAndConfiguration = INITPACKAGESANDCONFIGURATION;
            }
        },
        switchOnProfilesReady = (origin) => {
            if (!origin) {
                ONPROFILESREADY = coon.core.app.Application.prototype.onProfilesReady;
                coon.core.app.Application.prototype.onProfilesReady = Ext.app.Application.prototype.onProfilesReady;
                return ONPROFILESREADY;
            } else if (ONPROFILESREADY) {
                coon.core.app.Application.prototype.onProfilesReady = ONPROFILESREADY;
            }
        };

    t.beforeEach(function () {
        Ext.isModern && Ext.viewport.Viewport.setup();
        switchOnProfilesReady();
        switchInitApplicationConfigurationAndPlugins();
        switchInitPackagesAndConfiguration();
    });

    t.afterEach(function () {

        switchOnProfilesReady(true);
        switchInitPackagesAndConfiguration(true);
        switchInitApplicationConfigurationAndPlugins(true);
        if (app) {
            app.destroy();
            app = null;
        }

        if (Ext.isModern && Ext.Viewport) {
            Ext.Viewport.destroy();
            Ext.Viewport = null;
        }

        MOCKCTRLORDER = [];
        coon.core.ConfigManager.configs = {};
        coon.core.Environment._vendorBase = undefined;
    });

    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------
    t.requireOk("coon.core.app.PackageController", "coon.core.app.Application",  function () {

        t.it("constructor sets up properly", t => {


            let app = Ext.create("coon.core.app.Application", {
                name: "test",
                mainView: "Ext.Panel"
            });

            t.expect(app.mixins["coon.core.app.plugin.ComponentPluginMixin"]).toBeDefined();

            t.isInstanceOf(coon.core.Environment.getVendorBase(), "coon.core.env.ext.VendorBase");
            t.isInstanceOf(app.applicationUtil, "coon.core.app.ApplicationUtil");

            app.destroy();
            app = null;
        });


        t.it("Should create the mainView of an extended class properly", async t => {


            var w = Ext.create("coon.test.app.mock.ApplicationMock2", {
                name: "test",
                controllers: [
                    "coon.test.app.mock.PackageControllerMock"
                ]
            });
            t.waitForMs(t.parent.TIMEOUT, () => {
                t.expect(w.pluginMap).toEqual({});

                var VIEW = null;
                if (Ext.isModern) {
                    Ext.Viewport.add = function (mainView) {
                        VIEW = mainView;
                    };
                }

                t.expect(w.getMainView()).toBeFalsy();
                w.launch();
                if (Ext.isModern) {
                    t.expect(w.getMainView()).toBe(VIEW);
                }
                t.expect(w.getMainView() instanceof Ext.Panel).toBeTruthy();
                w.destroy();
                w = null;
            });
        });


        t.it("postLaunchHookProcess should be Ext.emptyFn", t => {
            var w = Ext.create("coon.core.app.Application", {
                name: "test",
                mainView: "Ext.Panel"
            });

            t.expect(w.postLaunchHookProcess).toBe(Ext.emptyFn);
            w.destroy();
            w = null;
        });


        t.it("Should not create the mainView at first, then call launch() to make sure it is created", t => {
            var w = Ext.create("coon.core.app.Application", {
                name: "test",
                mainView: "Ext.Panel",
                controllers: [
                    "coon.test.app.mock.PackageControllerMock"
                ]
            });
            t.expect(w.getMainView()).toBeFalsy();
            w.launch();
            t.expect(w.getMainView() instanceof Ext.Panel).toBeTruthy();
            w.destroy();
            w = null;
        });


        t.it("Should not create the mainView with controllers", t => {
            var w = Ext.create("coon.core.app.Application", {
                name: "test",
                mainView: "Ext.Panel",
                controllers: [
                    "coon.test.app.mock.PackageControllerMock"
                ]
            });
            t.expect(w.getMainView()).toBeFalsy();
            w.destroy();
            w = null;
        });


        t.it("Should create the mainView with controllers", t => {

            var w = Ext.create("coon.core.app.Application", {
                name: "test",
                mainView: "Ext.Panel",
                controllers: [
                    "coon.core.app.PackageController"
                ]
            });

            t.isInstanceOf(w.getMainView(), "Ext.Panel");
            w.destroy();
            w = null;
        });


        t.it("Should throw an error when preLaunchHookProcess is triggered when mainView was created.", t => {
            var w = Ext.create("coon.core.app.Application", {
                name: "test",
                mainView: "Ext.Panel",
                controllers: [
                    "coon.core.app.PackageController"
                ]
            });

            t.expect(w.getMainView() instanceof Ext.Panel).toBeTruthy();
            var exc = null;
            try {
                w.preLaunchHookProcess();
            } catch(e) {
                exc = e;
            }
            t.expect(exc).not.toBeNull();
            t.expect(exc.msg).toContain("cannot be run");
            w.destroy();
            w = null;
        });

        // @see https://github.com/conjoon/extjs-lib-core/issues/1
        // @see https://github.com/coon-js/extjs-lib-core/issues/5
        t.it("Test changes regarding extjs-lib-core#5", t => {

            var app = Ext.create("coon.core.app.Application", {
                    name: "test",
                    mainView: "Ext.Panel",
                    controllers: [
                        "coon.test.app.mock.PackageControllerMock"
                    ]
                }),
                stack,
                resumed,
                stopped,
                ctrlMock;
            // +---------------------------------------------
            // | releaseLastRouteAction() / null
            // +---------------------------------------------
            t.expect(app.releaseLastRouteAction()).toBe(false);
            // +---------------------------------------------
            // | releaseLastRouteAction() / []
            // +---------------------------------------------
            t.expect(app.releaseLastRouteAction([])).toBe(false);

            // +---------------------------------------------
            // | releaseLastRouteAction() / [{}]
            // +---------------------------------------------
            resumed = 0;
            stopped = 0;

            stack   = [{stop: function (){stopped++;}}, {stop: function (){stopped++;}}, {resume: function (){resumed++;}}];
            t.expect(app.releaseLastRouteAction(stack)).toBe(true);
            t.expect(stopped).toBe(2);
            t.expect(stack).toEqual([]);
            t.expect(resumed).toBe(1);

            // +---------------------------------------------
            // | interceptAction()
            // +---------------------------------------------
            // with array
            app.routeActionStack = ["a"];
            t.expect(app.interceptAction("b")).toBe(false);
            t.expect(app.routeActionStack).toEqual(["a", "b"]);
            // with null
            app.routeActionStack = null;
            t.expect(app.interceptAction("c")).toBe(false);
            t.expect(app.routeActionStack).toEqual(["c"]);

            // +---------------------------------------------
            // | shouldPackageRoute()
            // +---------------------------------------------
            ctrlMock = {isActionRoutable: function (){return "A";}};
            t.expect(app.shouldPackageRoute(ctrlMock, {})).toBe("A");

            // +---------------------------------------------
            // | shouldPackageRoute()
            // +---------------------------------------------
            resumed = 0;
            app.routeActionStack = [{resume: function (){resumed++;}}];
            app.launch();
            t.expect(app.routeActionStack).toEqual([]);
            t.expect(resumed).toBe(1);

            app.destroy();
            app = null;
        });


        t.it("addApplicationPlugin()", t => {

            const
                appPlug = "coon.test.app.mock.app.ApplicationPlugin",
                ctrlPlug = "coon.test.app.mock.app.ControllerPlugin";

            let exc;

            let app = Ext.create("coon.core.app.Application", {
                name: "test",
                mainView: "Ext.Panel"
            });

            try {
                app.addApplicationPlugin(appPlug);
            } catch (e) {
                exc = e;
            }

            t.isInstanceOf(exc, "coon.core.app.ApplicationException");
            t.expect(exc.getMessage()).toContain("Could not find");

            t.requireOk("coon.test.app.mock.app.ApplicationPlugin",
                "coon.test.app.mock.app.ControllerPlugin", () => {

                    try {
                        app.addApplicationPlugin(ctrlPlug);
                    } catch (e) {
                        exc = e;
                    }

                    t.isInstanceOf(exc, "coon.core.app.ApplicationException");

                    t.expect(app.applicationPlugins).toBeUndefined();
                    t.expect(app.addApplicationPlugin(appPlug)).toBe(app);
                    t.expect(app.applicationPlugins.length).toBe(1);
                    t.expect(app.addApplicationPlugin(appPlug)).toBe(app);
                    const plug = app.applicationPlugins[0];
                    t.expect(plug, "coon.test.app.mock.app.ApplicationPlugin");
                    t.expect(app.addApplicationPlugin(Ext.create(appPlug))).toBe(app);
                    t.expect(app.applicationPlugins[0]).toBe(plug);
                });
        });


        t.it("visitPlugins()", t => {

            let applicationPluginMocks = [
                    {run: (app) => {}},
                    {run: (app) => {}}
                ], spys = [];

            let app = Ext.create("coon.core.app.Application", {
                name: "test",
                mainView: "Ext.Panel"
            });

            applicationPluginMocks.forEach((plug) => {
                spys.push(t.spyOn(plug, "run"));
            });

            app.applicationPlugins = applicationPluginMocks;
            app.visitPlugins();

            spys.forEach((spy) => {
                t.expect(spy).toHaveBeenCalled(1);
                t.expect(spy).toHaveBeenCalledWith(app);
            });
        });


        t.it("registerService()", t => {

            let EXISTS = false, exc;

            const
                app = Ext.create("coon.core.app.Application", {
                    name: "test",
                    mainView: "Ext.Panel"
                }),
                serviceMock ={},
                createSpy = t.spyOn(Ext, "create").and.callFake(() => serviceMock),
                extSpy = t.spyOn(Ext.ClassManager, "get").and.callFake(() => EXISTS),
                providerSpy = t.spyOn(coon.core.ServiceProvider, "register").and.callFake(() => serviceMock);

            try {
                app.registerService("abstract", {xclass: "service", args: [{value: "property"}]});
            } catch (e) {
                exc = e;
            }

            t.expect(exc.getMessage().toLowerCase()).toContain("could not find the service");

            EXISTS = true;

            t.expect(app.registerService(
                "abstract",
                {xclass: "service", args: [{property: "value"}, "anotherValue"]})
            ).toBe(serviceMock);

            t.expect(createSpy.calls.mostRecent().args[0]).toBe("service");
            t.expect(createSpy.calls.mostRecent().args[1]).toEqual({property: "value"});
            t.expect(createSpy.calls.mostRecent().args[2]).toBe("anotherValue");

            t.expect(providerSpy.calls.mostRecent().args[0]).toBe("abstract");
            t.expect(providerSpy.calls.mostRecent().args[1]).toBe(serviceMock);

            [extSpy, createSpy, providerSpy].map(spy => spy.remove());
        });


        t.it("onProfilesReady() - make sure methods are called", async t => {
            switchManifest();
            switchOnProfilesReady(true);
            switchInitPackagesAndConfiguration(true);
            switchInitApplicationConfigurationAndPlugins(true);

            let packageControllersMock = [],
                applicationPluginsMock = [1, 2, 3],
                componentPluginsMock =[{}],
                applicationConfigMock = {
                    "services": {
                        "interface": {
                            xclass: "concrete"
                        },
                        "another_interface": {
                            xclass: "another_concrete"
                        }
                    },
                    "plugins": {
                        "application": applicationPluginsMock,
                        "components": componentPluginsMock
                    }
                }; // can be left empty

            let registerServiceSpy = t.spyOn(coon.core.app.Application.prototype, "registerService").and.callFake(() => {}),
                profileSpy = t.spyOn(Ext.app.Application.prototype, "onProfilesReady").and.callFake(async () => {}),
                findPackageControllersSpy = t.spyOn(coon.core.app.Application.prototype, "initPackagesAndConfiguration").and.callThrough(),
                addApplicationPluginMock = t.spyOn(coon.core.app.Application.prototype, "addApplicationPlugin").and.callFake(() => {}),
                registerComponentPluginMock = t.spyOn(coon.core.app.Application.prototype, "registerComponentPlugin").and.callFake(() => {}),
                findApplicationPluginsSpy = t.spyOn(coon.core.app.Application.prototype, "initApplicationConfigurationAndPlugins").and.callThrough(),
                getApplicationPluginsSpy  = t.spyOn(coon.core.app.ApplicationUtil.prototype, "getApplicationPlugins").and.callFake(() => applicationPluginsMock),
                getComponentPluginsSpy  = t.spyOn(coon.core.app.ApplicationUtil.prototype, "getComponentPlugins"),
                loadApplicationConfigSpy = t.spyOn(coon.core.app.ApplicationUtil.prototype, "loadApplicationConfig").and.callFake(
                    async () => applicationConfigMock
                ),
                configSpy = t.spyOn(coon.core.ConfigManager, "get").and.callFake(domain => domain === "test" ? applicationConfigMock : undefined),
                loadPackagesSpy = t.spyOn(coon.core.app.ApplicationUtil.prototype, "loadPackages").and.callFake(() => packageControllersMock),
                addNamespacesSpy = t.spyOn(Ext.app, "addNamespaces").and.callFake(() => {});

            Ext.create("coon.core.app.Application", {
                name: "test",
                mainView: "Ext.Panel"
            });

            t.waitForMs(t.parent.TIMEOUT, () => {

                t.expect(registerServiceSpy).toHaveBeenCalled(2);
                t.expect(registerServiceSpy.calls.all()[0].args).toEqual([
                    "interface", applicationConfigMock.services.interface
                ]);
                t.expect(registerServiceSpy.calls.all()[1].args).toEqual([
                    "another_interface", applicationConfigMock.services.another_interface
                ]);

                t.expect(loadApplicationConfigSpy).toHaveBeenCalled(1);

                t.expect(getApplicationPluginsSpy).toHaveBeenCalled(1);
                t.expect(getApplicationPluginsSpy.calls.mostRecent().args[0]).toBe(applicationPluginsMock);
                t.isDeeply(getApplicationPluginsSpy.calls.mostRecent().args[1], coon.core.Environment.getPackages());

                t.expect(getComponentPluginsSpy).toHaveBeenCalled(0);

                t.expect(loadPackagesSpy).toHaveBeenCalled(1);
                t.isDeeply(loadPackagesSpy.calls.mostRecent().args[0],  {
                    "p_foo": {
                        namespace: "foo",
                        "coon-js": {package: {autoLoad: {registerController: true}}}
                    },
                    "p_bar": {
                        namespace: "bar",
                        "coon-js": {package: {autoLoad: {registerController: true}}}
                    },
                    "t_snafu": {
                        namespace: "snafu",
                        "coon-js": {package: {autoLoad: {registerController: true}}}
                    }});

                t.expect(findApplicationPluginsSpy).toHaveBeenCalled(1);
                t.expect(findApplicationPluginsSpy.calls.mostRecent().args[0]).toBe(applicationConfigMock.plugins);


                t.expect(findPackageControllersSpy).toHaveBeenCalled(1);
                t.expect(profileSpy).toHaveBeenCalled(1);

                t.expect(addApplicationPluginMock).toHaveBeenCalled(applicationPluginsMock.length);
                t.expect(registerComponentPluginMock).toHaveBeenCalled(componentPluginsMock.length);

                t.expect(addNamespacesSpy).toHaveBeenCalled(2);
                t.expect(addNamespacesSpy.calls.all()[0].args[0]).toBe(packageControllersMock);
                t.expect(addNamespacesSpy.calls.all()[1].args[0]).toBe(applicationPluginsMock);

                findPackageControllersSpy.remove();
                profileSpy.remove();
                loadApplicationConfigSpy.remove();
                loadPackagesSpy.remove();
                addNamespacesSpy.remove();
                addApplicationPluginMock.remove();
                findApplicationPluginsSpy.remove();
                getApplicationPluginsSpy.remove();
                getComponentPluginsSpy.remove();
                registerComponentPluginMock.remove();
                configSpy.remove();
                registerServiceSpy.remove();

                switchManifest(true);
                // @extjs bug 7.3.3
                // tries to iterate over destroyed(?) items
                // app.destroy();
                t.expect(() => app.destroy()).toThrow();
                app = null;
            });
        });


        t.it("Should never call launch()", t => {

            var LAUNCHCALLED = false;

            coon.core.app.PackageController.prototype.preLaunchHook = function () {
                return false;
            };

            coon.core.app.Application.prototype.launch = function () {
                LAUNCHCALLED = true;
            };

            var app = Ext.create("coon.core.app.Application", {
                name: "test",
                mainView: "Ext.Container",
                controllers: [
                    "coon.core.app.PackageController"
                ]
            });

            t.expect(LAUNCHCALLED).toBe(false);

            app.destroy();
            app = null;
        });


        t.it("Should call launch()", t => {

            var LAUNCHCALLED = false;

            coon.core.app.PackageController.prototype.preLaunchHook = function () {
                return true;
            };

            coon.core.app.Application.prototype.launch = function () {
                LAUNCHCALLED = true;
            };

            var app = Ext.create("coon.core.app.Application", {
                name: "test",
                mainView: "Ext.Container",
                controllers: [
                    "coon.core.app.PackageController"
                ]
            });

            t.expect(LAUNCHCALLED).toBe(true);

            app.destroy();
            app = null;
        });


        t.it("Should call launch(), then postLaunchHook()", t => {

            var i = 0;
            var LAUNCH = 0;
            var POSTLAUNCH = 0;


            coon.core.app.PackageController.prototype.preLaunchHook = function () {
                return true;
            };

            coon.core.app.PackageController.prototype.postLaunchHook = function () {
                POSTLAUNCH = ++i;
            };

            coon.core.app.Application.prototype.launch = function () {
                LAUNCH = ++i;
            };

            var app = Ext.create("coon.core.app.Application", {
                name: "test",
                mainView: "Ext.Container",
                controllers: [
                    "coon.core.app.PackageController"
                ],
                postLaunchHookProcess: function () {
                    this.getController("coon.core.app.PackageController").postLaunchHook();
                }
            });

            t.expect(LAUNCH).toBe(1);
            t.expect(POSTLAUNCH).toBe(2);

            coon.core.app.PackageController.prototype.preLaunchHook = Ext.emptyFn();
            coon.core.app.PackageController.prototype.postLaunchHook = Ext.emptyFn();

            app.destroy();
            app = null;
        });


        t.it("Tests with preLaunchHooks ", t => {

            defineControllerMocks();

            t.waitForMs(t.parent.TIMEOUT, () => {

                app = Ext.create("coon.core.app.Application", {
                    name: "test",
                    mainView: "Ext.Panel",
                    controllers: [
                        "coon.test.app.mock.app.MockCtrlFalse",
                        "coon.test.app.mock.app.MockCtrlTrue"
                    ]
                });
                app.getMainView = () => null;

                MOCKCTRLORDER = [];

                let res = app.preLaunchHookProcess();

                t.expect(MOCKCTRLORDER).toEqual([
                    "MockCtrlFalse"
                ]);

                t.expect(res).toBe(false);

            });
        });


        t.it("Tests with preLaunchHooks / return value undefined", t => {
            // return value undefined

            defineControllerMocks();

            t.waitForMs(t.parent.TIMEOUT, () => {
                app = Ext.create("coon.core.app.Application", {
                    name: "test_undefined",
                    mainView: "Ext.Panel",
                    controllers: [
                        "coon.test.app.mock.app.MockCtrlTrue",
                        "coon.test.app.mock.app.MockCtrlUndefined"
                    ]
                });
                app.getMainView = () => null;

                MOCKCTRLORDER = [];

                let res = app.preLaunchHookProcess();

                t.expect(MOCKCTRLORDER).toEqual([
                    "MockCtrlTrue",
                    "MockCtrlUndefined"
                ]);

                t.expect(res).toBe(true);

            });
        });


        t.it("getController()", t => {

            switchManifest();
            app = Ext.create("coon.core.app.Application", {
                name: "test",
                mainView: "Ext.Panel",
                controllers: [
                    "coon.test.app.mock.app.PackageController"
                ]
            });

            let
                componentPlugins = [{}, {}],
                spy = t.spyOn(app.applicationUtil, "getControllerPlugins").and.callFake(() => ({
                    "coon.test.app.mock.app.PackageController": ["coon.test.app.mock.app.ControllerPlugin"]
                })),
                cmpSpy = t.spyOn(app.applicationUtil, "getComponentPlugins").and.callFake(() => ({
                    "coon.test.app.mock.app.PackageController": componentPlugins
                }));

            let controller = app.getController("coon.test.app.mock.app.PackageController");

            t.expect(spy).toHaveBeenCalled(1);

            t.isDeeply(spy.calls.mostRecent().args[0], coon.core.Environment.getPackages());

            t.isInstanceOf(controller, "coon.test.app.mock.app.PackageController");
            t.expect(controller.plugins.length).toBe(1);
            let plugin = controller.plugins[0];
            t.isInstanceOf(plugin, "coon.test.app.mock.app.ControllerPlugin");

            let registerSpy = t.spyOn(
                coon.test.app.mock.app.PackageController.prototype,
                "registerComponentPlugin"
            ).and.callFake(() => {});
            let controller2 = app.getController("coon.test.app.mock.app.PackageController");

            t.expect(spy.calls.mostRecent().args[0]).toBe(coon.core.Environment.getPackages());
            t.expect(spy.calls.mostRecent().args[1]).toBe("coon.test.app.mock.app.PackageController");
            t.expect(cmpSpy.calls.mostRecent().args[0]).toBe(coon.core.Environment.getPackages());
            t.expect(cmpSpy.calls.mostRecent().args[1]).toBe("coon.test.app.mock.app.PackageController");

            t.expect(registerSpy.calls.count()).toBe(2);
            t.expect(registerSpy.calls.all()[0].args[0]).toBe(componentPlugins[0]);
            t.expect(registerSpy.calls.all()[1].args[0]).toBe(componentPlugins[1]);

            t.expect(controller2).toBe(controller);
            t.expect(controller.plugins.length).toBe(1);
            t.expect(controller.plugins[0]).toBe(plugin);

            spy = t.spyOn(app.applicationUtil, "getControllerPlugins").and.callFake(() => ({
                "coon.test.app.mock.app.PackageController": [{
                    xclass: "coon.test.app.mock.app.ControllerPlugin",
                    args: [{id: "newOneToAddSameClassAsPlugin", cfg: "submitted"}, {opt: "two"}]
                }]
            }));

            controller = app.getController("coon.test.app.mock.app.PackageController");
            plugin = controller.plugins[controller.plugins.length -1 ];
            t.isInstanceOf(plugin, "coon.test.app.mock.app.ControllerPlugin");
            t.expect(plugin.cfg).toBe("submitted");
            t.expect(plugin.opt).toBe("two");

            spy.remove();
            cmpSpy.remove();
            registerSpy.remove();
        });


        t.it("all controller plugins called regardless of preLaunchHook w/ proper default arguments", t => {

            defineControllerMocks();

            t.waitForMs(t.parent.TIMEOUT, () => {

                app = Ext.create("coon.core.app.Application", {
                    name: "test_undefined",
                    mainView: "Ext.Panel",
                    controllers: [
                        "coon.test.app.mock.app.MockCtrlFalse",
                        "coon.test.app.mock.app.MockCtrlTrue",
                        "coon.test.app.mock.app.MockCtrlUndefined"
                    ]
                });
                app.getMainView = () => null;

                const
                    plugin1 = Ext.create("coon.core.app.plugin.ControllerPlugin"),
                    plugin2 = Ext.create("coon.core.app.plugin.ControllerPlugin"),
                    plugin3 = Ext.create("coon.core.app.plugin.ControllerPlugin");

                [plugin1, plugin2, plugin3].forEach((plug) => plug.run =  function () {});

                const
                    plugin1Spy = t.spyOn(plugin1, "run"),
                    plugin2Spy = t.spyOn(plugin2, "run"),
                    plugin3Spy = t.spyOn(plugin3, "run");

                const
                    controller1 = app.getController("coon.test.app.mock.app.MockCtrlFalse"),
                    controller2 = app.getController("coon.test.app.mock.app.MockCtrlTrue"),
                    controller3 = app.getController("coon.test.app.mock.app.MockCtrlUndefined");

                controller1.addPlugin(plugin1);
                controller2.addPlugin(plugin2);
                controller3.addPlugin(plugin3);

                const res = app.preLaunchHookProcess();

                t.expect(plugin1Spy).toHaveBeenCalledWith(controller1);
                t.expect(plugin2Spy).toHaveBeenCalledWith(controller2);
                t.expect(plugin3Spy).toHaveBeenCalledWith(controller3);

                t.expect(res).toBe(false);
            });
        });


        t.it("getPackageConfig() - proper arguments passed to ApplicationUtil#getPackageNameForController", t => {

            const
                controllerFqn = "coon.test.app.mock.app.PackageController";

            app = Ext.create("coon.core.app.Application", {
                name: "test",
                mainView: "Ext.Panel",
                controllers: [
                    controllerFqn
                ]
            });

            t.expect(app.getPackageConfig("somecontroller")).toBeUndefined();
        });


        t.it("getPackageConfig()", t => {

            switchManifest();
            switchOnProfilesReady();

            const
                controllerFqn = "coon.test.app.mock.app.PackageController",
                packageNameMock = "PACKAGENAME",
                keyMock = "KEYMOCK";

            app = Ext.create("coon.core.app.Application", {
                name: "test",
                mainView: "Ext.Panel",
                controllers: [
                    controllerFqn
                ]
            });

            let configSpy = t.spyOn(
                    coon.core.ConfigManager,
                    "get"
                ).and.callFake((packageName, key) => [packageName, key]),
                packageNameForControllerSpy = t.spyOn(
                    app.applicationUtil,
                    "getPackageNameForController"
                ).and.callFake(() => packageNameMock);

            t.expect(app.getPackageConfig(app.getController(controllerFqn))).toEqual(
                [packageNameMock, undefined]
            );

            t.expect(configSpy).toHaveBeenCalled(7);
            t.expect(configSpy.calls.mostRecent().args[0]).toBe(packageNameMock);
            t.expect(configSpy.calls.mostRecent().args[1]).toBeUndefined();

            t.expect(packageNameForControllerSpy).toHaveBeenCalled(1);
            t.expect(packageNameForControllerSpy.calls.mostRecent().args[0]).toBe(controllerFqn);

            t.expect(app.getPackageConfig(app.getController(controllerFqn), keyMock)).toEqual(
                [packageNameMock, keyMock]
            );

            t.expect(configSpy.calls.mostRecent().args[0]).toBe(packageNameMock);
            t.expect(configSpy.calls.mostRecent().args[1]).toBe(keyMock);

            packageNameForControllerSpy.remove();
            configSpy.remove();
        });


    });});
