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
 * Base Exception class.
 *
 */
Ext.define("coon.core.exception.Exception", {

    alternateClassName: "coon.core.Exception",

    /**
     * @type {String} msg
     * @protected
     */

    /**
     * @type {coon.core.exception.Exception|Error|Object|String} cause
     * @protected
     */


    /**
     *
     * @returns {String}
     */
    getMessage () {
        return this.msg;
    },


    /**
     *
     * @return {coon.core.exception.Exception|Error|Object|String}
     */
    getCause () {
        return this.cause;
    },


    /**
     * Creates a new exception with the specified arguments.
     * cfg may be an object containing a msg or message property that represents the error message
     * for this exception, or a plain string.
     * The second arguments may be an exception or any other data type representing
     * the cause of the exception.
     *
     * @param {(String|{msg: string}|{message: string}|undefined)} cfg
     * @param {(coon.core.exception.Exception|Error|Object|String)} cause
     */
    constructor (cfg, cause = undefined) {
        this.msg = typeof cfg === "object" 
            ? cfg.msg || cfg.message
            : (typeof cfg === "string" ? cfg : undefined);

        this.cause = cause;

        Object.freeze(this);
    }


});
