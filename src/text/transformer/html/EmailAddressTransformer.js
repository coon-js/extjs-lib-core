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

/**
 * Transformer for transforming plain text containing Email-Addresses
 * into text that wraps those Email-Addreses in "<a>"-tags along with the href-attribute's
 * value (i.e. the Email-Address itself) prefixed with "mailto:"
 *
 * @example
 *  let text = "Please contact info@conjoon.com for further information.";
 *
 *  let transformer = Ext.create("coon.core.text.transformer.html.EmailAddressTransformer");
 *
 *  transformer.transform(text);
 *
 *  // returns:
 *  // Please contact <a href="mailto:infi@conjoon.com">info@conjoon.com</a> for further information.
 *
 */
Ext.define("coon.core.text.transformer.html.EmailAddressTransformer", {


    /**
     * Invokes transforming the passed string.
     *
     * @param {String} value
     *
     * @return {String}
     */
    transform : function (text) {

        const emailRegex = /[a-zA-Z0-9+._%-]{1,256}@[a-zA-Z0-9][a-zA-Z0-9-]{0,64}(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,25})+/gi;

        text = text.replace(emailRegex, matches => ("<a href=\"mailto:" + matches + "\">" + matches + "</a>"));

        return text;

    }

});
