#!/usr/bin/env node

/**
 * coon-js
 * extjs-lib-core
 * Copyright (C) 2023 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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


import fs from "fs-extra";
import l8 from "@l8js/l8";


function getValueFromPackageJson (dest, path) {
    const pkg = (fs.readJsonSync(dest));
    return l8.unchain(path, pkg);
}

function updatePackageJson (dest, obj) {
    let newPkg = fs.readJsonSync(dest);

    newPkg.sencha.version = obj.version;
    newPkg.sencha.compatVersion = obj.version;

    fs.outputFileSync(dest, `${JSON.stringify(newPkg, null, 4)}`);
}

const version = getValueFromPackageJson("package.json", "version");

// eslint-disable-next-line no-console
console.log(`Updating package.json with ${version}...`);

updatePackageJson("package.json", {version});

// eslint-disable-next-line no-undef
process.exit(0);