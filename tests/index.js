var harness = new Siesta.Harness.Browser.ExtJS();

harness.configure({
    title          : 'My Tests',
    disableCaching : true,
    loaderPath     : {

        'conjoon.cn_core.overrides.cn_core' : '../overrides',

        /**
         * ux
         */
        'Ext.ux' : "../../../../ext/packages/ux/src/",////bryntum.com/examples/extjs-6.0.1/build/ext-all.js"

        /**
         * fixtures
         */
        'conjoon.cn_core.fixtures' : './fixtures',

        'conjoon.cn_core' : '../src/',
        'conjoon.test'    : './src'
    },
    preload        : [
        conjoon.tests.config.paths.extjs.js.url
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
        'src/UtilTest.js'
    ]}, {
    group : 'app',
    items : [
        'src/app/PackageControllerTest.js',
        'src/app/ApplicationTest.js'
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
                'src/data/pageMap/IndexLookupTest.js',
                'src/data/pageMap/IndexRangeTest.js',
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
        'src/util/MimeTest.js'
    ]});
