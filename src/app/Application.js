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
 * Implementation of Ext.app.Application for creating an application providing
 * advanced routing and launch hooks. For a reference implementation, see
 * https://github.com/conjoon.
 */
Ext.define('coon.core.app.Application', {

    extend: 'Ext.app.Application',

    requires : [
        'Ext.Package',
        'coon.core.app.PackageController'
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
                sourceClass              : 'coon.core.app.Application',
                'defaultConfig.mainView' : me.defaultConfig.mainView,
                msg                      : "coon.core.app.Application requires applicationViewClassName, not mainView to be set."
            });
        }

        if (!Ext.isString(me.applicationViewClassName)) {
            Ext.raise({
                sourceClass              : 'coon.core.app.Application',
                applicationViewClassName : me.applicationViewClassName,
                msg                      : "coon.core.app.Application requires applicationViewClassName as a string."
            });
        }

        if (!Ext.ClassManager.get(me.applicationViewClassName)) {
            Ext.raise({
                sourceClass               : 'coon.core.app.Application',
                applicationViewClass      : Ext.ClassManager.get(me.applicationViewClassName),
                msg                       : "coon.core.app.Application requires applicationViewClass to be loaded."
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
     * If an {@link coon.core.app.PackageController} is configured, it's
     * {@link coon.core.app.PackageController#preLaunchHook} method will
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
                sourceClass : 'coon.core.app.Application',
                mainView    : me.getMainView(),
                msg         : "coon.core.app.Application#preLaunchHookProcess cannot be run since mainView was already initialized."
            });
        }

        var ctrl = null,
            res  = false,
            controllers = this.controllers.getRange();

        for (var i = 0, len = controllers.length; i < len; i++) {

            ctrl = controllers[i];

            if ((ctrl instanceof coon.core.app.PackageController) &&
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
     * @param {coon.core.app.PackageController} packageController
     * @param {Object} action
     *
     * @return  {Boolean}
     *
     * @see {coon.core.app.PackageController#isActionRoutable}
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
    postLaunchHookProcess : Ext.emptyFn,


    /**
     * Overridden to make sure that all coon.js PackageControllers found in
     * Ext.manifest are loaded before the application is initiated.
     * Starts loading required packages by calling "handlePackage()" and
     * returns all found packageController that are required by this app.
     * Will also make sure that those controllers are added to THIS applications
     * #controllers-list.
     *
     * @return {Object}
     *
     * @see findCoonJsPackageControllers
     * @see handlePackageLoad
     */
    onProfilesReady : function() {

        const me          = this,
              pcs         = me.findCoonJsPackageControllers(Ext.manifest),
              packages    = Object.keys(pcs),
              controllers = Object.values(pcs);

        if (!me.controllers) {
            me.controllers = [];
        }

        packages.forEach(function(packageName) {
            me.controllers.push(pcs[packageName]);
        });

        me.handlePackageLoad(packages.pop(), packages);

        return pcs;
    },


    /**
     * Called by overridden implementation of onProfilesReady to load all packages
     * available in remainingPackages.
     * The method will call itself until all entries of remainingPackages have been
     * processed by Ex.Package#load. Once this is done, the original implementation
     * of Ext.app.Application.onProfilesReady will be called.
     *
     * @param {String} packageName
     * @param {Array} remainingPackages
     *
     * @private
     *
     */
    handlePackageLoad : function(packageName, remainingPackages) {

        const me = this;

        if (!packageName) {
            coon.core.app.Application.superclass.onProfilesReady.call(me);
            return;
        }

        Ext.Package
            .load(packageName)
            .then(me.handlePackageLoad.bind(me, remainingPackages.pop(), remainingPackages));
    },


    /**
     * Queries all available packages in Ext.manifest.packages and returns
     * an object containing all key/value pairs in the form of
     * [package-name] -> [packageNamespace].app.PackageController if, and only
     * if:
     *  - The packages was not yet loaded
     *  - The property "included" of the package is not equal to "true"
     *  - The package has a property named "coon-js" which is an object and
     *    has the property "packageController" set to true
     *
     * @param {Object} manifest an object providing manifest information (Ext.manifest)
     *
     * @return {Object}
     *
     * @private
     */
    findCoonJsPackageControllers : function(manifest) {

        const me          = this,
              controllers = {},
              mp          = manifest && manifest.packages ? manifest.packages : {},
              keys        = Object.keys(mp);

        keys.forEach(function(key) {

            let entry = mp[key], ns, fqn;

            if (entry.included !== true &&
                !Ext.Package.isLoaded(key) &&
                entry['coon-js'] &&
                entry['coon-js']['packageController'] === true
                ) {
                ns  = entry.namespace;
                fqn = ns + '.app.PackageController';

                controllers[key] = fqn;
            }
        });


        return controllers;
    }

});
