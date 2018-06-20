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
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * An IndexRange represents a range between to records sitting in the same page
 * or across different pages. The two records are represented by RecordPositions
 * whereas the "start" of the range is guaranteed to be less or equal to the "end"
 * position.
 *
 *      @example
 *          // array indices are internally transformed to record positions
 *          Ext.create('conjoon.cn_core.data.pageMap.IndexRange', {
 *              start : [3, 1],
 *              end   : [4, 2]
 *          });
 *
 *           // is the same as:
 *           var indexRange = Ext.create('conjoon.cn_core.data.pageMap.IndexRange', {
 *               start : Ext.create('conjoon.cn_core.data.pageMap.RecordPosition({
 *                   page : 3, index : 2
 *               )),
 *               end : Ext.create('conjoon.cn_core.data.pageMap.RecordPosition({
 *                   page : 4, index : 2
 *               ))
 *           });
 *
 *           var start = indexRange.getStart(); // returns start as record position
 *           var end   = indexRange.getEnd(); // returns end as record position
 *
 *           start.lessThan(end); // returns true
 *           start.greaterThan(end); // returns false
 *
 */
Ext.define('conjoon.cn_core.data.pageMap.IndexRange', {

    requires : [
        'conjoon.cn_core.data.pageMap.RecordPosition'
    ],

    config : {
        start : undefined,
        end   : undefined
    },


    /**
     * Creates a new instance of conjoon.cn_core.data.pageMap.IndexRange.
     *
     * @param {Object} cfg
     * @param [Mixed} cfg.start A RecordPosition tat marks the start of the
     * range, or an array that will be passed to
     * conjoon.cn_core.data.pageMap.RecordPosition#create
     * @param [Mixed} cfg.end A RecordPosition tat marks the end of the
     * range, or an array that will be passed to
     * conjoon.cn_core.data.pageMap.RecordPosition#create
     *
     * @throws if start or end is not specified, or any exception that is
     * thrown by conjoon.cn_core.data.pageMap.RecordPosition#create, or if
     * start is not leass than or not equal to end
     */
    constructor : function(cfg) {

        var me = this;

        cfg = cfg || {};

        if (!cfg.hasOwnProperty('start')) {
            Ext.raise({
                msg : '\'start\' must be specified',
                cfg : cfg
            });
        }

        if (!cfg.hasOwnProperty('end')) {
            Ext.raise({
                msg : '\'end\' must be specified',
                cfg : cfg
            });
        }

        this.initConfig(cfg);

        if (!me.getStart().lessThan(me.getEnd()) &&
            !me.getStart().equalTo(me.getEnd())) {
            Ext.raise({
                msg   : '\'start\' must be less than or equal to \'end\'',
                start : cfg.start,
                end   : cfg.end
            })
        }
    },


    /**
     * Sets the start property of this IndexRange to the specified argument.
     *
     * @param {Mixed} start
     *
     * @returns {conjoon.cn_core.data.pageMap.RecordPosition}
     *
     * @throws if start was already set, or any other exception thrown
     * by conjoon.cn_core.data.pageMap.RecordPosition#create
     */
    applyStart : function(start) {

        var me = this;

        if (me.getStart() !== undefined) {
            Ext.raise({
                msg   : '\'start\' was already defined',
                start : me.getStart()
            })
        }

        if (start instanceof conjoon.cn_core.data.pageMap.RecordPosition) {
            return start;
        }

        return conjoon.cn_core.data.pageMap.RecordPosition.create(start);
    },


    /**
     * S
     * ets the end property of this IndexRange to the specified argument.
     *
     * @param {Mixed} end
     *
     * @returns {conjoon.cn_core.data.pageMap.RecordPosition}
     *
     * @throws if end was already set, or any other exception thrown
     * by conjoon.cn_core.data.pageMap.RecordPosition#create
     */
    applyEnd : function(end) {

        var me = this;

        if (me.getEnd() !== undefined) {
            Ext.raise({
                msg : '\'end\' was already defined',
                end : me.getEnd()
            })
        }

        if (end instanceof conjoon.cn_core.data.pageMap.RecordPosition) {
            return end;
        }

        return conjoon.cn_core.data.pageMap.RecordPosition.create(end);
    },


    /**
     * Returns true if the specified position lies somewhere within the index
     * page, including start/ end points, otherwise false. If targets is an array,
     * this method will return if any of the entries are contained in this range.
     *
     * @param {AMixed} {conjoon.cn_core.data.pageMap.RecordPosition} target
     *
     * @returns {Boolean}
     *
     * @throws if target or the entries within is/are not an instance of
     * conjoon.cn_core.data.pageMap.RecordPosition
     *
     */
    contains : function(target) {

        var me = this, start, end, targets = [].concat(target);

        for (var i = 0, len = targets.length; i < len; i++) {
            if (!(targets[i] instanceof conjoon.cn_core.data.pageMap.RecordPosition)) {
                Ext.raise({
                    msg     : '\'target\' must be an instance of conjoon.cn_core.data.pageMap.RecordPosition',
                    targets : targets
                })
            }
        }

        start = me.getStart();
        end   = me.getEnd();

        for (var i = 0, len = targets.length; i < len; i++) {
            if (start.equalTo(targets[i]) || end.equalTo(targets[i]) ||
                (targets[i].greaterThan(start) && targets[i].lessThan(end))) {
                return true;
            }
        }



        return false;
    }




});