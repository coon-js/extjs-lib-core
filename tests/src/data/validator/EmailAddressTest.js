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

describe('conjoon.cn_core.data.validator.EmailAddressTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.it('Make sure class definition is as expected', function(t) {

        var vtor = Ext.create('conjoon.cn_core.data.validator.EmailAddress');

        // sanitize
        t.expect(vtor instanceof Ext.data.validator.Validator).toBe(true);
        t.expect(typeof(vtor.getMessage())).toBe('string');
        t.expect(vtor.alias).toContain('data.validator.cn_core-datavalidatoremailaddress');

        vtor = null;
    });

    t.it('Make sure the validator works as expected', function(t) {

        var tests = [{
            config   : {allowEmpty : true},
            data     : null,
            expected : true
        }, {
            config   : {allowEmpty : false},
            data     : null,
            expected : false
        }, {
            data     : null,
            expected : false
        }, {
            data     : {test : 'test'},
            expected : false
        }, {
            data     : {address : 'mymailaddress'},
            expected : true
        }];

        for (var i = 0, len = tests.length; i < len; i++) {
            var test   = tests[i],
                config = test.config ? test.config : undefined,
                vtor   = Ext.create(
                    'conjoon.cn_core.data.validator.EmailAddress',
                    config
                );

            if (test.expected === false) {
                t.expect(vtor.validate(test.data)).toContain('Must be');
            } else {
                t.expect(vtor.validate(test.data)).toBe(test.expected);
            }

            vtor = null;
        }

    });


});
