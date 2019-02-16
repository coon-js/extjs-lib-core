/**
 * coon.js
 * lib-cn_core
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/coon-js/lib-cn_core
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
describe('conjoon.cn_core.app.ApplicationTest', function(t) {

// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.it('Should create the mainView of an extended class properly by using applicationViewClassName', function(t) {

        var w = Ext.create('conjoon.test.app.mock.ApplicationMock2', {
            name        : 'test',
            controllers : [
                'conjoon.test.app.mock.PackageControllerMock'
            ]
        });

        t.expect(w.getMainView()).toBeFalsy();
        w.launch();
        t.expect(w.getMainView() instanceof Ext.Panel).toBeTruthy();
    });


    t.it('Should not create the mainView of an extended class at first, but should be available after launch() was called', function(t) {

        var exc = undefined;

        try {
            var w = Ext.create('conjoon.test.app.mock.ApplicationMock', {
                name        : 'test',
                controllers : [
                    'conjoon.test.app.mock.PackageControllerMock'
                ]
            });
        } catch(e) {
            exc = e;
        }

        t.expect(exc).toBeTruthy();
    });

    t.it('postLaunchHookProcess should be Ext.emptyFn', function(t) {
        var w = Ext.create('conjoon.cn_core.app.Application', {
            name        : 'test',
            mainView    : 'Ext.Panel'
        });

        t.expect(w.postLaunchHookProcess).toBe(Ext.emptyFn);
    });

    t.it('applicationViewClassName should be null', function(t) {
        t.expect(conjoon.cn_core.app.Application.prototype.applicationViewClassName).toBeNull();
    });


    t.it('Should not create the mainView at first, then call launch() to make sure it is created', function(t) {
        var w = Ext.create('conjoon.cn_core.app.Application', {
            name        : 'test',
            mainView    : 'Ext.Panel',
            controllers : [
                'conjoon.test.app.mock.PackageControllerMock'
            ]
        });
        t.expect(w.getMainView()).toBeFalsy();
        w.launch();
        t.expect(w.getMainView() instanceof Ext.Panel).toBeTruthy();
    });


    t.it('Should not create the mainView with controllers', function(t) {
        var w = Ext.create('conjoon.cn_core.app.Application', {
            name        : 'test',
            mainView    : 'Ext.Panel',
            controllers : [
                'conjoon.test.app.mock.PackageControllerMock'
            ]
        });
        t.expect(w.getMainView()).toBeFalsy();
    });


    t.it('Should create the mainView with controllers', function(t) {

        var w = Ext.create('conjoon.cn_core.app.Application', {
            name        : 'test',
            mainView    : 'Ext.Panel',
            controllers : [
                'conjoon.cn_core.app.PackageController'
            ]
        });

        t.expect(w.getMainView() instanceof Ext.Panel).toBeTruthy();
    });

    t.it('Should throw an error when preLaunchHookProcess is triggered when mainView was created.', function(t) {
        var w = Ext.create('conjoon.cn_core.app.Application', {
            name        : 'test',
            mainView    : 'Ext.Panel',
            controllers : [
                'conjoon.cn_core.app.PackageController'
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
    });


    /**
     * Test error
     */
    t.it('Should throw an error when mainView is not specified', function(t) {
        var exc = undefined;

        try {
            Ext.create('conjoon.cn_core.app.Application', {
                name  : 'test'
           });

        } catch(e) {exc = e;}

        t.expect(exc).not.toBeNull();
         t.expect(exc).toBeDefined();
    });

    t.it('Should throw an error when mainView is not specified as string', function(t) {
        var exc = undefined;

        try {
            Ext.create('conjoon.cn_core.app.Application', {
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
            Ext.create('conjoon.cn_core.app.Application', {
                name  : 'test',
                mainView : 'conjoon.fictionalClass'
            });

        } catch(e) {exc = e;}

        t.expect(exc).not.toBeNull();
        t.expect(exc).toBeDefined();
    });

    /**
     * @see https://github.com/conjoon/lib-cn_core/issues/1
     */
    t.it('Test changes regarding lib-cn_core/issues/1', function(t) {

        var app = Ext.create('conjoon.cn_core.app.Application', {
                name     : 'test',
                mainView : 'Ext.Panel',
                controllers : [
                    'conjoon.test.app.mock.PackageControllerMock'
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
        stack   = [{resume : function(){resumed++;}}];
        t.expect(app.releaseLastRouteAction(stack)).toBe(true);
        t.expect(stack).toEqual([]);
        t.expect(resumed).toBe(1);

        // +---------------------------------------------
        // | interceptAction()
        // +---------------------------------------------
        // with array
        stopped = 0;
        app.routeActionStack = ['a'];
        app.interceptAction({stop : function(){stopped++;}});
        t.expect(app.routeActionStack).toEqual(['a', {stop : function(){stopped++;}}]);
        t.expect(stopped).toBe(1);
        // with null
        app.routeActionStack = null;
        stopped = 0;
        app.interceptAction({stop : function(){stopped++;}});
        t.expect(app.routeActionStack).toEqual([{stop : function(){stopped++;}}]);
        t.expect(stopped).toBe(1);

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


    });


});
