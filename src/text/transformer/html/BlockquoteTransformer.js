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
 * Transformer for transforming plain-quoted text (quote marks: ">")
 * to a text containing blockquotes.
 *
 * @example
 *  let text = [
 *      "> This is",
 *      "> some quoted",
 *      ">> Text that does 1",
 *      ">> Text that does 2",
 *      ">hm good",
 *      "stff that",
 *      "usually likes",
 *      ">> to be parsed",
 *      ">>YO!",
 *  ].join("\n");
 *
 *  let transformer = Ext.create("coon.core.text.transformer.BlockquoteTransformer");
 *
 *  transformer.transform(text);
 *
 *  // returns:
 *  // <blockquote>
 *  //   This is
 *  //   some quoted
 *  //   <blockquote>
 *  //      Text that does 1
 *  //      Text that does 2
 *  //   </blockquote>
 *  //   hm good
 *  // </blockquote>
 *  // stff that
 *  // usually likes
 *  // <blockquote>
 *  //  <blockquote>
 *  //   to be parsed
 *  //   YO!
 *  //  </blockquote>
 *  // </blockquote>
 *
 */
Ext.define('coon.core.text.transformer.html.BlockquoteTransformer', {


    /**
     * Invokes transforming the passed string.
     *
     * @param {String} value
     *
     * @return {String}
     */
    transform : function(value) {

        const me = this;

        let groups = me.group(value),
            texts = [];

        groups.forEach(function (group) {
            texts.push(me.quote(group));
        });

        return texts.join("");

    },


    privates : {

        /**
         * Takes care of grouping the text into blocks of
         * quoted / unquoted parts. Takes care of sanitizing the quote marks, too.
         *
         * @example
         *    let text = [
         *      " > This is",
         *      "> some quoted",
         *      "  > > Text that does 1",
         *      ">    > Text that does 2",
         *      ">hm good",
         *      "stuff that",
         *      "usually likes",
         *      ">> to be parsed",
         *      ">>YO!",
         *    ].join("\n");
         *
         *  transformer.group(text);
         *  // [
         *  //   ["> This is", "> some quoted", ">> Text that does 1", ">> Text that does 2", ">hm good"],
         *  //   ["stuff that", "usually likes"],
         *  //   [">> to be parsed", ">>YO!"]
         *  // ]
         *
         * @param {String} text
         *
         * @returns {Array}
         *
         * @private
         */
        group : function (text) {

            const me = this;

            let lines = text.split("\n"),
                toQuote = [],
                groups = -1,
                prev = null;

            lines.forEach(function (line) {

                line = me.sanitizeLine(line);

                if (prev !== line.indexOf(">")) {
                    groups++;
                }

                prev = line.indexOf(">")

                if (!toQuote[groups]) {
                    toQuote[groups] = [];
                }
                toQuote[groups].push(line);

            });


            return toQuote;
        },


        /**
         * Takes care of proper quoting the passed group.
         *
         * @param {Array} group
         *
         * @returns {string}
         *
         * @private
         */
        quote : function (group) {

            if (group[0].indexOf(">") !== 0) {
                return group.join("\n");
            }

            const pop = function (quoted) {
                if (quoted[quoted.length - 1] === "\n") {
                    quoted.pop();
                }
            };

            let currentIntend = 0,
                intendation,
                quoted = [],
                match;

            group.forEach(function (line) {

                match = Ext.String.trim(line).match(/^((>)+) *?(.*?$)/ms);

                intendation = match[1].length;

                while (intendation > currentIntend) {
                    pop(quoted);
                    currentIntend++;
                    quoted.push("<blockquote>");
                }

                while (currentIntend > intendation) {
                    pop(quoted);
                    currentIntend--;
                    quoted.push("</blockquote>");
                }

                quoted.push(match[3]);
                quoted.push("\n");

            });

            while (currentIntend > 0) {
                pop(quoted);
                currentIntend--;
                quoted.push("</blockquote>");
            }

            return quoted.join("");

        },


        /**
         * Sanitizes a single line by grouping quote marks properly.
         *
         * * @example
         *    let line = "  > >    Text that does 1"";
         *
         *  line = transformer.sanitizeLine(line);
         *  // ">> Text that does 1"
         *
         * @param {String} line
         *
         * @reurn {String}
         *
         * @private
         */
        sanitizeLine : function (line) {

            let regex = /^( *)(>+)( >*)*(?!$)/m;

            return line.replace(
                regex,
                function(args) {
                    return args.replace(/(\s)*(?!$)/g, "");
                });
        }

    }

});
