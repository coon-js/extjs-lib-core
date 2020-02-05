/**
 * coon.js
 * lib-cn_core
 * Copyright (C) 2020 Thorsten Suckow-Homberg https://github.com/coon-js/lib-cn_core
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

const harness = new Siesta.Harness.Browser.ExtJS();

let isModern = window.location.href.indexOf("toolkit=modern") !== -1;


harness.configure({
    title          : 'lib-cn_core - ' + (isModern ? "modern" : "classic"),
    disableCaching : true,
    loaderPath     : {

        'coon.core.overrides.core' : '../overrides',

        /**
         * ux
         */
        'Ext.ux' : "../../../../ext/packages/ux/src/",////bryntum.com/examples/extjs-6.0.1/build/ext-all.js"

        /**
         * fixtures
         */
        'coon.core.fixtures' : './fixtures',

        'Ext.Package' : '../../../remote/package-loader/src/Package.js',
        'Ext.package' : '../../../remote/package-loader/src/package',

        'coon.core' : '../src/',
        'coon.test' : './src'
    },
    preload : [
        coon.tests.config.paths.extjs[isModern ? "modern" : "classic" ].js.url
    ]
});

harness.start({
    group : 'overrides',
    items : [{
        group : 'app',
        items : [
            'overrides/app/PackageControllerTest.js'
        ]
    }]
}, {
    group : '.',
    items : [
        'src/UtilTest.js',
        'src/ConfigManagerTest.js'
    ]}, {
    group : 'app',
    items : [
        'src/app/PackageControllerTest.js',
        'src/app/ApplicationTest.js',
        'src/app/IsolatedTest_1.js',
        'src/app/IsolatedTest_2.js',
        'src/app/IsolatedTest_3.js',
        'src/app/IsolatedTest_4.js'
    ]
}, {
    group : 'data',
    items : [
        'src/data/AjaxFormTest.js',
        'src/data/BaseModelTest.js',
        'src/data/BaseTreeModelTest.js',
        'src/data/FormDataRequestTest.js',
        'src/data/SessionTest.js',

        {
            group : 'field',
            items : [
                'src/data/field/BlobTest.js',
                'src/data/field/CompoundKeyFieldTest.js',
                'src/data/field/EmailAddressTest.js',
                'src/data/field/EmailAddressCollectionTest.js',
                'src/data/field/FileSizeTest.js'
            ]
        },
        {
            group : 'operation',
            items : [
                'src/data/operation/UploadTest.js'
            ]
        },
        {
            group : 'pageMap',
            items : [
                'src/data/pageMap/ArgumentFilterTest.js',
                'src/data/pageMap/FeedTest.js',
                'src/data/pageMap/IndexLookupTest.js',
                'src/data/pageMap/IndexRangeTest.js',
                'src/data/pageMap/OperationTest.js',
                'src/data/pageMap/PageMapFeederTest.js',
                'src/data/pageMap/PageMapUtilTest.js',
                'src/data/pageMap/PageRangeTest.js',
                'src/data/pageMap/RecordPositionTest.js'
            ]
        },
        {
            group : 'proxy',
            items : [
                'src/data/proxy/RestFormTest.js'
            ]
        },
        {
            group : 'request',
            items : [
                'src/data/request/FormDataTest.js'
            ]
        }, {
            group : 'schema',
            items : [
                'src/data/schema/BaseSchemaTest.js'
            ]
        }, {
            group : 'session',
            items : [
                'src/data/session/SplitBatchVisitorTest.js'
            ]
        }, {
            group : 'validator',
            items : [
                'src/data/validator/EmailAddressCollectionTest.js',
                'src/data/validator/EmailAddressTest.js'
            ]
        }, {
            group : 'writer',
            items : [
                'src/data/writer/FormDataTest.js'
            ]
        }]
}, {
    group : 'util',
    items : [
        'src/util/DateTest.js',
        'src/util/MimeTest.js'
    ]});
