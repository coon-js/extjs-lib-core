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
