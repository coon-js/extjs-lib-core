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
 * Fix for https://www.sencha.com/forum/showthread.php?339006-Sencha-6-2-GPL-Commercial-auto-generated-id-of-App-Controller-is-NOT-FQN-of-class&p=1178063#post1178063
 */
Ext.define('conjoon.cn_core.overrides.cn_core.app.PackageController', {

    override : 'conjoon.cn_core.app.PackageController',

    applyId : function(id) {
        return id ||
               Ext.app.Controller.getFullName(
                   this.$className, 'controller', this.$namespace
               ).absoluteName;
    }


});