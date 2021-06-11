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

import testConfig from "./tests.config.js";
import groups from "./groups.config.js";
import {configureWithExtJsLinkPaths} from "../node_modules/@coon-js/siesta-lib-helper/dist/siesta-lib-helper.runtime.esm.js";

let toolkitGroups,
    toolkit = (new URLSearchParams( document.location.search.substring(1))).get("toolkit") ?? "classic";

const
    browser = new Siesta.Harness.Browser.ExtJS(),
    paths = await configureWithExtJsLinkPaths(testConfig, "../.extjs-link.conf.json", toolkit === "modern");

toolkitGroups = groups.filter(entry => ["universal", toolkit].indexOf(entry.group) !== -1);
toolkit       = toolkitGroups.length ? toolkit : "universal";

browser.configure(Object.assign({
    title: `${testConfig.name} [${toolkit}]`,
    isEcmaModule: true,
    disableCaching: true
}, paths));

browser.start(toolkitGroups.length ? toolkitGroups : groups);