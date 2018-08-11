/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * lib-cn_core
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
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
 * Utility class for shared date utility functions
 */
Ext.define('conjoon.cn_core.util.Date', {


    singleton : true,

    /**
     * Returns a human readable date providing the written weekday and the time
     * for the last 6 days, starting with the current local time of the user.
     * If the date is to "Today", only the time will be returned.
     *
     * @param {String} date
     *
     * @return {String}
     */
    getHumanReadableDate : function(date) {

        const today = new Date();

        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);

        const daysBetween = Ext.Date.diff(today, date, Ext.Date.DAY);

        if (daysBetween === 0) {
            return Ext.util.Format.date(date, "H:i");
        }

        if (daysBetween >= -6 && daysBetween <= -1) {
            return Ext.util.Format.date(date, "l, H:i");
        }

        return Ext.util.Format.date(date, "d.m.Y, H:i");
    }

});
