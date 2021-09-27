/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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

StartTest((t) => {


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------

    t.it("Sanitize the writer", (t) => {
        var writer = Ext.create("coon.core.data.writer.FormData");

        t.expect(writer instanceof Ext.data.writer.Json).toBe(true);
        t.expect(writer.alias).toContain("writer.cn_core-datawriterformdata");
    });

    t.it("Test writeRecords()", (t) => {
        var jsonwr = Ext.create("Ext.data.writer.Json"),
            writer = Ext.create("coon.core.data.writer.FormData"),
            b1     = new Blob(["foo"], {type: "text/plain"}),
            b2     = new Blob(["bar"], {type: "text/plain"}),
            data   = [{
                fileName: "foo",
                blob: b1
            }, {
                fileName: "bar",
                blob: b2
            }],
            regularRequest  = Ext.create("Ext.data.Request"),
            formDataRequest = Ext.create("coon.core.data.FormDataRequest");

        regularRequest.setAction("update");
        formDataRequest.setAction("update");

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
            keyCompare = "data[0][fileName]";

        formData.set("data[0][fileName]", "snafu");

        formDataRequest = Ext.create("coon.core.data.FormDataRequest");
        formDataRequest.setAction("create");
        formDataRequest.setFormData(formData);
        t.expect(formDataRequest.getFormData().get(keyCompare)).toBe("snafu");

        retForm = writer.writeRecords(formDataRequest, data);

        t.expect(formDataRequest).toBe(retForm);
        t.expect(retForm.getFormData().get(keyCompare)).toBe("foo");


        // +++++
        // check that blobs are properly set
        formDataRequest = Ext.create("coon.core.data.FormDataRequest");
        formDataRequest.setAction("create");
        retForm = writer.writeRecords(formDataRequest, data);

        t.expect(retForm.getFormData()).toBeDefined();

        t.expect(retForm.getFormData().get("data[0][fileName]")).toBe("foo");
        t.expect(retForm.getFormData().get("data[1][fileName]")).toBe("bar");

        var readerB1 = new FileReader(),
            readerB2 = new FileReader(),
            readerB1Form = new FileReader(),
            readerB2Form = new FileReader();
        readerB1.readAsText(b1);
        readerB2.readAsText(b2);
        readerB1Form.readAsText(retForm.getFormData().get("file[0][0]"));
        readerB2Form.readAsText(retForm.getFormData().get("file[1][0]"));

        t.waitForMs(t.parent.TIMEOUT, () => {
            t.expect(readerB1.result).toBe(readerB1Form.result);
            t.expect(readerB2.result).toBe(readerB2Form.result);
        });
    });


});
