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
 * Plugins
 * =======
 * PackageController can have plugins that usually get called during the preLaunchHook by the owning
 * application. Plugins must be of the type {coon.core.app.plugin.ControllerPlugin}.
 *
 */
Ext.define("coon.core.app.PackageController", {

    extend: "Ext.app.Controller",

    requires: [
        "coon.core.app.plugin.ControllerPlugin"
    ],

    /**
     * @private
     * @type {Array=coon.core.app.plugin.ControllerPlugin}
     */
    plugins: null,


    /**
     * @constructor
     * @param cfg
     */
    constructor: function (cfg) {

        const me = this;
        me.callParent(arguments);

        me.plugins = [];
    },


    /**
     * A template method that can be used to configure views from withing the
     * PackageController.
     * Parameters to this methods are arbitrary. The following list of
     * arguments are suggested. A default implementation can be found in
     * the extjs-comp-navport-package.
     *
     * @param {Ext.Component} view The view to configure
     * @param {Boolean} created true if the view was just created, otherwise false,
     * e.g. when the view is about to be activated in its parent container
     * @param {String} route The route that triggered this method, if any
     *
     * @return {Ext.Component} view The view that was configured, or any other
     * {Ext.Component}
     */
    configureView: Ext.emptyFn,


    /**
     * Adds the plugin to stack of plugins for execution.
     * Owning applications usually call the plugins during the preLaunchHook.
     * They cannot be vetoed.
     * This method checks whether a plugin with the same id is already configured
     * for this controller and does not add it another time if that is the case.
     *
     * @param {coon.core.app.plugin.ControllerPlugin} plugin
     *
     * @return this
     *
     * @throws if the submitted argument is not an instance of {coon.core.app.plugin.ControllerPlugin}
     */
    addPlugin: function (plugin) {

        if (!(plugin instanceof coon.core.app.plugin.ControllerPlugin)) {
            Ext.raise("plugin must be an instance of coon.core.app.plugin.ControllerPlugin");
        }

        const me = this;

        let found = me.plugins.some( (plug) => {
            if (plug === plugin || plug.getId() === plugin.getId()) {
                return true;
            }
        });

        if (!found) {
            me.plugins.push(plugin);
        }

        return me;
    },


    /**
     * Visits all plugins and call their run() method.
     *
     * @param {coon.core.app.Application} app
     *
     * @protected
     *
     * @throws if any error occured during execution of the PluginController's run method
     */
    visitPlugins: function (app) {

        const me = this;

        if (!me.plugins) {
            return;
        }

        me.plugins.forEach(function (plugin) {
            try {
                plugin.run(me);
            } catch (e) {
                Ext.raise({
                    msg: "Executing the PluginController failed.",
                    reason: e
                });
            }

        });

    },


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
    preLaunchHook: Ext.emptyFn,


    /**
     * Returns an object providing further information the Congroller wants to
     * provide to the Application. This can be controls or any other package
     * information that can be used to set up the {@link coon.core.app.Application}.
     * If this method returns undefined, the API is advised to ignore the call
     * to this method and not process the "undefined" return value.
     *
     * @return {Object/undefined}
     */
    postLaunchHook: Ext.emptyFn,


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
    isActionRoutable: function () {
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
    updateRoutes: function (routes) {

        var url;

        for (url in routes) {
            if (!Ext.isObject(routes[url])) {
                routes[url] = {
                    action: routes[url],
                    before: "onBeforePackageRoute"
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
    isMainViewAvailable: function () {
        var me = this;

        if (!me.getApplication()) {
            Ext.raise({
                source: Ext.getClassName(me),
                application: me.getApplication(),
                msg: Ext.getClassName(me) + " is apparently not used in an application"
            });
        }

        return !!me.getApplication().getMainView();
    },


    privates: {

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
        onBeforePackageRoute: function () {

            var me     = this,
                action = arguments[arguments.length - 1],
                app    = me.getApplication();

            if (!me.getApplication()) {
                Ext.raise({
                    source: Ext.getClassName(me),
                    application: me.getApplication(),
                    msg: Ext.getClassName(me) + " is apparently not used in an application"
                });
            }

            if (app.shouldPackageRoute(me, action) === false) {
                return app.interceptAction(action);
            }

            action.resume();
        }

    }


});
