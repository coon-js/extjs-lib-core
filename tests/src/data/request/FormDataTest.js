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

describe('conjoon.cn_core.data.request.FormDataTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.it('Make sure class definition is as expected', function(t) {
        var request = Ext.create('conjoon.cn_core.data.request.FormData', {});

        // sanitize
        t.expect(request instanceof Ext.data.request.Ajax).toBe(true);
        t.expect(request.alias).toContain('request.cn_core-datarequestformdata');
    });


    t.it('test openRequest() without FormData', function(t) {
        var request = Ext.create('conjoon.cn_core.data.request.FormData', {
                options : {
                    headers : {
                        'Content-Type' : 'foo'
                    }
                }
            });

        request.async = true;
        t.expect(request.options.headers).toEqual({
            'Content-Type' : 'foo'
        });

        var xhr = request.openRequest({}, {data : {'foo' : 'bar'}});
        t.expect(request.options.headers).toEqual({'Content-Type' : 'foo'});
        t.expect(xhr instanceof XMLHttpRequest).toBe(true);
        t.expect(xhr.upload.onprogress).toBeFalsy();
    });


    t.it('test openRequest() with FormData', function(t) {
        var request = Ext.create('conjoon.cn_core.data.request.FormData', {
                options : {
                    headers : {
                        'Content-Type' : 'foo'
                    }
                }
            }),
            onprogresscount = 0;

        request.async = true;

        request.onProgress = function() {
            onprogresscount++;
        }

        t.expect(request.options.headers).toEqual({
            'Content-Type' : 'foo'
        });

        var xhr = request.openRequest({}, {
            data : new FormData
        });

        t.expect(request.options.headers).toEqual({
            'Content-Type' : null
        });

        t.expect(xhr instanceof XMLHttpRequest).toBe(true);

        t.expect(onprogresscount).toBe(0);
        t.expect(xhr.upload.onprogress).toBeTruthy();
        xhr.upload.onprogress();
        t.expect(onprogresscount).toBe(1);
    });


    t.it('test onProgress() undefined', function(t) {
        var request = Ext.create('conjoon.cn_core.data.request.FormData', {
                options : {
                    progressCallback : undefined
                }
            });

        var exc = undefined;

        try {
            request.onProgress({'foo' : 'bar'});
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeUndefined();
    });

    t.it('test onProgress() defined', function(t) {
        var progressScope = {},
            request        = Ext.create('conjoon.cn_core.data.request.FormData', {
            options : {
                progressCallback : function(evt, options) {
                    this['foo'] = evt;
                    this['bar'] = options;
                },
                progressScope : progressScope
            }
        });

        var evt = {'rand' : 'om'};

        t.expect(progressScope).toEqual({});

        request.onProgress(evt);

        t.expect(progressScope.foo).toBe(evt);
        t.expect(progressScope.bar).toBe(request.options);

    });

});
