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
 *
 */
Ext.define('conjoon.cn_core.app.Application', {

    extend: 'Ext.app.Application',

    requires : [
        'conjoon.cn_core.app.PackageController'
    ],

    /**
     * Stack for routes which were added using the method #addRouteActionToStackAndStop
     * @type {Array} routeActionStack
     * @private
     */
    routeActionStack : null,

    /**
     * @type {String} applicationViewClassName (required)
     * The fqn of the class representing the view which will be used as
     * the {@link #mainView}.
     * The representing classes should have been loaded before this class
     * gets instantiated, to prevent synchronous requests to this class.
     * This value will be set in the constructor to the value of {@link #mainView},
     * which is a required property.
     */
    applicationViewClassName : null,

    /**
     * @inheritdocs
     *
     * @throws Exception if any of the required class configs are not available,
     * or if  {@link #mainView} were not loaded already.
     */
    constructor : function(config) {

        var me = this;

        config = config || {};

        if (config.mainView) {
            me.applicationViewClassName = config.mainView;
            delete config.mainView;
        }

        if (me.defaultConfig.mainView) {
            Ext.raise({
                sourceClass              : 'conjoon.cn_core.app.Application',
                'defaultConfig.mainView' : me.defaultConfig.mainView,
                msg                      : "conjoon.cn_core.app.Application requires applicationViewClassName, not mainView to be set."
            });
        }

        if (!Ext.isString(me.applicationViewClassName)) {
            Ext.raise({
                sourceClass              : 'conjoon.cn_core.app.Application',
                applicationViewClassName : me.applicationViewClassName,
                msg                      : "conjoon.cn_core.app.Application requires applicationViewClassName as a string."
            });
        }

        if (!Ext.ClassManager.get(me.applicationViewClassName)) {
            Ext.raise({
                sourceClass               : 'conjoon.cn_core.app.Application',
                applicationViewClass      : Ext.ClassManager.get(me.applicationViewClassName),
                msg                       : "conjoon.cn_core.app.Application requires applicationViewClass to be loaded."
            });
        }

        me.callParent([config]);
    },

    /**
     * The preLaunchHookProcess is a hook for the launch process which gets called
     * before the {@link #mainView} gets rendered.
     * When this method returns false, the applications's mainView does not
     * get rendered.
     * This method gives controllers the chance to change the applications's behavior
     * and hook into the process of setting up the application.
     * This is called before the {@link #launch} method initializes this Application's
     * {@link #mainView}.
     * This method will iterate over the controllers configured for this application.
     * If an {@link conjoon.cn_core.app.PackageController} is configured, it's
     * {@link conjoon.cn_core.app.PackageController#preLaunchHook} method will
     * be called.
     *
     * @returns {boolean} false if the {@link #mainView} should not be
     * rendered, otherwise true
     *
     * @protected
     *
     * @throws if {@link #mainView} was already initialized
     */
    preLaunchHookProcess : function() {

        var me = this;

        if (me.getMainView()) {
            Ext.raise({
                sourceClass : 'conjoon.cn_core.app.Application',
                mainView    : me.getMainView(),
                msg         : "conjoon.cn_core.app.Application#preLaunchHookProcess cannot be run since mainView was already initialized."
            });
        }

        var ctrl = null,
            res  = false,
            controllers = this.controllers.getRange();

        for (var i = 0, len = controllers.length; i < len; i++) {

            ctrl = controllers[i];

            if ((ctrl instanceof conjoon.cn_core.app.PackageController) &&
                Ext.isFunction(ctrl.preLaunchHook)) {
                res = ctrl.preLaunchHook(this);

                if (res === false) {
                    return false;
                }
            }
        }

        return true;
    },

    /**
     * @inheritdoc
     *
     * This method needs the {@link #mainView} to be configured as a string (the class
     * name of the view to use as the applications main view) when this Application's
     * instance gets configured.
     * Before the mainView gets initialized, the {@link #preLaunchHookProcess}
     * will be called. If this method returns anything but false, the mainView will
     * be rendered. Additionally, the {@link #postLaunchHookProcess} will be called.
     *
     */
    launch : function() {
        var me = this;

        if (me.preLaunchHookProcess() !== false) {
            me.setMainView(me.applicationViewClassName);
            me.postLaunchHookProcess();
            me.releaseLastRouteAction(me.routeActionStack);
        }
    },


    /**
     * Checks whether there is any action intercepted and available on
     * the passed routeActionStack.
     * The last available action added to the stack will be popped and resumed,
     * and the routeActionStack will be reset to an empty array.
     *
     * @return {Boolean} true if there was an action that was resumed, otherwise
     * false if there was no action to process
     *
     * @private
     */
    releaseLastRouteAction : function(routeActionStack) {

        if (!routeActionStack || !routeActionStack.length) {
            return false;
        }

        routeActionStack.pop().resume();
        routeActionStack = [];
        return true;
    },

    /**
     * Adds the specified action to the #routeActionStack and calls "stop()" on it,
     * preventing it from being processed further..
     *
     * @param action
     */
    interceptAction : function(action) {
        var me = this;

        if (!me.routeActionStack) {
            me.routeActionStack = [];
        }

        me.routeActionStack.push(action);
        action.stop();
    },


    /**
     * Returns true if the specified packageController can safely route
     * the action, otherwise false.
     *
     * @param {conjoon.cn_core.app.PackageController} packageController
     * @param {Object} action
     *
     * @return  {Boolean}
     *
     * @see {conjoon.cn_core.app.PackageController#isActionRoutable}
     */
    shouldPackageRoute : function(packageController, action) {
        return packageController.isActionRoutable(action);
    },


    /**
     * Hook for the launch-process, after the {@link #mainView} was initialized.
     * This method can be used for additional setup and configuration of the
     * application.
     *
     * @protected
     * @method
     * @template
     */
    postLaunchHookProcess : Ext.emptyFn


});
