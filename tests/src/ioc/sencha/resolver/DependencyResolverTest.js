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
            "com.acme.data": {
                "org.project.impl.IClass": "org.project.impl.Specific"
            },
            "com.acme.data.addendum": {
                "org.project.impl.IClass": "org.project.impl.AddendumSpecific"
            }
        });

        const injector = create({bindings});

        const tests = [{
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
            )).toBe(result);

        });
    });


    t.it("getScope()", t=> {

        const injector = create({});
        t.expect(injector.getScope()).toBe(window);

    });


    t.it("resolveDependencies()", t => {

        const injector = create({});

        const clsContainer = {
            "resolved_configurator": {},
            "view_model_specific": {}
        };

        const resolveToSpecific =  (targetClass, requiredType) => {

            if (targetClass === "com.acme.BaseProxy") {
                if (requiredType === "coon.core.data.request.Configurator") {
                    return "resolved_configurator";
                }
                if (requiredType === "view.Model") {
                    return "view_model_specific";
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
            createSpy = t.spyOn(Ext, "create").and.callFake(args => args),
            scopeSpy = t.spyOn(injector, "getScope").and.callFake(() => clsContainer);

        let deps = injector.resolveDependencies(
            "com.acme.BaseProxy",
            {"requestConfigurator": "coon.core.data.request.Configurator",
                "viewModel": "view.Model"}
        );

        t.expect(deps).toEqual({
            "requestConfigurator": "resolved_configurator",
            "viewModel": "view_model_specific"
        });

        // add skipProps
        deps = injector.resolveDependencies(
            "com.acme.BaseProxy",
            {"requestConfigurator": "coon.core.data.request.Configurator",
                "viewModel": "view.Model"},
            ["requestConfigurator"]
        );

        t.expect(deps).toEqual({
            "viewModel": "view_model_specific"
        });

        // exception, class not loaded
        try {
            injector.resolveDependencies("com.acme.BaseProxy", {"prop": "type"});
            t.fail();
        } catch (e) {
            t.expect(e.message).toContain("was not found in the scope");        }

        [resolveToSpecificSpy, createSpy, scopeSpy].map(spy => spy.remove());
    });


});
