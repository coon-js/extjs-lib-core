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
 * A package controller defines general behavior of packages which add
 * functionality to the user interface of a web application.
 * It provides information and configuration which gets requested by the
 * {@link coon.core.app.Application} where the PackageController is
 * being used.
 *
 *
 * Routing
 * =======
 * Routes not configured as objects will automatically be adjusted to register
 * a "before"-callback, which defaults to #onBeforePackageRoute.
 * This is to make sure that the last requested action for this package is saved
 * and resumed by the {@link coon.core.app.Application} as soon as possible.
 * This is mainly for implementations where controller's #preLaunchHook returns
 * false and prevent the MainView to be initialized until a specific condition
 * is set (e.g. user sign in etc.)
 *
 *      @example
 *      routes : {
 *          'actionUrl' : 'onRouteAction'
 *      }
 *      //becomes
 *      routes : {
 *          'actionUrl' : {
 *              action : 'onRouteAction',
 *              before : 'onBeforePackageRoute'
 *          }
 *      }

 *
 */
Ext.define('coon.core.app.PackageController', {

    extend : 'Ext.app.Controller',


    /**
     * Gets called before the {@link coon.core.app.Application#launch}
     * method is being processed and the {@link coon.core.app.Application#applicationView}
     * is being rendered.
     * A preLaunchHook can return false to prevent the rendering of the
     * {@link coon.core.app.Application#applicationView}.
     *
     * @param {coon.core.app.Application} app The application
     *
     * @return {boolean} false to prevent the {@link coon.core.app.Application#applicationView}
     * from being rendered
     */
    preLaunchHook : Ext.emptyFn,


    /**
     * Returns an object providing further information the Congroller wants to
     * provide to the Application. This can be controls or any other package
     * information that can be used to set up the {@link coon.core.app.Application}.
     * If this method returns undefined, the API is advised to ignore the call
     * to this method and not process the "undefined" return value.
     *
     * @return {Object/undefined}
     */
    postLaunchHook : Ext.emptyFn,


    /**
     * Returns true if the specified action is routable, otherwise false.
     * The default implementation checks if the main view is available and
     * returns either true or false based on this. If this controller is not used
     * in an application context, an exception is thrown.
     *
     * @param {Object} action
     *
     * @returns {Boolean} true if this controller can safely route the action
     * expecting no errors during the process.
     *
     * @throws if the controller is not being used in an application context
     * and #getApplication is falsy
     */
    isActionRoutable : function() {
        var me = this;

        return me.isMainViewAvailable();
    },


    /**
     * Makes sure the "before" callback for a route is called when the route
     * is requested by silently adding the #onBeforePackageRoute callback
     * to make sure a requested route is processed as soon as the MainView is
     * available. The before-callback is not added if the configured route is
     * already an object.
     *
     * @param {Object} routes
     *
     * @returns {*}
     *
     * @see onBeforePackageRoute
     */
    updateRoutes : function(routes) {

        var me     = this,
            url;

        for (url in routes) {
            if (!Ext.isObject(routes[url])) {
                routes[url] = {
                    action : routes[url],
                    before : 'onBeforePackageRoute'
                };
            }
        }

    },


    /**
     * Returns true if the MainView (i.e. the viewport) of the Application is
     * available, otherwise false.
     * This method should be used by any configured route-listener of the
     * implementing PackageControllers to check whether it's safe to append
     * a controller's main view to the MainView of the application.
     * This method only returns boolean if this controller is used in an application,
     * otherwise an exception is thrown.
     *
     * @returns {boolean}
     *
     * @throws if the controller is not being used in an application context
     * and #getApplication is falsy
     */
    isMainViewAvailable : function() {
        var me = this;

        if (!me.getApplication()) {
            Ext.raise({
                source      : Ext.getClassName(me),
                application : me.getApplication(),
                msg         : Ext.getClassName(me) + " is apparently not used in an application"
            });
        }

        return !!me.getApplication().getMainView();
    },


    privates : {

        /**
         * Callback for the before-action of a route. Checks whether the Application
         * can process a route. If that is not the case, the action
         * passed to this will be handed off to the method
         * {@link coon.core.app.Application}, which will stop the action
         * from being processed. Otherwise, the action will be resumed.
         * Note:
         * It is assumed the the action is passed as the last argument to this
         * method, since routing might pass url parameters in the first arguments
         * to this method.
         *
         * @see {coon.core.app.Application#shouldPackageRoute}
         * @see {coon.core.app.Application#interceptAction}
         *
         *
         * @throws if the controller is not being used in an application context
         * and #getApplication is falsy
         */
        onBeforePackageRoute : function() {

            var me     = this,
                action = arguments[arguments.length - 1],
                app    = me.getApplication();

            if (!me.getApplication()) {
                Ext.raise({
                    source      : Ext.getClassName(me),
                    application : me.getApplication(),
                    msg         : Ext.getClassName(me) + " is apparently not used in an application"
                });
            }

            if (app.shouldPackageRoute(me, action) === false) {
                app.interceptAction(action);
                return;
            }

            action.resume();
        }

    }


});
