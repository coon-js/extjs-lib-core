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
 * An IndexRange represents a range between to records sitting in the same page
 * or across different pages. The two records are represented by RecordPositions
 * whereas the "start" of the range is guaranteed to be less or equal to the "end"
 * position.
 *
 *      @example
 *          // array indices are internally transformed to record positions
 *          Ext.create('coon.core.data.pageMap.IndexRange', {
 *              start : [3, 1],
 *              end   : [4, 2]
 *          });
 *
 *           // is the same as:
 *           var indexRange = Ext.create('coon.core.data.pageMap.IndexRange', {
 *               start : Ext.create('coon.core.data.pageMap.RecordPosition({
 *                   page : 3, index : 2
 *               )),
 *               end : Ext.create('coon.core.data.pageMap.RecordPosition({
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
Ext.define('coon.core.data.pageMap.IndexRange', {

    requires : [
        'coon.core.data.pageMap.RecordPosition'
    ],

    config : {
        start : undefined,
        end   : undefined
    },


    /**
     * Creates a new instance of coon.core.data.pageMap.IndexRange.
     *
     * @param {Object} cfg
     * @param [Mixed} cfg.start A RecordPosition tat marks the start of the
     * range, or an array that will be passed to
     * coon.core.data.pageMap.RecordPosition#create
     * @param [Mixed} cfg.end A RecordPosition tat marks the end of the
     * range, or an array that will be passed to
     * coon.core.data.pageMap.RecordPosition#create
     *
     * @throws if start or end is not specified, or any exception that is
     * thrown by coon.core.data.pageMap.RecordPosition#create, or if
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
     * @returns {coon.core.data.pageMap.RecordPosition}
     *
     * @throws if start was already set, or any other exception thrown
     * by coon.core.data.pageMap.RecordPosition#create
     */
    applyStart : function(start) {

        var me = this;

        if (me.getStart() !== undefined) {
            Ext.raise({
                msg   : '\'start\' was already defined',
                start : me.getStart()
            })
        }

        if (start instanceof coon.core.data.pageMap.RecordPosition) {
            return start;
        }

        return coon.core.data.pageMap.RecordPosition.create(start);
    },


    /**
     * S
     * ets the end property of this IndexRange to the specified argument.
     *
     * @param {Mixed} end
     *
     * @returns {coon.core.data.pageMap.RecordPosition}
     *
     * @throws if end was already set, or any other exception thrown
     * by coon.core.data.pageMap.RecordPosition#create
     */
    applyEnd : function(end) {

        var me = this;

        if (me.getEnd() !== undefined) {
            Ext.raise({
                msg : '\'end\' was already defined',
                end : me.getEnd()
            })
        }

        if (end instanceof coon.core.data.pageMap.RecordPosition) {
            return end;
        }

        return coon.core.data.pageMap.RecordPosition.create(end);
    },


    /**
     * Returns true if the specified position lies somewhere within the index
     * page, including start/ end points, otherwise false. If targets is an array,
     * this method will return if any of the entries are contained in this range.
     *
     * @param {AMixed} {coon.core.data.pageMap.RecordPosition} target
     *
     * @returns {Boolean}
     *
     * @throws if target or the entries within is/are not an instance of
     * coon.core.data.pageMap.RecordPosition
     *
     */
    contains : function(target) {

        var me = this, start, end, targets = [].concat(target);

        for (var i = 0, len = targets.length; i < len; i++) {
            if (!(targets[i] instanceof coon.core.data.pageMap.RecordPosition)) {
                Ext.raise({
                    msg     : '\'target\' must be an instance of coon.core.data.pageMap.RecordPosition',
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