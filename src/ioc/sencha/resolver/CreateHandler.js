/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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
 * Handler for proxying Ext.create.
 * Resolves to the in-memory class definition any call to Ext.create()
 * may reference.
 */
Ext.define("coon.core.ioc.sencha.resolver.CreateHandler", {

    extend: "coon.core.ioc.sencha.resolver.ClassResolver",

    requires: [
        // @define "l8"
        "l8"
    ],


    /**
     * Apply handler for proxying calls to Ext.create(). Will try to resolve the information
     * available with argumentsList[0] to an in-memory class-definition.
     * Fires the classresolved-event on success.
     *
     *
     * @param target
     * @param thisArg
     * @param argumentsList
     * @returns {*}
     */
    apply (target, thisArg, argumentsList) {

        const me = this;

        let [className] = argumentsList, cls;

        if (l8.isString(className)) {
            cls = Ext.ClassManager.get(className);
        } else if(l8.isObject(className)) {
            if (className.xclass) {
                cls = Ext.ClassManager.get(className.xclass);
            } else {
                cls = Ext.ClassManager.getByAlias(className.xtype && `widget.${className.xtype}`);
            }
        }

        if (cls) {
            className = Ext.ClassManager.getName(cls);
            me.fireEvent("classresolved", me, className, cls);
        }

        return Reflect.apply(target, thisArg, argumentsList);
    }


});
