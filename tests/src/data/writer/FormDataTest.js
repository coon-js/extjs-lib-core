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

describe('conjoon.cn_core.data.writer.FormDataTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.it('Sanitize the writer', function(t) {
        var writer = Ext.create('conjoon.cn_core.data.writer.FormData');

        t.expect(writer instanceof Ext.data.writer.Json).toBe(true);
        t.expect(writer.alias).toContain('writer.cn_core-datawriterformdata');
    });

    t.it('Test writeRecords()', function(t) {
        var jsonwr = Ext.create('Ext.data.writer.Json'),
            writer = Ext.create('conjoon.cn_core.data.writer.FormData'),
            b1     = new Blob(["foo"], {type : 'text/plain'}),
            b2     = new Blob(["bar"], {type : 'text/plain'}),
            data   = [{
                fileName : 'foo',
                blob     : b1
            }, {
                fileName : 'bar',
                blob     : b2
            }],
            regularRequest  = Ext.create('Ext.data.Request'),
            formDataRequest = Ext.create('conjoon.cn_core.data.FormDataRequest');

        regularRequest.setAction('update');
        formDataRequest.setAction('update');

        // +++++
        // different writers, different requests,same data, same action
        var retJson = jsonwr.writeRecords(regularRequest, data),
            retForm = writer.writeRecords(formDataRequest, data);
        t.expect(retJson).toBe(regularRequest);
        t.expect(retJson).toEqual(retForm);


        // +++++
        // different writers, same requests (non FormData), same data, same action
        retJson = jsonwr.writeRecords(regularRequest, data);
        retForm = writer.writeRecords(regularRequest, data);
        t.expect(retJson).toEqual(retForm);


        // +++++
        // existing keys get overwritten
        var formData   = new FormData,
            keyCompare = 'data[0][fileName]';

        formData.set('data[0][fileName]', 'snafu');

        formDataRequest = Ext.create('conjoon.cn_core.data.FormDataRequest');
        formDataRequest.setAction('create');
        formDataRequest.setFormData(formData);
        t.expect(formDataRequest.getFormData().get(keyCompare)).toBe('snafu');

        retForm = writer.writeRecords(formDataRequest, data);

        t.expect(formDataRequest).toBe(retForm);
        t.expect(retForm.getFormData().get(keyCompare)).toBe('foo');


        // +++++
        // check that blobs are properly set
        formDataRequest = Ext.create('conjoon.cn_core.data.FormDataRequest');
        formDataRequest.setAction('create');
        retForm = writer.writeRecords(formDataRequest, data);

        t.expect(retForm.getFormData()).toBeDefined();

        t.expect(retForm.getFormData().get('data[0][fileName]')).toBe("foo");
        t.expect(retForm.getFormData().get('data[1][fileName]')).toBe("bar");

        var readerB1 = new FileReader(),
            readerB2 = new FileReader(),
            readerB1Form = new FileReader(),
            readerB2Form = new FileReader();
        readerB1.readAsText(b1);
        readerB2.readAsText(b2);
        readerB1Form.readAsText(retForm.getFormData().get('file[0][0]'));
        readerB2Form.readAsText(retForm.getFormData().get('file[1][0]'));

        t.waitForMs(500, function() {
            t.expect(readerB1.result).toBe(readerB1Form.result);
            t.expect(readerB2.result).toBe(readerB2Form.result);
        });
    });



});
