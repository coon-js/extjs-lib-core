/**
 * coon.js
 * lib-cn_core
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/coon-js/lib-cn_core
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
describe("coon.core.app.ApplicationTest", function (t) {

    let app = null;

    let MOCKCTRLORDER = [];

    const defineControllerMocks = function () {
        Ext.define("coon.test.app.mock.app.MockCtrlTrue", {
            extend : "coon.core.app.PackageController",
            preLaunchHook : function () {
                MOCKCTRLORDER.push("MockCtrlTrue");
                return true;
            }
        });
        Ext.define("coon.test.app.mock.app.MockCtrlFalse", {
            extend : "coon.core.app.PackageController",
            preLaunchHook : function () {
                MOCKCTRLORDER.push("MockCtrlFalse");
                return false;
            }
        });

        Ext.define("coon.test.app.mock.app.MockCtrlUndefined", {
            extend : "coon.core.app.PackageController",
            preLaunchHook : function () {
                MOCKCTRLORDER.push("MockCtrlUndefined");
                return undefined;
            }
        });
    };

    const buildManifest = function () {

        const manifest = {};

        manifest.packages = {
            "p_foo" : {
                included : false,
                isLoaded : false,
                namespace : "foo",
                "coon-js" : {package  : {controller : true}}
            },
            "p_bar" : {
                included : true,
                isLoaded : false,
                namespace : "bar",
                "coon-js" : {package  : {controller : true}}
            },
            "p_foobar" : {
                included : false,
                isLoaded : false,
                namespace : "foobar",
                "cs" : {package  : {controller : true}}
            },
            "t_snafu" : {
                included : false,
                isLoaded : false,
                namespace : "snafu",
                "coon-js" : {package  : {controller : true}}
            }
        };

        return manifest;
    };

    t.beforeEach(function () {
        Ext.isModern && Ext.viewport.Viewport.setup();
    });

    t.afterEach(function () {

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

    });

    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------
    t.requireOk("coon.core.app.PackageController", "coon.core.app.Application",  function () {


        t.it("Should create the mainView of an extended class properly", function (t) {


            var w = Ext.create("coon.test.app.mock.ApplicationMock2", {
                name        : "test",
                controllers : [
                    "coon.test.app.mock.PackageControllerMock"
                ]
            });

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


        t.it("postLaunchHookProcess should be Ext.emptyFn", function (t) {
            var w = Ext.create("coon.core.app.Application", {
                name        : "test",
                mainView    : "Ext.Panel"
            });

            t.expect(w.postLaunchHookProcess).toBe(Ext.emptyFn);
            w.destroy();
            w = null;
        });


        t.it("Should not create the mainView at first, then call launch() to make sure it is created", function (t) {
            var w = Ext.create("coon.core.app.Application", {
                name        : "test",
                mainView    : "Ext.Panel",
                controllers : [
                    "coon.test.app.mock.PackageControllerMock"
                ]
            });
            t.expect(w.getMainView()).toBeFalsy();
            w.launch();
            t.expect(w.getMainView() instanceof Ext.Panel).toBeTruthy();
            w.destroy();
            w = null;
        });


        t.it("Should not create the mainView with controllers", function (t) {
            var w = Ext.create("coon.core.app.Application", {
                name        : "test",
                mainView    : "Ext.Panel",
                controllers : [
                    "coon.test.app.mock.PackageControllerMock"
                ]
            });
            t.expect(w.getMainView()).toBeFalsy();
            w.destroy();
            w = null;
        });


        t.it("Should create the mainView with controllers", function (t) {

            var w = Ext.create("coon.core.app.Application", {
                name        : "test",
                mainView    : "Ext.Panel",
                controllers : [
                    "coon.core.app.PackageController"
                ]
            });

            t.isInstanceOf(w.getMainView(), "Ext.Panel");
            w.destroy();
            w = null;
        });

        t.it("Should throw an error when preLaunchHookProcess is triggered when mainView was created.", function (t) {
            var w = Ext.create("coon.core.app.Application", {
                name        : "test",
                mainView    : "Ext.Panel",
                controllers : [
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

        // @see https://github.com/conjoon/lib-cn_core/issues/1
        // @see https://github.com/coon-js/lib-cn_core/issues/5
        t.it("Test changes regarding lib-cn_core#5", function (t) {

            var app = Ext.create("coon.core.app.Application", {
                    name     : "test",
                    mainView : "Ext.Panel",
                    controllers : [
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

            stack   = [{stop:function (){stopped++;}}, {stop:function (){stopped++;}}, {resume : function (){resumed++;}}];
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
            ctrlMock = {isActionRoutable : function (){return "A";}};
            t.expect(app.shouldPackageRoute(ctrlMock, {})).toBe("A");

            // +---------------------------------------------
            // | shouldPackageRoute()
            // +---------------------------------------------
            resumed = 0;
            app.routeActionStack = [{resume : function (){resumed++;}}];
            app.launch();
            t.expect(app.routeActionStack).toEqual([]);
            t.expect(resumed).toBe(1);

            app.destroy();
            app = null;
        });


        t.it("findCoonJsPackageControllers()", function (t) {

            let app = Ext.create("coon.core.app.Application", {
                name     : "test",
                mainView : "Ext.Panel",
                controllers : [
                    "coon.test.app.mock.PackageControllerMock"
                ]
            });

            let manifest = buildManifest(),
                expected = [
                    {included : false, name : "p_foo", controller : "foo.app.PackageController", namespace : "foo", metadata : manifest.packages["p_foo"]},
                    {included : true, name : "p_bar", controller : "bar.app.PackageController", namespace : "bar", metadata : manifest.packages["p_bar"]},
                    {included : false, name : "t_snafu", controller : "snafu.app.PackageController", namespace : "snafu", metadata : manifest.packages["t_snafu"]}
                ],
                tmpFn = Ext.Package.isLoaded;


            Ext.Package.isLoaded = function (key) {
                return manifest.packages[key].isLoaded;
            };

            t.expect(app.findCoonJsPackageControllers(manifest)).toEqual(expected);

            t.expect(app.findCoonJsPackageControllers({})).toEqual([]);

            Ext.Package.isLoaded = tmpFn;

            app.destroy();
            app = null;
        });


        t.it("onProfilesReady() - no coon-js packages", function (t) {

            let PROF_CALLED = 0,
                CALLED = 0,
                tmpOnProf = Ext.app.Application.prototype.onProfilesReady,
                AVOID_CONSTRUCTOR = coon.core.app.Application.prototype.onProfilesReady;

            coon.core.app.Application.prototype.onProfilesReady = Ext.emptyFn;
            Ext.app.Application.prototype.onProfilesReady = function () {
                PROF_CALLED++;
            };

            let app = Ext.create("coon.core.app.Application", {
                    name     : "test",
                    mainView : "Ext.Panel",
                    controllers : [
                        "coon.test.app.mock.PackageControllerMock"
                    ]
                }),
                tmpMani = Ext.manifest,
                tmpFn = Ext.Package.isLoaded;

            t.isCalledNTimes("mapControllerPlugins", app, 0);

            coon.core.app.Application.prototype.onProfilesReady = AVOID_CONSTRUCTOR;

            app.handlePackageLoad = function (){CALLED++;};

            Ext.Package.isLoaded = function (key) {
                return Ext.manifest.packages[key].isLoaded;
            };

            Ext.manifest = {};

            t.expect(app.onProfilesReady()).toEqual([]);
            t.expect(app.controllers).toEqual(["coon.test.app.mock.PackageControllerMock"]);
            t.expect(CALLED).toBe(0);
            t.expect(PROF_CALLED).toBe(1);

            Ext.app.Application.prototype.onProfilesReady = tmpOnProf;
            Ext.Package.isLoaded = tmpFn;
            Ext.manifest = tmpMani;


            // destroy() requires controllers to be mixed collection
            // we are pretty much mocking all of the behaviour in onProfilesReady
            // to successfully run the test, this is why we have to convert to a
            // MixedCollection before we destroy the app
            app.controllers = new Ext.util.MixedCollection();
            app.destroy();
            app = null;
        });


        t.it("onProfilesReady()", function (t) {

            let PROF_CALLED = 0,
                CALLED = 0,
                BLOCKED = 0,
                tmpOnProf = Ext.app.Application.prototype.onProfilesReady,
                AVOID_CONSTRUCTOR = coon.core.app.Application.prototype.onProfilesReady,
                EXT_ONREADY = Ext.onReady,
                EXT_ENV_BLOCK = Ext.env.Ready.block;

            Ext.onReady = function (fn) {fn.apply();};
            Ext.env.Ready.block = function (){BLOCKED++;};

            coon.core.app.Application.prototype.onProfilesReady = Ext.emptyFn;
            Ext.app.Application.prototype.onProfilesReady = function () {
                PROF_CALLED++;
            };

            let app = Ext.create("coon.core.app.Application", {
                    name     : "test",
                    mainView : "Ext.Panel"
                }),
                tmpMani = Ext.manifest,
                tmpFn = Ext.Package.isLoaded;

            let spy = t.spyOn(app, "mapControllerPlugins");

            coon.core.app.Application.prototype.onProfilesReady = AVOID_CONSTRUCTOR;

            app.handlePackageLoad = function (){CALLED++;};
            Ext.Package.isLoaded = function (key) {
                return Ext.manifest.packages[key].isLoaded;
            };

            Ext.manifest = buildManifest();

            Ext.manifest.packages["mock"] = {
                "namespace" : "coon.test.app.mock",
                "included"  : false,
                "isLoaded"  : false,
                "coon-js" : {package : {controller : true, config : {foo : "bar"}}}
            };

            Ext.manifest.packages["mock2"] = {
                "namespace" : "coon.test.app.mock2",
                "included"  : false,
                "isLoaded"  : false,
                "coon-js" : {package : {config : {bar : "foo"}}}
            };

            coon.core.ConfigManager.register("mock", {foo : "bar"});

            let registeredControllers = [
                {included : false, name : "p_foo", metadata : Ext.manifest.packages["p_foo"], controller : "foo.app.PackageController", namespace : "foo"},
                {included : true, name : "p_bar", metadata : Ext.manifest.packages["p_bar"], controller : "bar.app.PackageController", namespace : "bar"},
                {included : false, name : "t_snafu", metadata : Ext.manifest.packages["t_snafu"], controller : "snafu.app.PackageController", namespace : "snafu"},
                {
                    included : false,
                    name : "mock",
                    controller : "coon.test.app.mock.app.PackageController",
                    namespace : "coon.test.app.mock",
                    metadata : Ext.manifest.packages["mock"]
                },
                {
                    included : false,
                    name : "mock2",
                    controller : false,
                    namespace : "coon.test.app.mock2",
                    metadata : Ext.manifest.packages["mock2"]
                }
            ];

            t.expect(app.onProfilesReady()).toEqual(registeredControllers);
            t.expect(app.controllers).toEqual([
                "foo.app.PackageController",
                "bar.app.PackageController",
                "snafu.app.PackageController",
                "coon.test.app.mock.app.PackageController"
            ]);

            t.expect(spy.calls.mostRecent().args[0]).toEqual(registeredControllers);


            t.expect(
                app.getPackageNameForController(
                    Ext.create("coon.test.app.mock.app.PackageController")
                )).toBe("mock");

            t.expect(
                app.getPackageConfig(
                    Ext.create("coon.test.app.mock.app.PackageController")
                )).toEqual({foo : "bar"});

            t.expect(Ext.app.namespaces["foo"]).toBe(true);
            t.expect(Ext.app.namespaces["snafu"]).toBe(true);
            t.expect(Ext.app.namespaces["bar"]).toBe(true);
            t.expect(Ext.app.namespaces["foobar"]).toBeUndefined();

            t.expect(CALLED).toBe(1);
            t.expect(PROF_CALLED).toBe(1);
            t.expect(BLOCKED).toBe(2); // called due to loading PackageController

            Ext.onReady = EXT_ONREADY;
            Ext.env.Ready.block = EXT_ENV_BLOCK;
            Ext.app.Application.prototype.onProfilesReady = tmpOnProf;
            Ext.Package.isLoaded = tmpFn;
            Ext.manifest = tmpMani;

            // destroy() requires controllers to be mixed collection
            // we are pretty much mocking all of the behaviour in onProfilesReady
            // to successfully run the test, this is why we have to convert to a
            // MixedCollection before we destroy the app
            app.controllers = new Ext.util.MixedCollection();
            app.destroy();
            app = null;
        });


        t.it("computePackageConfigUrl()", function (t) {

            let tmpResPath = Ext.getResourcePath;

            Ext.getResourcePath = function (script, env, pack) {
                return script + "" + env + "" + pack;
            };

            app = Ext.create("coon.core.app.Application", {
                name     : "test",
                mainView : "Ext.Panel"
            });

            t.expect(app.computePackageConfigUrl("PACKAGE")).toBe(
                "coon-js/PACKAGEnull.conf.json"
            );


            Ext.getResourcePath = tmpResPath;

        });


        t.it("registerPackageConfig()", function (t){

            app = Ext.create("coon.core.app.Application", {
                name     : "test",
                mainView : "Ext.Panel"
            });

            let left = {foo : "bar" , "a" : "b"};
            let right = {foo : "1bar", snafu : "meh."};

            let ConfigManager = coon.core.ConfigManager;

            app.registerPackageConfig("a", left, right);
            t.expect(ConfigManager.get("a")).toBeDefined();
            t.expect(ConfigManager.get("a")).not.toBe(left);
            t.expect(ConfigManager.get("a")).not.toBe(right);
            t.expect(ConfigManager.get("a")).toEqual( {foo : "1bar", snafu : "meh.", a : "b"});


            left = undefined;
            right = {foo : "1bar", snafu : "meh."};

            app.registerPackageConfig("b", left, right);
            t.expect(ConfigManager.get("b")).toEqual( {foo : "1bar", snafu : "meh."});


            left = {foo : "bar" , "a" : "b"};
            right = null;

            app.registerPackageConfig("c", left, right);
            t.expect(ConfigManager.get("c")).toEqual({foo : "bar" , "a" : "b"});

        });


        t.it("handlePackageLoad() - config loaded", function (t) {


            let ConfigManager = coon.core.ConfigManager,
                tmpOnProf = coon.core.app.Application.prototype.onProfilesReady,
                tmpComp = coon.core.app.Application.prototype.computePackageConfigUrl,
                CALLED = 0,
                UNBLOCKED = 0,
                EXT_ENV_UNBLOCK = Ext.env.Ready.unblock;

            Ext.env.Ready.unblock = function (){UNBLOCKED++;};

            coon.core.app.Application.prototype.onProfilesReady = function () {
                CALLED++;
            };

            coon.core.app.Application.prototype.computePackageConfigUrl = function (packageName) {
                return "src/app/mock/coon-js." + packageName + "-mock.conf.json";
            };

            let app = Ext.create("coon.core.app.Application", {
                    name     : "test",
                    mainView : "Ext.Panel"
                }),
                tmpLoad = Ext.Package.load,
                tmpLoadAllScripts = Ext.Package.loadAllScripts;


            Ext.Package.load = function (conf) {
                return new Ext.Promise(function (resolve, reject) {
                    resolve(conf);
                });
            };

            Ext.Package.loadAllScripts = function (packageName, scriptArray) {
                return new Ext.Promise(function (resolve, reject) {
                    resolve(packageName);
                });
            };

            let stack = [
                {name : "c", metadata : {"coon-js":{}}},
                {name : "b", metadata : {"coon-js":{package:{config:{}}}}},
                {name : "a", metadata : {"coon-js":{package:{config:{"foo" : "foobar"}}}}},
                {included : true, name : "d", metadata : {"coon-js":{package:{config:{"dfoo" : "dfoobar"}}}}}
            ];


            app.handlePackageLoad(stack.pop(), stack);

            t.waitForMs(1250, function () {

                t.expect(ConfigManager.get("a")).toEqual({
                    "foo" : "bar",
                    snafu : true
                });

                t.expect(ConfigManager.get("b")).toEqual({
                });

                t.expect(ConfigManager.get("c")).toBeUndefined();

                t.expect(ConfigManager.get("d")).toEqual({
                    "dfoo" : "dfoobar"
                });

                t.expect(stack).toEqual([]);
                t.expect(CALLED).toBe(1);
                t.expect(UNBLOCKED).toBe(1);

                Ext.env.Ready.unblock = EXT_ENV_UNBLOCK;
                Ext.Package.load = tmpLoad;
                Ext.Package.loadAllScripts = tmpLoadAllScripts;
                coon.core.app.Application.prototype.onProfilesReady = tmpOnProf;
                coon.core.app.Application.prototype.computePackageConfigUrl = tmpComp;

                app.destroy();
                app = null;
            });


        });


        t.it("Should never call launch()", function (t) {

            var LAUNCHCALLED = false;

            coon.core.app.PackageController.prototype.preLaunchHook = function () {
                return false;
            };

            coon.core.app.Application.prototype.launch = function () {
                LAUNCHCALLED = true;
            };

            var app = Ext.create("coon.core.app.Application", {
                name        : "test",
                mainView    : "Ext.Container",
                controllers : [
                    "coon.core.app.PackageController"
                ]
            });

            t.expect(LAUNCHCALLED).toBe(false);

            app.destroy();
            app = null;
        });


        t.it("Should call launch()", function (t) {

            var LAUNCHCALLED = false;

            coon.core.app.PackageController.prototype.preLaunchHook = function () {
                return true;
            };

            coon.core.app.Application.prototype.launch = function () {
                LAUNCHCALLED = true;
            };

            var app = Ext.create("coon.core.app.Application", {
                name        : "test",
                mainView    : "Ext.Container",
                controllers : [
                    "coon.core.app.PackageController"
                ]
            });

            t.expect(LAUNCHCALLED).toBe(true);

            app.destroy();
            app = null;
        });


        t.it("Should call launch(), then postLaunchHook()", function (t) {

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
                name        : "test",
                mainView    : "Ext.Container",
                controllers : [
                    "coon.core.app.PackageController"
                ],
                postLaunchHookProcess : function () {
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


        t.it("Tests with preLaunchHooks ", function (t) {

            defineControllerMocks();

            t.waitForMs(500, function () {

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


        t.it("Tests with preLaunchHooks / return value undefined", function (t) {
            // return value undefined

            defineControllerMocks();

            t.waitForMs(500, function () {
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


        t.it("getPackageNameForController()", function (t) {

            app = Ext.create("coon.core.app.Application", {
                name : "test",
                mainView : "Ext.Panel"
            });

            app.packageMap = {"coon.test.app.mock.app.PackageController" : "mock"};

            let ctrl = Ext.create("coon.test.app.mock.app.PackageController");

            t.expect(app.getPackageNameForController(ctrl)).toBe("mock");
        });


        t.it("getPackageConfig()", function (t) {

            coon.core.ConfigManager.register("mock", {foo : "bar"});

            app = Ext.create("coon.core.app.Application", {
                name : "test",
                mainView : "Ext.Panel"
            });

            app.packageMap = {"coon.test.app.mock.app.PackageController" : "mock"};

            let ctrl = Ext.create("coon.test.app.mock.app.PackageController");

            t.expect(app.getPackageConfig(ctrl, "foo")).toBe("bar");
            t.expect(app.getPackageConfig(ctrl)).toEqual({foo : "bar"});
        });


        t.it("findCoonJsPackageControllers() - exception", function (t) {

            app = Ext.create("coon.core.app.Application", {
                name     : "test",
                mainView : "Ext.Panel"
            });

            let manifest = buildManifest();
            manifest.packages["mock"] = manifest.packages["p_foo"];


            Ext.Package.isLoaded = function (key) {
                return false;
            };

            let exc;

            try {
                app.findCoonJsPackageControllers(manifest);
            } catch (e) {
                exc = e;
            }

            t.expect(exc.msg).toContain("already registered");

        });


        t.it("loadPackageConfig()", function (t) {

            app = Ext.create("coon.core.app.Application", {
                name : "test",
                mainView : "Ext.Panel"
            });

            let resolved = app.loadPackageConfig({
                name : "foo"
            });

            t.isInstanceOf(resolved, "Ext.promise.Promise");
            t.expect(resolved.owner.completionValue).toBe("foo");
        });


        t.it("packageConfigLoadResolved()", function (t) {

            app = Ext.create("coon.core.app.Application", {
                name : "test",
                mainView : "Ext.Panel"
            });

            let ret = app.packageConfigLoadResolved("foo");

            t.expect(ret).toBe("foo");

            ret = app.packageConfigLoadResolved({
                request : {
                    params : {
                        packageName : "foo"
                    },
                    defaultPackageConfig : {}
                },
                responseText : "{}"
            });

            t.expect(ret).toBe("foo");

        });


        t.it("mapControllerPlugins()", function (t) {

            const orgMani = Ext.manifest;

            app = Ext.create("coon.core.app.Application", {
                name : "test",
                mainView : "Ext.Panel"
            });

            Ext.manifest = buildManifest();

            coon.core.ConfigManager.register("p_bar",  coon.core.Util.chain("plugins.controller", {}, ["mockplugin"]));
            Ext.manifest.packages["mockplugin"] = {namespace : "snafu.com"};
            let packages = [
                {name : "p_foo", controller : "foo.app.PackageController"},
                {name : "p_bar", controller : "bar.app.PackageController"}
            ];

            t.expect(app.pluginMap).toEqual({});

            let map = app.mapControllerPlugins(packages);

            t.expect(map).toEqual({"bar.app.PackageController" : ["snafu.com.app.ControllerPlugin"]});
            t.expect(map).toBe(app.pluginMap);

            Ext.manifest = orgMani;
        });


        t.it("getController()", function (t) {

            app = Ext.create("coon.core.app.Application", {
                name : "test",
                mainView : "Ext.Panel",
                controllers : [
                    "coon.test.app.mock.app.PackageController"
                ]
            });

            app.pluginMap= {
                "coon.test.app.mock.app.PackageController" : ["coon.test.app.mock.app.ControllerPlugin"]
            };

            let controller = app.getController("coon.test.app.mock.app.PackageController");

            t.isInstanceOf(controller, "coon.test.app.mock.app.PackageController");
            t.expect(controller.plugins.length).toBe(1);
            let plugin = controller.plugins[0];
            t.isInstanceOf(plugin, "coon.test.app.mock.app.ControllerPlugin");

            let controller2 = app.getController("coon.test.app.mock.app.PackageController");
            t.expect(controller2).toBe(controller);
            t.expect(controller.plugins.length).toBe(1);
            t.expect(controller.plugins[0]).toBe(plugin);
        });

    });});
