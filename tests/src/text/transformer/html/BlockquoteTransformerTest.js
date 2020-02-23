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

describe('coon.core.text.transformer.html.BlockquoteTransformerTest', function(t) {


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('coon.core.text.transformer.html.BlockquoteTransformer', function(){

        t.it("sanitizeLine()", function (t) {

            let transformer = Ext.create("coon.core.text.transformer.html.BlockquoteTransformer");

            let line = " > >    Text that does 1";

            t.expect(transformer.sanitizeLine(line)).toBe(
                ">> Text that does 1"
            );

        });


        t.it("group()", function(t) {

            let transformer = Ext.create("coon.core.text.transformer.html.BlockquoteTransformer");

            let text = [
                " > This is",
                "> some quoted",
                " > > Text that does 1",
                ">          >         Text that does 2",
                ">hm good",
                "stuff that",
                "usually likes",
                ">> to be parsed",
                "          >>YO!",
            ].join("\n");

            t.expect(transformer.group(text)).toEqual([
               ["> This is", "> some quoted", ">> Text that does 1", ">> Text that does 2", ">hm good"],
               ["stuff that", "usually likes"],
               [">> to be parsed", ">>YO!"]
            ]);

        });


        t.it('transform()', function(t) {

            let text = [
                " > This is",
                "> some quoted",
                "  >> Text that does 1",
                ">> Text that does 2",
                ">hm good",
                "stuff that",
                "usually likes",
                ">> to be parsed",
                ">>YO!",
            ].join("\n");
            
            let transformer = Ext.create("coon.core.text.transformer.html.BlockquoteTransformer");

            t.expect(transformer.transform(text)).toBe(
                "<blockquote> This is\n some quoted<blockquote>" +
                " Text that does 1\n Text that does 2</blockquote>hm good</blockquote>stuff that\nusually likes"+
                "<blockquote><blockquote> to be parsed\nYO!</blockquote></blockquote>"

            );


            
        });



    })});
