/**
 * coon.js
 * lib-cn_core
 * Copyright (C) 2020 Thorsten Suckow-Homberg https://github.com/coon-js/lib-cn_core
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
describe('coon.core.app.ApplicationTest', function(t) {

    let app = null;


    const buildManifest = function() {

        const manifest = {};

        manifest.packages = {
            'p_foo' : {
                included : false,
                isLoaded : false,
                namespace : 'foo',
                'coon-js' : {package  : {controller : true}}
            },
            'p_bar' : {
                included : true,
                isLoaded : false,
                namespace : 'bar',
                'coon-js' : {package  : {controller : true}}
            },
            'p_foobar' : {
                included : false,
                isLoaded : false,
                namespace : 'foobar',
                'cs' : {package  : {controller : true}}
            },
            't_snafu' : {
                included : false,
                isLoaded : false,
                namespace : 'snafu',
                'coon-js' : {package  : {controller : true}}
            }
        };

        return manifest;
    };

    t.beforeEach(function() {
        Ext.isModern && Ext.viewport.Viewport.setup();
    });

    t.afterEach(function() {

        if (app) {
            app.destroy();
            app = null;
        }

        if (Ext.isModern && Ext.Viewport) {
            Ext.Viewport.destroy();
            Ext.Viewport = null;
        }

        coon.core.ConfigManager.configs = {};

    });

// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------
t.requireOk("coon.core.app.PackageController", "coon.core.app.Application",  function() {


    t.it('Should create the mainView of an extended class properly', function(t) {


        var w = Ext.create('coon.test.app.mock.ApplicationMock2', {
            name        : 'test',
            controllers : [
                'coon.test.app.mock.PackageControllerMock'
            ]
        });

        var VIEW = null;
        if (Ext.isModern) {
            Ext.Viewport.add = function(mainView) {
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


    t.it('postLaunchHookProcess should be Ext.emptyFn', function(t) {
        var w = Ext.create('coon.core.app.Application', {
            name        : 'test',
            mainView    : 'Ext.Panel'
        });

        t.expect(w.postLaunchHookProcess).toBe(Ext.emptyFn);
        w.destroy();
        w = null;
    });


    t.it('Should not create the mainView at first, then call launch() to make sure it is created', function(t) {
        var w = Ext.create('coon.core.app.Application', {
            name        : 'test',
            mainView    : 'Ext.Panel',
            controllers : [
                'coon.test.app.mock.PackageControllerMock'
            ]
        });
        t.expect(w.getMainView()).toBeFalsy();
        w.launch();
        t.expect(w.getMainView() instanceof Ext.Panel).toBeTruthy();
        w.destroy();
        w = null;
    });


    t.it('Should not create the mainView with controllers', function(t) {
        var w = Ext.create('coon.core.app.Application', {
            name        : 'test',
            mainView    : 'Ext.Panel',
            controllers : [
                'coon.test.app.mock.PackageControllerMock'
            ]
        });
        t.expect(w.getMainView()).toBeFalsy();
        w.destroy();
        w = null;
    });


    t.it('Should create the mainView with controllers', function(t) {

        var w = Ext.create('coon.core.app.Application', {
            name        : 'test',
            mainView    : 'Ext.Panel',
            controllers : [
                'coon.core.app.PackageController'
            ]
        });

        t.expect(w.getMainView() instanceof Ext.Panel).toBeTruthy();
        w.destroy();
        w = null;
    });

    t.it('Should throw an error when preLaunchHookProcess is triggered when mainView was created.', function(t) {
        var w = Ext.create('coon.core.app.Application', {
            name        : 'test',
            mainView    : 'Ext.Panel',
            controllers : [
                'coon.core.app.PackageController'
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
    t.it('Test changes regarding lib-cn_core#5', function(t) {

        var app = Ext.create('coon.core.app.Application', {
                name     : 'test',
                mainView : 'Ext.Panel',
                controllers : [
                    'coon.test.app.mock.PackageControllerMock'
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

        stack   = [{stop:function(){stopped++;}}, {stop:function(){stopped++;}}, {resume : function(){resumed++;}}];
        t.expect(app.releaseLastRouteAction(stack)).toBe(true);
        t.expect(stopped).toBe(2);
        t.expect(stack).toEqual([]);
        t.expect(resumed).toBe(1);

        // +---------------------------------------------
        // | interceptAction()
        // +---------------------------------------------
        // with array
        app.routeActionStack = ['a'];
        t.expect(app.interceptAction('b')).toBe(false);
        t.expect(app.routeActionStack).toEqual(['a', 'b']);
        // with null
        app.routeActionStack = null;
        t.expect(app.interceptAction('c')).toBe(false);
        t.expect(app.routeActionStack).toEqual(['c']);

        // +---------------------------------------------
        // | shouldPackageRoute()
        // +---------------------------------------------
        ctrlMock = {isActionRoutable : function(){return 'A';}};
        t.expect(app.shouldPackageRoute(ctrlMock, {})).toBe('A')

        // +---------------------------------------------
        // | shouldPackageRoute()
        // +---------------------------------------------
        resumed = 0;
        app.routeActionStack = [{resume : function(){resumed++;}}];
        app.launch();
        t.expect(app.routeActionStack).toEqual([]);
        t.expect(resumed).toBe(1);

        app.destroy();
        app = null;
    });


    t.it("findCoonJsPackageControllers()", function(t) {

        let app = Ext.create('coon.core.app.Application', {
                name     : 'test',
                mainView : 'Ext.Panel',
                controllers : [
                    'coon.test.app.mock.PackageControllerMock'
                ]
            });

        let manifest = buildManifest(),
            expected = [
                {name : 'p_foo', controller : 'foo.app.PackageController', namespace : 'foo', metadata : manifest.packages["p_foo"]},
                {name : 't_snafu', controller : 'snafu.app.PackageController', namespace : 'snafu', metadata : manifest.packages["t_snafu"]}
            ],
            tmpFn = Ext.Package.isLoaded;


        Ext.Package.isLoaded = function(key) {
            return manifest.packages[key].isLoaded;
        };

        t.expect(app.findCoonJsPackageControllers(manifest)).toEqual(expected);
        t.expect(app.findCoonJsPackageControllers({})).toEqual([]);

        Ext.Package.isLoaded = tmpFn;

        app.destroy();
        app = null;
    });


    t.it("onProfilesReady() - no coon-js packages", function(t) {

        let PROF_CALLED = 0,
            CALLED = 0,
            tmpOnProf = Ext.app.Application.prototype.onProfilesReady,
            AVOID_CONSTRUCTOR = coon.core.app.Application.prototype.onProfilesReady;

        coon.core.app.Application.prototype.onProfilesReady = Ext.emptyFn;
        Ext.app.Application.prototype.onProfilesReady = function() {
            PROF_CALLED++;
        };

        let app = Ext.create('coon.core.app.Application', {
                name     : 'test',
                mainView : 'Ext.Panel',
                controllers : [
                    'coon.test.app.mock.PackageControllerMock'
                ]
            }),
            tmpMani = Ext.manifest,
            tmpFn = Ext.Package.isLoaded;

        coon.core.app.Application.prototype.onProfilesReady = AVOID_CONSTRUCTOR;

        app.handlePackageLoad = function(){CALLED++;};

        Ext.Package.isLoaded = function(key) {
            return Ext.manifest.packages[key].isLoaded;
        };

        Ext.manifest = {};

        t.expect(app.onProfilesReady()).toEqual([]);
        t.expect(app.controllers).toEqual(['coon.test.app.mock.PackageControllerMock']);
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


    t.it("onProfilesReady()", function(t) {

        let PROF_CALLED = 0,
            CALLED = 0,
            BLOCKED = 0,
            tmpOnProf = Ext.app.Application.prototype.onProfilesReady,
            AVOID_CONSTRUCTOR = coon.core.app.Application.prototype.onProfilesReady,
            EXT_ONREADY = Ext.onReady,
            EXT_ENV_BLOCK = Ext.env.Ready.block;

        Ext.onReady = function(fn) {fn.apply();};
        Ext.env.Ready.block = function(){BLOCKED++;};

        coon.core.app.Application.prototype.onProfilesReady = Ext.emptyFn;
        Ext.app.Application.prototype.onProfilesReady = function() {
            PROF_CALLED++;
        };

        let app = Ext.create('coon.core.app.Application', {
                  name     : 'test',
                  mainView : 'Ext.Panel'
              }),
              tmpMani = Ext.manifest,
              tmpFn = Ext.Package.isLoaded;

        coon.core.app.Application.prototype.onProfilesReady = AVOID_CONSTRUCTOR;

        app.handlePackageLoad = function(){CALLED++;};
        Ext.Package.isLoaded = function(key) {
            return Ext.manifest.packages[key].isLoaded;
        };

        Ext.manifest = buildManifest();


        Ext.manifest.packages["mock"] = {
            "namespace" : "coon.test.app.mock",
            "included"  : false,
            "isLoaded"  : false,
            "coon-js" : {package : {controller : true, config : {foo : "bar"}}}
        };

        coon.core.ConfigManager.register("mock", {foo : "bar"});

        t.expect(app.onProfilesReady()).toEqual([
            {name : 'p_foo', controller : 'foo.app.PackageController', namespace : 'foo', metadata : Ext.manifest.packages["p_foo"]},
            {name : 't_snafu', controller : 'snafu.app.PackageController', namespace : 'snafu', metadata : Ext.manifest.packages["t_snafu"]},
            {
                name : 'mock',
                controller : 'coon.test.app.mock.app.PackageController',
                namespace : 'coon.test.app.mock',
                metadata : Ext.manifest.packages["mock"]
            }
        ]);
        t.expect(app.controllers).toEqual([
            'foo.app.PackageController',
            'snafu.app.PackageController',
            'coon.test.app.mock.app.PackageController'
        ]);

        t.expect(
            app.getPackageNameForController(
                Ext.create('coon.test.app.mock.app.PackageController')
            )).toBe("mock");

        t.expect(
            app.getPackageConfig(
                Ext.create('coon.test.app.mock.app.PackageController')
            )).toEqual({foo : "bar"});


        t.expect(Ext.app.namespaces['foo']).toBe(true);
        t.expect(Ext.app.namespaces['snafu']).toBe(true);

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


    t.it("computePackageConfigUrl()", function(t) {

        let tmpResPath = Ext.getResourcePath;

        Ext.getResourcePath = function(script, env, pack) {
            return script + "" + env + "" + pack;
        }

        app = Ext.create('coon.core.app.Application', {
            name     : 'test',
            mainView : 'Ext.Panel'
        });

        t.expect(app.computePackageConfigUrl("PACKAGE")).toBe(
            "coon-js/PACKAGEnull.conf.json"
        );


        Ext.getResourcePath = tmpResPath;

    });


    t.it("registerPackageConfig()", function(t){

        app = Ext.create('coon.core.app.Application', {
            name     : 'test',
            mainView : 'Ext.Panel'
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


    t.it("handlePackageLoad() - config loaded", function(t) {


        let ConfigManager = coon.core.ConfigManager,
            tmpOnProf = coon.core.app.Application.prototype.onProfilesReady,
            tmpComp = coon.core.app.Application.prototype.computePackageConfigUrl,
            CALLED = 0,
            UNBLOCKED = 0,
            EXT_ENV_UNBLOCK = Ext.env.Ready.unblock;

        Ext.env.Ready.unblock = function(){UNBLOCKED++;};

        coon.core.app.Application.prototype.onProfilesReady = function() {
            CALLED++;
        };

        coon.core.app.Application.prototype.computePackageConfigUrl = function(packageName) {
            return "src/app/mock/coon-js." + packageName + "-mock.conf.json";
        };

        let app = Ext.create('coon.core.app.Application', {
                name     : 'test',
                mainView : 'Ext.Panel'
            }),
            tmpLoad = Ext.Package.load;


        Ext.Package.load = function(conf) {
            return new Ext.Promise(function(resolve, reject) {
                resolve(conf);
            });
        }

        let stack = [
            {name : 'c', metadata : {"coon-js":{}}},
            {name : 'b', metadata : {"coon-js":{package:{config:{}}}}},
            {name : 'a', metadata : {"coon-js":{package:{config:{"foo" : "foobar"}}}}}
        ];


        app.handlePackageLoad(stack.pop(), stack);

        t.waitForMs(1250, function() {

            t.expect(ConfigManager.get("a")).toEqual({
                "foo" : "bar",
                snafu : true
            });

            t.expect(ConfigManager.get("b")).toEqual({
            });

            t.expect(ConfigManager.get("c")).toBeUndefined();

            t.expect(stack).toEqual([]);
            t.expect(CALLED).toBe(1);
            t.expect(UNBLOCKED).toBe(1);

            Ext.env.Ready.unblock = EXT_ENV_UNBLOCK;
            Ext.Package.load = tmpLoad;
            coon.core.app.Application.prototype.onProfilesReady = tmpOnProf;
            coon.core.app.Application.prototype.computePackageConfigUrl = tmpComp;

            app.destroy();
            app = null;
        });


    });


    t.it('Should never call launch()', function(t) {
        var exc = undefined;

        var LAUNCHCALLED = false;

        coon.core.app.PackageController.prototype.preLaunchHook = function() {
            return false;
        };

        coon.core.app.Application.prototype.launch = function() {
            LAUNCHCALLED = true;
        };

        var app = Ext.create('coon.core.app.Application', {
            name        : 'test',
            mainView    : 'Ext.Container',
            controllers : [
                'coon.core.app.PackageController'
            ]
        });

        t.expect(LAUNCHCALLED).toBe(false);

        app.destroy();
        app = null;
    });


    t.it('Should call launch()', function(t) {
        var exc = undefined;

        var LAUNCHCALLED = false;

        coon.core.app.PackageController.prototype.preLaunchHook = function() {
            return true;
        };

        coon.core.app.Application.prototype.launch = function() {
            LAUNCHCALLED = true;
        };

        var app = Ext.create('coon.core.app.Application', {
            name        : 'test',
            mainView    : 'Ext.Container',
            controllers : [
                'coon.core.app.PackageController'
            ]
        });

        t.expect(LAUNCHCALLED).toBe(true);

        app.destroy();
        app = null;
    });


    t.it('Should call launch(), then postLaunchHook()', function(t) {
        var exc = undefined;

        var i = 0;
        var LAUNCH = 0;
        var POSTLAUNCH = 0;


        coon.core.app.PackageController.prototype.preLaunchHook = function() {
            return true;
        };

        coon.core.app.PackageController.prototype.postLaunchHook = function() {
            POSTLAUNCH = ++i;
        };

        coon.core.app.Application.prototype.launch = function() {
            LAUNCH = ++i;
        };

        var app = Ext.create('coon.core.app.Application', {
            name        : 'test',
            mainView    : 'Ext.Container',
            controllers : [
                'coon.core.app.PackageController'
            ],
            postLaunchHookProcess : function() {
                this.getController('coon.core.app.PackageController').postLaunchHook();
            }
        });

        t.expect(LAUNCH).toBe(1);
        t.expect(POSTLAUNCH).toBe(2);

        coon.core.app.PackageController.prototype.preLaunchHook = Ext.emptyFn();
        coon.core.app.PackageController.prototype.postLaunchHook = Ext.emptyFn();

        app.destroy();
        app = null;
    });


    t.it('Should throw an error when preLaunchHookProcess is triggered when mainView was created.', function(t) {
        var w = Ext.create('coon.core.app.Application', {
            name        : 'test',
            mainView    : 'Ext.Panel',
            controllers : [
                'coon.core.app.PackageController'
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


    t.it('Should create mainView based on ObjectConfig (classic only).', function(t) {

        let w;


        try {
            w = Ext.create('coon.core.app.Application', {
                name        : 'test',
                mainView    : {
                    xtype : "panel",
                    viewModel : {
                        data : {
                            myTitle : "foo"
                        }
                    },
                    bind : {
                        title : "{myTitle}"
                    }
                },
                controllers : [
                    'coon.core.app.PackageController'
                ]
            });
        } catch(exc) {
            if (Ext.isModern) {
                t.expect(exc).toBeDefined();
                return;
            }
        }
        w.getMainView().getViewModel().notify();
        t.expect(w.getMainView() instanceof Ext.Panel).toBeTruthy();
        t.expect(w.getMainView().getTitle()).toBe("foo");
        w.destroy();
        w = null;
    });

    t.it("getPackageNameForController()", function(t) {

        app = Ext.create('coon.core.app.Application', {
            name : "test",
            mainView : "Ext.Panel"
        });

        app.packageMap = {'coon.test.app.mock.app.PackageController' : "mock"};

        let ctrl = Ext.create('coon.test.app.mock.app.PackageController');

        t.expect(app.getPackageNameForController(ctrl)).toBe("mock");
    });


    t.it("getPackageConfig()", function(t) {

        coon.core.ConfigManager.register("mock", {foo : "bar"});

        app = Ext.create('coon.core.app.Application', {
            name : "test",
            mainView : "Ext.Panel"
        });

        app.packageMap = {'coon.test.app.mock.app.PackageController' : "mock"};

        let ctrl = Ext.create('coon.test.app.mock.app.PackageController');

        t.expect(app.getPackageConfig(ctrl, "foo")).toBe("bar");
        t.expect(app.getPackageConfig(ctrl)).toEqual({foo : "bar"});
    });


    t.it("findCoonJsPackageControllers() - exception", function(t) {

        app = Ext.create('coon.core.app.Application', {
            name     : 'test',
            mainView : 'Ext.Panel'
        });

        let manifest = buildManifest();
        manifest.packages["mock"] = manifest.packages["p_foo"];


        Ext.Package.isLoaded = function(key) {
            return false;
        };

        let exc, e;

        try {
            app.findCoonJsPackageControllers(manifest);
        } catch (e) {
            exc = e;
        }

        t.expect(exc.msg).toContain("already registered");

    });

});});
