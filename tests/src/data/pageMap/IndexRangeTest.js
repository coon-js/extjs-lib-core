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

describe('conjoon.cn_core.data.pageMap.IndexRangeTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('conjoon.cn_core.data.pageMap.RecordPosition', function() {


        t.it('constructor()', function(t) {

            var exc, e,
                RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition;

            try {Ext.create('conjoon.cn_core.data.pageMap.IndexRange');} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be specified');
            exc = undefined;

            try {Ext.create('conjoon.cn_core.data.pageMap.IndexRange',
                {start : ''});} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be specified');
            exc = undefined;

            try {Ext.create('conjoon.cn_core.data.pageMap.IndexRange',
                {end : 'end'});} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be specified');
            exc = undefined;

            try {Ext.create('conjoon.cn_core.data.pageMap.IndexRange',
                {start : 'foo', end : 'bar'});} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            exc = undefined;

            try {Ext.create('conjoon.cn_core.data.pageMap.IndexRange',
                {start : [2, 1], end : [1, 2]});} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('less than or equal');
            exc = undefined;

            t.expect(
                Ext.create('conjoon.cn_core.data.pageMap.IndexRange', {start:[1, 1], end : [1, 1]})
                instanceof conjoon.cn_core.data.pageMap.IndexRange
            ).toBe(true);

            t.expect(
                Ext.create('conjoon.cn_core.data.pageMap.IndexRange', {start:[1, 1], end : [1, 2]})
                    instanceof conjoon.cn_core.data.pageMap.IndexRange
            ).toBe(true);

            t.expect(
                Ext.create('conjoon.cn_core.data.pageMap.IndexRange', {start:RecordPosition.create(1, 1), end : [1, 1]})
                    instanceof conjoon.cn_core.data.pageMap.IndexRange
            ).toBe(true);

            t.expect(
                Ext.create('conjoon.cn_core.data.pageMap.IndexRange', {
                    start:RecordPosition.create(1, 1), end : RecordPosition.create(1, 2)})
                    instanceof conjoon.cn_core.data.pageMap.IndexRange
            ).toBe(true);



        });


        t.it('set*() / get*()', function(t) {

            var exc, e, range;

            range = Ext.create('conjoon.cn_core.data.pageMap.IndexRange', {
                start : [1, 9],
                end   : [2, 2]
            });

            try {range.setStart([4, 5]);} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('was already defined');
            exc = undefined;

            try {range.setEnd([4, 5]);} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('was already defined');

            t.expect(range.getStart() instanceof conjoon.cn_core.data.pageMap.RecordPosition).toBe(true);
            t.expect(range.getStart().getPage()).toBe(1);
            t.expect(range.getStart().getIndex()).toBe(9);

            t.expect(range.getEnd() instanceof conjoon.cn_core.data.pageMap.RecordPosition).toBe(true);
            t.expect(range.getEnd().getPage()).toBe(2);
            t.expect(range.getEnd().getIndex()).toBe(2);


        });


        t.it('contains()', function(t) {

            var exc, e, range, test,
                RecordPosition = conjoon.cn_core.data.pageMap.RecordPosition,
                tests = [{
                    start  : [2, 4],
                    end    : [5, 6],
                    target : [2, 4],
                    exp    : true
                }, {
                    start  : [2, 4],
                    end    : [5, 6],
                    target : [5, 6],
                    exp    : true
                }, {
                    start  : [2, 4],
                    end    : [5, 6],
                    target : [3, 0],
                    exp    : true
                }, {
                    start  : [2, 4],
                    end    : [5, 6],
                    target : [12, 4],
                    exp    : false
                }, {
                    start  : [2, 4],
                    end    : [5, 6],
                    target : [5, 8],
                    exp    : false
                }, {
                    multi  : true,
                    start  : [2, 4],
                    end    : [5, 6],
                    target : [
                        RecordPosition.create(5, 8),
                        RecordPosition.create(1, 1)
                    ],
                    exp : false
                }, {
                    multi  : true,
                    start  : [2, 4],
                    end    : [5, 6],
                    target : [
                        RecordPosition.create(5, 8),
                        RecordPosition.create(1, 1),
                        RecordPosition.create(3, 12)
                    ],
                    exp : true
                }];

            range = Ext.create('conjoon.cn_core.data.pageMap.IndexRange', {
                start : [1, 9],
                end   : [2, 2]
            });

            try {range.contains([4, 5]);} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('an instance of');
            exc = undefined;

            try {range.contains([RecordPosition.create(4, 5), 5]);} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('an instance of');
            exc = undefined;

            for (var i = 0, len = tests.length; i < len; i++) {
                test = tests[i];

                range = Ext.create('conjoon.cn_core.data.pageMap.IndexRange', {
                    start : test.start,
                    end   : test.end
                });

                if (test.multi) {
                    t.expect(
                        range.contains(test.target)
                    ).toBe(test.exp);
                } else {
                    t.expect(
                        range.contains(RecordPosition.create(test.target))
                    ).toBe(test.exp);
                }


            }


        });


})});
