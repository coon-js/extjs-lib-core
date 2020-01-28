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

    const buildManifest = function() {

        const manifest = {};

        manifest.packages = {
            'p_foo' : {
                included : false,
                isLoaded : false,
                namespace : 'foo',
                'coon-js' : {packageController : true}
            },
            'p_bar' : {
                included : true,
                isLoaded : false,
                namespace : 'bar',
                'coon-js' : {packageController : true}
            },
            'p_foobar' : {
                included : false,
                isLoaded : false,
                namespace : 'foobar',
                'cs' : {packageController : true}
            },
            't_snafu' : {
                included : false,
                isLoaded : false,
                namespace : 'snafu',
                'coon-js' : {packageController : true}
            }
        };

        return manifest;
    };

    t.beforeEach(function() {
        Ext.isModern && Ext.viewport.Viewport.setup();
    });

    t.afterEach(function() {

        if (Ext.isModern && Ext.Viewport) {
            Ext.Viewport.destroy();
            Ext.Viewport = null;
        }




    });

// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.it('Should create the mainView of an extended class properly by using applicationViewClassName', function(t) {


        var w = Ext.create('coon.test.app.mock.ApplicationMock2', {
            name        : 'test',
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


    t.it('Should not create the mainView of an extended class at first, but should be available after launch() was called', function(t) {

        var exc = undefined;

        try {
            var w = Ext.create('coon.test.app.mock.ApplicationMock', {
                name        : 'test',
                controllers : [
                    'coon.test.app.mock.PackageControllerMock'
                ]
            });
        } catch(e) {
            exc = e;
        }

        t.expect(exc.msg).toContain("coon.core.app.Application requires applicationViewClassName, not mainView to be set.");
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


    t.it('applicationViewClassName should be null', function(t) {
        t.expect(coon.core.app.Application.prototype.applicationViewClassName).toBeNull();
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
        t.expect(exc).toBeDefined();
        w.destroy();
        w = null;
    });


    // Test error
    t.it('Should throw an error when mainView is not specified', function(t) {
        var exc = undefined;

        try {
            Ext.create('coon.core.app.Application', {
                name  : 'test'
           });

        } catch(e) {exc = e;}

        t.expect(exc).not.toBeNull();
        t.expect(exc).toBeDefined();

    });

    t.it('Should throw an error when mainView is not specified as string', function(t) {
        var exc = undefined;

        try {
            Ext.create('coon.core.app.Application', {
                name  : 'test',
                mainView : {}
            });

        } catch(e) {exc = e;}

        t.expect(exc).not.toBeNull();
        t.expect(exc).toBeDefined();
    });


    t.it('Should throw an error when mainView is not loaded', function(t) {
        var exc = undefined;

        try {
            Ext.create('coon.core.app.Application', {
                name  : 'test',
                mainView : 'coon.fictionalClass'
            });

        } catch(e) {exc = e;}

        t.expect(exc).not.toBeNull();
        t.expect(exc).toBeDefined();
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
            }),
            manifest = buildManifest(),
            expected = {
                'p_foo'   : {controller : 'foo.app.PackageController', namespace : 'foo'},
                't_snafu' : {controller : 'snafu.app.PackageController', namespace : 'snafu'}
            },
            tmpFn = Ext.Package.isLoaded;


        Ext.Package.isLoaded = function(key) {
            return manifest.packages[key].isLoaded;
        };

        t.expect(app.findCoonJsPackageControllers(manifest)).toEqual(expected);
        t.expect(app.findCoonJsPackageControllers({})).toEqual({});

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

        t.expect(app.onProfilesReady()).toEqual({});
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

        Ext.manifest = buildManifest();

        t.expect(app.onProfilesReady()).toEqual({
            'p_foo'   : {controller : 'foo.app.PackageController', namespace : 'foo'},
            't_snafu' : {controller : 'snafu.app.PackageController', namespace : 'snafu'}
        });
        t.expect(app.controllers).toEqual([
            'coon.test.app.mock.PackageControllerMock',
            'foo.app.PackageController',
            'snafu.app.PackageController'
        ]);

        t.expect(Ext.app.namespaces['foo']).toBe(true);
        t.expect(Ext.app.namespaces['snafu']).toBe(true);

        t.expect(CALLED).toBe(1);
        t.expect(PROF_CALLED).toBe(1);
        t.expect(BLOCKED).toBe(1);

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


    t.it("handlePackageLoad()", function(t) {


        let tmpOnProf = coon.core.app.Application.prototype.onProfilesReady,
            CALLED = 0,
            UNBLOCKED = 0,
            EXT_ENV_UNBLOCK = Ext.env.Ready.unblock;

            Ext.env.Ready.unblock = function(){UNBLOCKED++;};

        coon.core.app.Application.prototype.onProfilesReady = function() {
            CALLED++;
        };

        let app = Ext.create('coon.core.app.Application', {
                name     : 'test',
                mainView : 'Ext.Panel'
            }),
            tmpLoad = Ext.Package.load;


        Ext.Package.load = function() {
            return new Ext.Promise(function(resolve, reject) {
                resolve()
            });
        }

        let stack = ['b', 'c'];

        app.handlePackageLoad('a', stack)

        t.waitForMs(250, function() {
            t.expect(stack).toEqual([]);
            t.expect(CALLED).toBe(1);
            t.expect(UNBLOCKED).toBe(1);

            Ext.env.Ready.unblock = EXT_ENV_UNBLOCK;
            Ext.Package.load = tmpLoad;
            coon.core.app.Application.prototype.onProfilesReady = tmpOnProf;
        });

        app.destroy();
        app = null;
    });

});
