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

/**
 * A package controller defines general behavior of packages which add
 * functionality to the user interface of a web application.
 * It provides information and configuration which gets requested by the
 * {@link conjoon.cn_core.app.Application} where the PackageController is
 * being used.
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
    postLaunchHook : Ext.emptyFn

});
