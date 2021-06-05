/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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
 * Lightweight Loader for files using XmlHttpRequest api.
 *
 * @example
 *    // existing json-file at [resource_path]/app-cn_mail.conf.json
 *
 *    const fileLoader = Ext.create("coon.core.app.data.request.file.XmlHttpRequestFileLoader", "./conf/app-cn_mail.json");
 *    const res = await fileLoader.load();
 *    console.log(res); // plain text contents of the file on success
 *
 */
Ext.define("coon.core.data.request.file.XmlHttpRequestFileLoader", {


    extend: "coon.core.data.request.file.FileLoader",

    requires: [
        "coon.core.data.request.HttpRequestException",
        "coon.core.exception.IllegalArgumentException"
    ],


    /**
     * Initiates loading the file specified with the given url and returns a
     * Promise or a mixed value representing the file contents if used with async/await.
     *
     * @example
     * // thenable
     * loader.load("app-cn_mail.conf.json").then(
     *      (conf) => {console.log(conf);}, // console.logs the plain text from the loaded file
     *      (exc) => {console.log(exc);} // console logs the exception, if any occured,
     *                                   // which is a coon.core.data.request.HttpRequestException
     * );
     * // or
     * let txt;
     * try {
     *    txt = await loader.load("app-cn_mail.conf.json");
     * } catch (e) {
     *    // exception handling for  coon.core.data.request.HttpRequestException
     * }
     * console.log(txt); // file contents
     *
     *
     * @param {String} url The location to read the file from
     *
     * @return {Mixed|Promise}
     *
     * @throws {coon.core.data.request.HttpRequestException} if any exception occured,
     * or {coon.core.exception.IllegalArgumentException} if url was not a string
     */
    async load (url) {

        if (typeof url !== "string") {
            throw new coon.core.exception.IllegalArgumentException("FileLoader needs an url");
        }

        let ret = await new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open("GET", url);

            request.onload = (progressEvent) => {
                const httpRequest = progressEvent.target;

                if (httpRequest.status === 200) {
                    resolve(httpRequest.responseText);
                } else {
                    reject(new coon.core.data.request.HttpRequestException(
                        httpRequest.status + " " + httpRequest.statusText
                    ));
                }
            };

            request.onerror = (progressEvent) => {
                const httpRequest = progressEvent.target;
                reject(new coon.core.data.request.HttpRequestException(
                    `An unexpected error occured while trying to load from ${httpRequest.responseURL}`
                ));
            };

            request.send();
        });

        return ret;
    }


});

