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


});
