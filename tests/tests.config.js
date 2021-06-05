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

/**
 * The following paths are the default paths available after "npm test" has run the scripts for the production
 * builds of extjs classic/modern.
 * Adjust to your needs if necessary.
 */
export default {
    loaderPath: {
        "Ext.Package": "../node_modules/@coon-js/extjs-package-loader/packages/package-loader/src/Package.js",
        "Ext.package": "../node_modules/@coon-js/extjs-package-loader/packages/package-loader/src/package",
        "coon.core.overrides.core": "../overrides",
        "coon.core.fixtures": "./fixtures",
        "coon.core": "../src/",
        "coon.test": "./src"
    },
    preload: {
        css: {
            extjs: {
                modern: [
                    "../node_modules/@sencha/ext-modern-runtime/material/material-all_1.css",
                    "../node_modules/@sencha/ext-modern-runtime/material/material-all_2.css"
                ],
                classic: [
                    "./build/extjs/classic/theme-triton/theme-triton-all-debug.css"
                ]
            }
        },
        js: ["../node_modules/@l8js/l8/dist/l8.runtime.umd.js", {
            extjs: {
                modern: "./build/extjs/modern/ext-modern-all-debug.js",
                classic: "./build/extjs/classic/ext-all-debug.js"
            }
        }]
    }
};
