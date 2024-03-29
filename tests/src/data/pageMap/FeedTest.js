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

StartTest((t) => {

    const

        pageSize = 25,

        createFeed = function (cfg) {
            return Ext.create("coon.core.data.pageMap.Feed", cfg);
        },
        prop = function (id) {
            return Ext.create("Ext.data.Model", {
                id: id + "" || Ext.id()
            });
        },
        createProps = function (size, startIndex) {

            let data = [];

            for (let i = 1; i < size + 1; i++) {
                data.push(prop(startIndex ? startIndex  + i : i));
            }

            return data;
        },
        createFeedRandomFilled = function (cfg, full) {

            let feed = createFeed(cfg);

            for (let i = 0, len = pageSize; i < len; i++) {
                if (!full && (i % 2 === 0)) {
                    feed.data.push(prop());
                    continue;
                }

                feed.data[i] = prop();
            }

            return feed;
        };

    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------

    t.requireOk("coon.core.data.pageMap.Feed", () => {

        t.it("constructor()", (t) => {

            let exc;

            try{createFeed();}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("is required");
            t.expect(exc.msg.toLowerCase()).toContain("size");

            try{createFeed({size: pageSize});}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("is required");
            t.expect(exc.msg.toLowerCase()).toContain("previous");
            t.expect(exc.msg.toLowerCase()).toContain("next");

            try{createFeed({size: pageSize, previous: 4, next: 6});}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("not both");
            t.expect(exc.msg.toLowerCase()).toContain("previous");
            t.expect(exc.msg.toLowerCase()).toContain("next");

            let feed = createFeed({
                size: pageSize,
                previous: 4
            });

            t.expect(feed instanceof coon.core.data.pageMap.Feed).toBe(true);
            t.expect(feed.getSize()).toBe(pageSize);
            t.expect(feed.getPrevious()).toBe(4);

            t.expect(feed.data).toBeDefined();
            t.expect(feed.data.length).toBe(0);


            // SIZE
            try{feed.setSize(32);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("already set");
            t.expect(exc.msg.toLowerCase()).toContain("size");


            // PREVIOUS
            feed = createFeed({
                size: pageSize,
                previous: 4
            });

            t.expect(feed.getNext()).toBeUndefined();
            t.expect(feed.getPrevious()).toBe(4);
            try{feed.setPrevious(2);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("already set");
            t.expect(exc.msg.toLowerCase()).toContain("previous");

            try{feed.setNext(8);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("cannot set both");
            t.expect(exc.msg.toLowerCase()).toContain("previous");


            // NEXT
            feed = createFeed({
                size: pageSize,
                next: 6
            });
            t.expect(feed.getPrevious()).toBeUndefined();
            t.expect(feed.getNext()).toBe(6);
            try{feed.setNext(2);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("already set");
            t.expect(exc.msg.toLowerCase()).toContain("next");

            try{feed.setPrevious(8);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("cannot set both");
            t.expect(exc.msg.toLowerCase()).toContain("next");


        });


        t.it("hasUndefined()", (t) => {

            let feed = createFeed({
                size: pageSize,
                previous: 2
            });

            t.expect(feed.hasUndefined()).toBe(true);

            feed = createFeedRandomFilled({
                size: pageSize,
                next: 2
            }, true);
            t.expect(feed.hasUndefined()).toBe(false);
            feed.data.splice(0, 1);
            t.expect(feed.hasUndefined()).toBe(true);

            feed = createFeedRandomFilled({
                size: pageSize,
                previous: 2
            }, true);
            t.expect(feed.hasUndefined()).toBe(false);
            feed.data.splice(pageSize - 1, 1);
            t.expect(feed.hasUndefined()).toBe(true);

        });


        t.it("toArray()", (t) => {

            let feed = createFeed({
                    size: pageSize,
                    previous: 2
                }), arr;


            arr = feed.toArray();

            t.expect(Ext.isArray(arr)).toBe(true);

            t.expect(arr).toBe(feed.data);

        });


        t.it("getFreeSpace()", (t) => {

            let feed = createFeed({
                size: pageSize,
                previous: 2
            });

            t.expect(feed.getFreeSpace()).toBe(pageSize);

            feed = createFeedRandomFilled({
                size: pageSize,
                next: 3
            }, true);
            feed.data.splice(0, 1);
            feed.data.splice(1, 1);
            feed.data.splice(2, 1);
            feed.data.splice(3, 1);
            t.expect(feed.getFreeSpace()).toBe(4);

            feed = createFeedRandomFilled({
                size: pageSize,
                previous: 2
            }, true);
            feed.data.splice(pageSize - 1, 1);
            feed.data.splice(pageSize - 2, 1);
            t.expect(feed.getFreeSpace()).toBe(2);


        });


        t.it("fill()", (t) => {

            let exc, i, len,
                feed = createFeed({
                    size: pageSize,
                    next: 2
                });


            try {feed.fill("foo");}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be a none-empty array");
            t.expect(exc.msg.toLowerCase()).not.toContain("ext.data.model");
            exc = undefined;

            try {feed.fill([]);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be a none-empty array");
            t.expect(exc.msg.toLowerCase()).not.toContain("ext.data.model");
            exc = undefined;

            try {feed.fill(["foo"]);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be an array");
            t.expect(exc.msg.toLowerCase()).toContain("ext.data.model");
            exc = undefined;

            t.expect(feed.fill(createProps(10, 800))).toEqual([]);
            t.expect(feed.getFreeSpace()).toBe(pageSize - 10);

            let props = createProps(17, 900),
                eq    = [feed.getAt(15), feed.getAt(16)];

            t.expect(props.length).toBe(17);
            t.expect(feed.fill(props)).toEqual(eq);
            t.expect(props.length).toBe(17);
            t.expect(feed.getFreeSpace()).toBe(0);

            let oldProps = [];
            for (i = 0, len = feed.data.length; i < len; i++){
                oldProps.push(feed.data[i]);
            }

            props = createProps(pageSize, 1000);
            t.expect(feed.fill(props)).toEqual(oldProps);

            for (let i = 0; i < pageSize; i++) {
                t.expect(feed.data[i].getId()).toBe((i + 1001) + "");
            }

            // POSITION END
            feed = createFeed({
                size: pageSize,
                previous: 2
            });

            t.expect(feed.fill(createProps(10))).toEqual([]);
            t.expect(feed.getFreeSpace()).toBe(pageSize - 10);

            props = createProps(17, 800),
            eq    = [feed.getAt(8), feed.getAt(9)];

            t.expect(feed.fill(props)).toEqual(eq);
            t.expect(feed.getFreeSpace()).toBe(0);

            oldProps = [];
            for (i = 0, len = feed.data.length; i < len; i++){
                oldProps.push(feed.data[i]);
            }

            props = createProps(pageSize, 900);
            t.expect(feed.fill(props)).toEqual(oldProps);

            for (let i = 0; i < pageSize; i++) {
                t.expect(feed.data[i].getId()).toBe((i + 901) + "");
            }
        });


        t.it("fill() - reverseDirection - A", (t) => {

            let feed = createFeed({
                size: pageSize,
                next: 2
            });

            let rec1 = prop();
            let rec2 = prop();
            let rec3 = prop();
            let rec4 = prop();

            feed.fill([rec1, rec2]);
            t.expect(feed.getAt(23)).toBe(rec1);
            t.expect(feed.getAt(24)).toBe(rec2);

            feed.fill([rec3, rec4], true);
            t.expect(feed.getAt(21)).toBe(rec3);
            t.expect(feed.getAt(22)).toBe(rec4);
        });


        t.it("fill() - reverseDirection - B", (t) => {

            let feed = createFeed({
                size: pageSize,
                previous: 2
            });

            let rec1 = prop();
            let rec2 = prop();
            let rec3 = prop();
            let rec4 = prop();

            feed.fill([rec1, rec2]);
            t.expect(feed.getAt(0)).toBe(rec1);
            t.expect(feed.getAt(1)).toBe(rec2);

            feed.fill([rec3, rec4], true);
            t.expect(feed.getAt(2)).toBe(rec3);
            t.expect(feed.getAt(3)).toBe(rec4);
        });


        t.it("getAt()", (t) => {

            let exc,
                feed = createFeed({
                    size: pageSize,
                    next: 2
                });


            try {feed.getAt(-1);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("bounds");
            t.expect(exc.msg.toLowerCase()).toContain("index");
            exc = undefined;

            try {feed.getAt(pageSize);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("bounds");
            t.expect(exc.msg.toLowerCase()).toContain("index");
            exc = undefined;

            feed.fill(createProps(pageSize).splice(1, pageSize -1));

            t.expect(feed.getAt(0)).toBeUndefined();
            t.expect(feed.getAt(1).getId()).toBe("2");
            t.expect(feed.getAt(pageSize - 1).getId()).toBe("25");


            feed = createFeed({
                size: pageSize,
                previous: 2
            });

            feed.fill(createProps(pageSize).splice(1, pageSize -1));

            t.expect(feed.getAt(pageSize - 1)).toBeUndefined();
            t.expect(feed.getAt(pageSize - 2).getId()).toBe("25");
            t.expect(feed.getAt(0).getId()).toBe("2");
        });


        t.it("extract", (t) => {

            let exc,
                feed = Ext.create("coon.core.data.pageMap.Feed", {
                    size: 25,
                    next: 2
                }),
                props = createProps(pageSize),
                eq    = [props[pageSize - 3], props[pageSize - 2], props[pageSize - 1]];


            try {feed.extract(-1);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("bounds");
            t.expect(exc.msg.toLowerCase()).toContain("count");
            exc = undefined;

            try {feed.extract(pageSize + 1);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("bounds");
            t.expect(exc.msg.toLowerCase()).toContain("count");
            exc = undefined;

            try {feed.extract();}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("bounds");
            t.expect(exc.msg.toLowerCase()).toContain("count");
            exc = undefined;

            t.expect(feed.fill(props)).toEqual([]);

            t.expect(feed.extract(3)).toEqual(eq);
            t.expect(feed.getAt(0)).toBeUndefined();
            t.expect(feed.getAt(1)).toBeUndefined();
            t.expect(feed.getAt(2)).toBeUndefined();

            t.expect(feed.fill(eq)).toEqual([]);

            t.expect(feed.getAt(0).getId()).toBe("1");
            t.expect(feed.getAt(1).getId()).toBe("2");
            t.expect(feed.getAt(2).getId()).toBe("3");

            t.expect(feed.getAt(pageSize - 1).getId()).toBe("25");
            t.expect(feed.getAt(pageSize - 2).getId()).toBe("24");
            t.expect(feed.getAt(pageSize - 3).getId()).toBe("23");

            feed = Ext.create("coon.core.data.pageMap.Feed", {
                size: 25,
                previous: 2
            });
            props = createProps(pageSize),
            eq    = [props[0], props[1], props[2]];
            t.expect(feed.fill(props)).toEqual([]);
            t.expect(feed.extract(3)).toEqual(eq);

            t.expect(feed.getAt(pageSize - 1)).toBeUndefined();
            t.expect(feed.getAt(pageSize - 2)).toBeUndefined();
            t.expect(feed.getAt(pageSize - 3)).toBeUndefined();
        });


        t.it("extract - reverseDirection", (t) => {

            let feed = Ext.create("coon.core.data.pageMap.Feed", {
                    size: 25,
                    next: 2
                }),
                props = createProps(pageSize);


            t.expect(feed.fill(props)).toEqual([]);

            t.expect(feed.extract(1)[0]).toEqual(props[24]);
            t.expect(feed.extract(1, true)[0]).toEqual(props[0]);

        });


        t.it("example", (t) => {

            let feed = Ext.create("coon.core.data.pageMap.Feed", {
                size: 25,
                next: 2
            });

            let data = [
                Ext.create("Ext.data.Model", {id: "1"}),
                Ext.create("Ext.data.Model", {id: "2"}),
                Ext.create("Ext.data.Model", {id: "3"})
            ];

            feed.fill(data);

            let size = feed.getSize();

            // note for how POSITION_START will start feeding the Feed at its end.
            t.expect(feed.getAt(size - 1).getId()).toBe("3"); // '3'
            t.expect(feed.getAt(size - 2).getId()).toBe("2"); // '2'
            t.expect(feed.getAt(size - 3).getId()).toBe("1"); // '1'

            t.expect(feed.getAt(size - 4)).toBeUndefined(); // undefined
            t.expect(feed.getAt(0)).toBeUndefined(); // undefined


        });


        t.it("isEmpty()", (t) => {

            let feed = Ext.create("coon.core.data.pageMap.Feed", {
                size: 25,
                next: 2
            });

            let data = [
                Ext.create("Ext.data.Model", {id: "1"}),
                Ext.create("Ext.data.Model", {id: "2"}),
                Ext.create("Ext.data.Model", {id: "3"})
            ];

            t.expect(feed.isEmpty()).toBe(true);

            feed.fill(data);

            t.expect(feed.isEmpty()).toBe(false);
        });


        t.it("indexOf()", (t) => {

            let exc,
                feed = Ext.create("coon.core.data.pageMap.Feed", {
                    size: 25,
                    next: 2
                }),
                rec = Ext.create("Ext.data.Model", {id: "2"});

            try {feed.indexOf(87);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("instance of");
            exc = undefined;

            t.expect(feed.indexOf(rec)).toBe(-1);

            let data = [
                Ext.create("Ext.data.Model", {id: "1"}),
                Ext.create("Ext.data.Model", {id: "2"}),
                rec,
                Ext.create("Ext.data.Model", {id: "3"}),
                Ext.create("Ext.data.Model", {id: "4"}),
                Ext.create("Ext.data.Model", {id: "5"}),
                Ext.create("Ext.data.Model", {id: "6"}),
                Ext.create("Ext.data.Model", {id: "7"})
            ];

            feed.fill(data);

            t.expect(feed.indexOf(Ext.create("Ext.data.Model", {id: "5"}))).toBe(-1);


            t.expect(feed.indexOf(rec)).toBe(19);

            feed = Ext.create("coon.core.data.pageMap.Feed", {
                size: 25,
                previous: 2
            });

            feed.fill(data);

            t.expect(feed.indexOf(rec)).toBe(2);


        });


        t.it("removeAt()", (t) => {

            let feed = Ext.create("coon.core.data.pageMap.Feed", {
                    size: 25,
                    next: 2
                }), exc, rec = Ext.create("Ext.data.Model", {id: "2"});

            try {feed.removeAt(-3);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("bounds");
            exc = undefined;

            t.expect(feed.removeAt(5)).toBeUndefined();

            let data = [
                Ext.create("Ext.data.Model", {id: "1"}),
                Ext.create("Ext.data.Model", {id: "2"}),
                rec,
                Ext.create("Ext.data.Model", {id: "3"}),
                Ext.create("Ext.data.Model", {id: "4"}),
                Ext.create("Ext.data.Model", {id: "5"}),
                Ext.create("Ext.data.Model", {id: "6"}),
                Ext.create("Ext.data.Model", {id: "7"})
            ];

            feed.fill(data);

            t.expect(feed.getFreeSpace()).toBe(17);
            t.expect(feed.indexOf(data[2])).toBe(19);
            t.expect(feed.removeAt(19)).toBe(data[2]);
            t.expect(feed.getFreeSpace()).toBe(18);
            t.expect(feed.indexOf(data[2])).toBe(-1);

            feed = Ext.create("coon.core.data.pageMap.Feed", {
                size: 25,
                previous: 2
            });

            feed.fill(data);

            t.expect(feed.getFreeSpace()).toBe(17);
            t.expect(feed.indexOf(rec)).toBe(2);
            t.expect(feed.removeAt(2)).toBe(rec);
            t.expect(feed.getFreeSpace()).toBe(18);
            t.expect(feed.indexOf(rec)).toBe(-1);
        });


        t.it("insertAt()", function (t){

            let feedNext = Ext.create("coon.core.data.pageMap.Feed", {
                    size: 25,
                    next: 2
                }),
                feedPrev = Ext.create("coon.core.data.pageMap.Feed", {
                    size: 25,
                    previous: 2
                }),
                recN = [prop(900)], recP = [prop(900)], recListN = createProps(26),
                recListP = createProps(26),
                spillListN = [recN[0], recListN[0]],
                spillListP = [recListP[25], recP[0]];

            t.isCalled("filterIndexValue", feedNext);
            t.isCalled("filterRecordsArray", feedNext);

            t.isCalled("filterIndexValue", feedPrev);
            t.isCalled("filterRecordsArray", feedPrev);

            // one record
            t.expect(feedNext.insertAt(recN, 24)).toEqual([]);
            t.expect(feedPrev.insertAt(recP, 0)).toEqual([]);

            t.expect(feedNext.getAt(24)).toBe(recN[0]);
            t.expect(feedPrev.getAt(0)).toBe(recP[0]);

            // mutliple records with spill
            t.expect(feedNext.insertAt(recListN, 24)).toEqual(spillListN);
            t.expect(feedPrev.insertAt(recListP, 0)).toEqual(spillListP);

            let ls    = [prop(1000), prop(1001)],
                spill = [feedNext.getAt(0), feedNext.getAt(1)],
                moved =  feedNext.getAt(9);

            t.expect(feedNext.insertAt(ls, 9)).toEqual(spill);
            t.expect(feedNext.getAt(7)).toBe(moved);
            t.expect(feedNext.getAt(9)).toBe(ls[1]);
            t.expect(feedNext.getAt(8)).toBe(ls[0]);


            ls = [prop(2000), prop(2001)],
            spill = [feedPrev.getAt(23), feedPrev.getAt(24)],
            moved =  feedPrev.getAt(9);

            t.expect(feedPrev.insertAt(ls, 9)).toEqual(spill);
            t.expect(feedPrev.getAt(11)).toBe(moved);
            t.expect(feedPrev.getAt(10)).toBe(ls[1]);
            t.expect(feedPrev.getAt(9)).toBe(ls[0]);
        });


        t.it("insertAt() - undefined index", function (t){
            let feedNext = Ext.create("coon.core.data.pageMap.Feed", {
                    size: 25,
                    next: 2
                }),
                feedPrev = Ext.create("coon.core.data.pageMap.Feed", {
                    size: 25,
                    previous: 2
                }),
                recN = [prop(900), prop(901)], recP = [prop(900), prop(901)],
                fillPropsN = createProps(4),
                fillPropsP = createProps(4);

            t.expect(feedNext.fill(fillPropsN)).toEqual([]);

            t.expect(feedNext.getAt(12)).toBeUndefined();
            t.expect(feedNext.insertAt(recN, 12)).toEqual([]);

            t.expect(feedNext.getAt(24)).toBe(fillPropsN[3]);
            t.expect(feedNext.getAt(23)).toBe(fillPropsN[2]);
            t.expect(feedNext.getAt(22)).toBe(fillPropsN[1]);
            t.expect(feedNext.getAt(21)).toBe(fillPropsN[0]);
            t.expect(feedNext.getAt(20)).toBe(recN[1]);
            t.expect(feedNext.getAt(19)).toBe(recN[0]);


            t.expect(feedPrev.fill(fillPropsP)).toEqual([]);

            t.expect(feedPrev.getAt(12)).toBeUndefined();
            t.expect(feedPrev.insertAt(recP, 12)).toEqual([]);

            t.expect(feedPrev.getAt(3)).toBe(fillPropsP[3]);
            t.expect(feedPrev.getAt(2)).toBe(fillPropsP[2]);
            t.expect(feedPrev.getAt(1)).toBe(fillPropsP[1]);
            t.expect(feedPrev.getAt(0)).toBe(fillPropsP[0]);
            t.expect(feedPrev.getAt(5)).toBe(recP[1]);
            t.expect(feedPrev.getAt(4)).toBe(recP[0]);
        });


        t.it("insertAt() - reverse direction", function (t){
            let feedNext = Ext.create("coon.core.data.pageMap.Feed", {
                    size: 25,
                    next: 2
                }),
                feedPrev = Ext.create("coon.core.data.pageMap.Feed", {
                    size: 25,
                    previous: 2
                }),
                recN = [prop(900), prop(901)], recP = [prop(900), prop(901)],
                fillPropsN = createProps(4),
                fillPropsP = createProps(4);

            t.expect(feedNext.fill(fillPropsN)).toEqual([]);

            t.expect(feedNext.getAt(12)).toBeUndefined();
            t.expect(feedNext.insertAt(recN, 12, true)).toEqual([]);

            t.expect(feedNext.getAt(22)).toBe(fillPropsN[3]);
            t.expect(feedNext.getAt(21)).toBe(fillPropsN[2]);
            t.expect(feedNext.getAt(20)).toBe(fillPropsN[1]);
            t.expect(feedNext.getAt(19)).toBe(fillPropsN[0]);
            t.expect(feedNext.getAt(24)).toBe(recN[1]);
            t.expect(feedNext.getAt(23)).toBe(recN[0]);


            t.expect(feedPrev.fill(fillPropsP)).toEqual([]);

            t.expect(feedPrev.getAt(12)).toBeUndefined();
            t.expect(feedPrev.insertAt(recP, 12, true)).toEqual([]);

            t.expect(feedPrev.getAt(5)).toBe(fillPropsP[3]);
            t.expect(feedPrev.getAt(4)).toBe(fillPropsP[2]);
            t.expect(feedPrev.getAt(3)).toBe(fillPropsP[1]);
            t.expect(feedPrev.getAt(2)).toBe(fillPropsP[0]);
            t.expect(feedPrev.getAt(1)).toBe(recP[1]);
            t.expect(feedPrev.getAt(0)).toBe(recP[0]);
        });


        t.it("insertAt() - A", (t) => {

            let feedNext = Ext.create("coon.core.data.pageMap.Feed", {
                    size: 25,
                    next: 2
                }),
                props   = [prop(47), prop(48), prop(49), prop(50)],
                newProp = prop(48.5);

            feedNext.fill(props);

            t.expect(feedNext.insertAt([newProp], 22)).toEqual([]);

            t.expect(feedNext.getAt(24)).toBe(props[3]);
            t.expect(feedNext.getAt(23)).toBe(props[2]);
            t.expect(feedNext.getAt(22)).toBe(newProp);
            t.expect(feedNext.getAt(21)).toBe(props[1]);
            t.expect(feedNext.getAt(20)).toBe(props[0]);

        });


        t.it("replaceWith()", (t) => {

            let feedNext = Ext.create("coon.core.data.pageMap.Feed", {
                    size: 25,
                    next: 2
                }),
                props   = [prop(47), prop(48), prop(49), prop(50)],
                newProp = prop(48.5), exc;

            feedNext.fill(props);

            feedNext.extract(2);

            try{feedNext.replaceWith(22, newProp);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("no record");

            t.expect(feedNext.replaceWith(23, newProp)).toBe(props[0]);


            let feedPrev = Ext.create("coon.core.data.pageMap.Feed", {
                size: 25,
                previous: 4
            });

            props   = [prop(47), prop(48), prop(49), prop(50)];
            newProp = prop(48.5);
            feedPrev.fill(props);

            feedPrev.extract(2);

            try{feedPrev.replaceWith(2, newProp);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("no record");

            t.expect(feedPrev.replaceWith(1, newProp)).toBe(props[3]);

        });


    });});