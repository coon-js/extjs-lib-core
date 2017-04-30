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

/**
 * A package controller defines general behavior of packages which add
 * functionality to the user interface of a web application.
 * It provides information and configuration which gets requested by the
 * {@link conjoon.cn_core.app.Application} where the PackageController is
 * being used.
 *
 *
 * Routing
 * =======
 * Routes not configured as objects will automatically be adjusted to register
 * a "before"-callback, which defaults to #onBeforePackageRoute.
 * This is to make sure that the last requested action for this package is saved
 * and resumed by the {@link conjoon.cn_core.app.Application} as soon as possible.
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
Ext.define('conjoon.cn_core.app.PackageController', {

    extend : 'Ext.app.Controller',


    /**
     * Gets called before the {@link conjoon.cn_core.app.Application#launch}
     * method is being processed and the {@link conjoon.cn_core.app.Application#applicationView}
     * is being rendered.
     * A preLaunchHook can return false to prevent the rendering of the
     * {@link conjoon.cn_core.app.Application#applicationView}.
     *
     * @param {conjoon.cn_core.app.Application} app The application
     *
     * @return {boolean} false to prevent the {@link conjoon.cn_core.app.Application#applicationView}
     * from being rendered
     */
    preLaunchHook : Ext.emptyFn,


    /**
     * Returns an object providing further information the Congroller wants to
     * provide to the Application. This can be controls or any other package
     * information that can be used to set up the {@link conjoon.cn_core.app.Application}.
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
     * Overrides parent implementation to make sure the "before" callback for
     * a route is called when the route is requested.
     * It's purpose is to silently add the #onBeforePackageRoute callback
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

        return me.callParent([routes]);
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
         * {@link conjoon.cn_core.app.Application}, which will stop the action
         * from being processed. Otherwise, the action will be resumed.
         * Note:
         * It is assumed the the action is passed as the last argument to this
         * method, since routing might pass url parameters in the first arguments
         * to this method.
         *
         * @see {conjoon.cn_core.app.Application#shouldPackageRoute}
         * @see {conjoon.cn_core.app.Application#interceptAction}
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
