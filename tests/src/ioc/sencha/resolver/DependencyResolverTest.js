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

StartTest(t => {

    const superclass = "coon.core.ioc.sencha.resolver.DependencyResolver";
    const className  = "coon.core.ioc.sencha.resolver.DependencyResolver";

    const create = cfg => {

        if (!cfg.bindings) {
            cfg.bindings = createBindings();
        }

        return Ext.create(className, cfg.bindings);
    };

    const createBindings = data => Ext.create("coon.core.ioc.Bindings", data);

    t.it("sanity", t => {
        const
            bindings = createBindings(),
            injector = create({bindings});

        t.isInstanceOf(injector, superclass);
        t.expect(injector.bindings).toBe(bindings);
    });


    t.it("constructor throws exception", t => {

        try {
            Ext.create(className);
            t.fail();
        } catch (e) {
            t.expect(e.message).toContain("must be an instance of");
        }
    });


    t.it("resolveToSpecific()", t => {

        const bindings = createBindings({
            "$defs": {
                "RequestConfiguratorSingleton": {
                    "xclass": "conjoon.cn_imapuser.data.request.Configurator",
                    "singleton": true
                }
            },
            "conjoon.cn_mail": {
                "coon.core.data.request.Configurator": {
                    "$ref": "#/$defs/RequestConfiguratorSingleton"
                }
            },
            "com.acme.data": {
                "org.project.impl.IClass": "org.project.impl.Specific"
            },
            "com.acme.data.addendum": {
                "org.project.impl.IClass": "org.project.impl.AddendumSpecific"
            },
            "com.acme.objCfg": {
                "org.Obj": {
                    "xclass": "org.project.ObjCfg"
                }
            },
            "com.acme.singletons": {
                "org.Singleton": {
                    "xclass": "org.project.impl.AddendumSpecific",
                    "singleton": true
                }
            }
        });

        const injector = create({bindings});

        const tests = [{
            // use $ref
            targetClass: "conjoon.cn_mail.Reference",
            requiredType: "coon.core.data.request.Configurator",
            result: {
                "xclass": "conjoon.cn_imapuser.data.request.Configurator",
                "singleton": true
            }
        }, {
            // match that has an object configured instead of a string
            targetClass: "com.acme.objCfg.IImpl",
            requiredType: "org.Obj",
            result: {
                "xclass": "org.project.ObjCfg"
            }
        }, {
            // class matching namespace returns specific
            targetClass: "com.acme.data.message.Editor",
            requiredType: "org.project.impl.IClass",
            result: "org.project.impl.Specific"
        }, {
            // class not matching namespace returns default
            targetClass: "message.Editor",
            requiredType: "org.project.impl.IClass",
            result: "org.project.impl.IClass"
        }, {
            // namespace more narrow
            // class matching namespace returns specific
            targetClass: "com.acme.data.addendum.message.Editor",
            requiredType: "org.project.impl.IClass",
            result: "org.project.impl.AddendumSpecific"
        }, {
            // class matching namespace, no specific configured
            targetClass: "com.acme.data.message.Editor",
            requiredType: "missing.class",
            result: "missing.class"
        }];

        tests.map(({targetClass, requiredType, result}) => {

            t.expect(injector.resolveToSpecific(
                targetClass,
                requiredType
            )).toEqual(result);

        });
    });


    t.it("getScope()", t=> {

        const injector = create({});
        t.expect(injector.getScope()).toBe(window);

    });


    t.it("resolveDependencies()", t => {

        const injector = create({});

        const resolveToSpecific =  (targetClass, requiredType) => {

            if (targetClass === "com.acme.BaseProxy") {
                if (requiredType === "coon.core.data.request.Configurator") {
                    return "Ext.Base";
                }
                if (requiredType === "viewModel") {
                    return "Ext.app.ViewModel";
                }
                if (requiredType === "singleton") {
                    return {
                        xclass: "Ext.app.Controller",
                        singleton: true
                    };
                }
                if (requiredType === "type") {
                    return "notDefined";
                }

            }

            if (targetClass === "com.acme.BaseProxy" && requiredType === "coon.core.data.request.Configurator") {
                return "resolved";
            }

        };

        const
            resolveToSpecificSpy = t.spyOn(injector, "resolveToSpecific").and.callFake(resolveToSpecific),
            scopeSpy = t.spyOn(injector, "getScope").and.callFake(() => window);

        let deps = new Array(2).fill({}, 0, 2).map(() => injector.resolveDependencies(
            "com.acme.BaseProxy",
            {"requestConfigurator": "coon.core.data.request.Configurator",
                "viewModel": "viewModel"}
        ));

        let xclass = resolveToSpecific(
            "com.acme.BaseProxy",
            "coon.core.data.request.Configurator"
        );
        t.isInstanceOf(deps[0].requestConfigurator, xclass);
        t.isInstanceOf(deps[1].requestConfigurator, xclass);
        t.expect(deps[0].requestConfigurator).not.toBe(deps[1].requestConfigurator);

        xclass = resolveToSpecific(
            "com.acme.BaseProxy",
            "viewModel"
        );
        t.isInstanceOf(deps[0].viewModel, xclass);
        t.isInstanceOf(deps[1].viewModel, xclass);
        t.expect(deps[0].viewModel).not.toBe(deps[1].viewModel);


        // add skipProps
        deps = new Array(2).fill({}, 0, 2).map(() => injector.resolveDependencies(
            "com.acme.BaseProxy",
            {"requestConfigurator": "coon.core.data.request.Configurator",
                "viewModel": "viewModel"},
            ["requestConfigurator"]
        ));

        t.expect(deps[0].requestConfigurator).toBeUndefined();
        t.expect(deps[0].viewModel).toBeDefined();


        // singleton
        deps = new Array(2).fill({}, 0, 2).map(() => injector.resolveDependencies(
            "com.acme.BaseProxy",
            {"obj": "singleton"}
        ));

        let cfg = resolveToSpecific(
            "com.acme.BaseProxy",
            "singleton"
        );
        t.isInstanceOf(deps[0].obj, cfg.xclass);
        t.isInstanceOf(deps[1].obj, cfg.xclass);
        t.expect(deps[0].obj).toBe(deps[1].obj);


        // exception, class not loaded
        try {
            injector.resolveDependencies("com.acme.BaseProxy", {"prop": "type"});
            t.fail();
        } catch (e) {
            t.expect(e.message).toContain("was not found in the scope");
        }

        [resolveToSpecificSpy, scopeSpy].map(spy => spy.remove());
    });


});
