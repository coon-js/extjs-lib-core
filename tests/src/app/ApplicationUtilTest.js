/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2021-2022 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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
    "use strict";

    t.requireOk("coon.core.Environment", () => {


        let applicationUtil = null;

        const setupEnvironment = (environment) => {
                coon.core.Environment.setVendorBase(Ext.create("coon.test.app.mock.VendorMock", environment));
            },
            purgeEnvironment = () => {
                coon.core.Environment._vendorBase = undefined;
            },
            loadApplicationConfigExceptionTemplate = async (t, env) => {
                const appName = "envfilefound";
                setupEnvironment({manifest: {name: appName, "coon-js": {env: env}}});

                let configurationException = new coon.core.app.ConfigurationException(new coon.core.exception.Exception());
                applicationUtil.configLoader.load = function () {
                    throw configurationException;
                };
                let spy = t.spyOn(applicationUtil.configLoader, "load").and.callThrough();

                let exc;
                try {
                    await applicationUtil.loadApplicationConfig();
                } catch (e) {
                    exc = e;
                }

                t.expect(spy).toHaveBeenCalled(1);
                t.expect(spy.calls.all()[0].args[0]).toBe(appName);
                t.expect(spy.calls.all()[0].args[1]).toBeUndefined();
                t.expect(spy.calls.all()[0].args[2]).toBe(appName);

                t.expect(exc).toBe(configurationException);
            };


        t.beforeEach(() => {
            applicationUtil = Ext.create("coon.core.app.ApplicationUtil");
        });

        t.afterEach(() => {
            purgeEnvironment();
            coon.core.ConfigManager.configs = {};
            applicationUtil.destroy();
            applicationUtil = null;

        });


        // +----------------------------------------------------------------------------
        // |                    =~. Tests .~=
        // +----------------------------------------------------------------------------

        t.it("constructor sets up properly", t => {

            t.isInstanceOf(applicationUtil.batchConfigLoader, "coon.core.app.BatchConfigLoader");
            t.isInstanceOf(applicationUtil.configLoader, "coon.core.app.ConfigLoader");
            t.expect(applicationUtil.batchConfigLoader.configLoader).toBe(applicationUtil.configLoader);

        });


        t.it("getCoonPackages()", t => {

            const manifestPackages = {
                    foo: {
                        included: false,
                        namespace: "foo",
                        "coon-js": {package: {autoLoad: {registerController: true}}}
                    },
                    bar: {
                        included: true,
                        namespace: "com.bar",
                        "coon-js": {package: {autoLoad: {registerController: true}}}
                    },
                    snafu: {
                        included: true,
                        namespace: "snafu"
                    }
                },
                result = {
                    foo: {
                        included: false,
                        namespace: "foo",
                        "coon-js": {
                            package: {
                                controller: "foo.app.PackageController",
                                autoLoad: {
                                    registerController: true
                                }
                            }
                        }
                    },
                    "bar": {
                        included: true,
                        namespace: "com.bar",
                        "coon-js": {
                            package: {
                                autoLoad: {registerController: true},
                                controller: "com.bar.app.PackageController"
                            }
                        }
                    }
                };

            Object.freeze(manifestPackages);
            Object.freeze(result);


            t.isDeeply(applicationUtil.getCoonPackages(manifestPackages), result);
            // make sure getCoonPackages() is referentially transparent
            t.isDeeply(applicationUtil.getCoonPackages(result), result);
        });


        t.it("getApplicationConfigUrls()", t => {

            setupEnvironment({manifest: {name: "appname", "coon-js": {env: "testing"}}});

            let defaultPath = "fixtures/coon-js/appname.conf.json",
                envPath =  "fixtures/coon-js/appname.testing.conf.json";

            t.expect(applicationUtil.getApplicationConfigUrls()).toEqual({
                default: defaultPath,
                environment: envPath
            });

        });


        t.it("getPackageNameForController()", t => {

            const manifest =  {
                foo: {
                    included: false,
                    namespace: "foo",
                    "coon-js": {package: {controller: "FOOBAR"}}
                },
                bar: {
                    included: true,
                    namespace: "com.bar",
                    "coon-js": {package: {autoLoad: {registerController: true}}}
                },
                snafu: {
                    included: false,
                    namespace: "snafu",
                    "coon-js": {package: {autoLoad: true}}
                }
            };

            t.expect(applicationUtil.getPackageNameForController("com.bar.app.PackageController", manifest)).toBe("bar");
            t.expect(applicationUtil.getPackageNameForController("FOOBAR", manifest)).toBe("foo");
            t.expect(applicationUtil.getPackageNameForController("snafuctrl", manifest)).toBeUndefined();

        });


        t.it("delegates to getPluginsForType", t => {

            const delegateSpy = t.spyOn(applicationUtil, "getPluginsForType").and.callFake(() => {});

            applicationUtil.getControllerPlugins("a", "b");
            t.expect(delegateSpy.calls.mostRecent().args).toEqual(["controller", "a", "b"]);

            applicationUtil.getComponentPlugins("c", "d");
            t.expect(delegateSpy.calls.mostRecent().args).toEqual(["components", "c", "d"]);

        });


        t.it("getPluginsForType() - controller", t => {

            const manifestPackages =  {
                    foo: {
                        included: false,
                        namespace: "foo",
                        "coon-js": {package: {autoLoad: {registerController: true}, config: {plugins: {controller: ["bar", "snafu.Controller"]}}}}
                    },
                    bar: {
                        included: true,
                        namespace: "com.bar",
                        "coon-js": {package: true}
                    },
                    acme: {
                        namespace: "some.acme",
                        "coon-js": {package: true}
                    },
                    snafu: {
                        included: false,
                        namespace: "snafu",
                        "coon-js": {package: {controller: "mycustom.Controller", config: {plugins: {controller: "some.acme.controller.Plugin"}}}}
                    },
                    mail: {
                        included: false,
                        namespace: "cn_mail",
                        "coon-js": {package: {autoLoad: {registerController: true}, config: {plugins: {controller: [{
                            xclass: "xclassedplugin",
                            args: [{one: 1}, {two: 2}]
                        }]}}}}
                    }
                },
                result = {
                    "foo.app.PackageController": [
                        "com.bar.app.plugin.ControllerPlugin",
                        "snafu.Controller"
                    ],
                    "mycustom.Controller": [
                        "some.acme.controller.Plugin"
                    ],
                    "cn_mail.app.PackageController": [{
                        xclass: "xclassedplugin",
                        args: [{one: 1}, {two: 2}]
                    }]
                };

            setupEnvironment({manifest: {packages: manifestPackages}});

            Object.freeze(manifestPackages);
            Object.freeze(result);

            t.isDeeply(applicationUtil.getPluginsForType("controller", manifestPackages), result);


            t.isDeeply(applicationUtil.getPluginsForType("controller", {foobar: {}}), {});
        });


        t.it("getApplicationPlugins()", t => {

            // register here package in config manager to make sure
            // package configuration from env is used
            coon.core.ConfigManager.register("foo", {"controller": {"plugins": {}}});

            const
                applicationConfig = {
                    "plugins": {
                        "application": [
                            "ApplicationPluginCustomWONamespace",
                            "application.plugin.custom.w.Namespace",
                            "foo"
                        ]
                    }
                },
                manifestPackages =  {
                    foo: {
                        included: false,
                        namespace: "foo",
                        "coon-js": {package: true}
                    },
                    bar: {
                        included: true,
                        namespace: "com.bar",
                        "coon-js": {package: true}
                    },
                    acme: {
                        namespace: "some.acme",
                        "coon-js": {package: true}
                    },
                    snafu: {
                        included: false,
                        namespace: "application.plugin",
                        "coon-js": {package: true}
                    }
                },
                result = [
                    "application.plugin.custom.w.Namespace",
                    "foo.app.plugin.ApplicationPlugin"
                ];

            setupEnvironment({manifest: {packages: manifestPackages}});

            Object.freeze(manifestPackages);
            Object.freeze(result);

            t.isDeeply(applicationUtil.getApplicationPlugins(applicationConfig.plugins.application, manifestPackages), result);
        });


        t.it("loadApplicationConfig() - no env-property in manifest available", async t => {
            const appName = "foo";
            setupEnvironment({manifest: {name: appName}});

            let spy = t.spyOn(applicationUtil.configLoader, "load").and.callFake(async () => {});

            applicationUtil.loadApplicationConfig();

            t.expect(spy).toHaveBeenCalled(1);
            t.expect(spy.calls.mostRecent().args[0]).toBe(appName);
            t.expect(spy.calls.mostRecent().args[1]).toBeUndefined();
            t.expect(spy.calls.mostRecent().args[2]).toBe(appName);
        });


        t.it("loadApplicationConfig() - env-property (dev) in manifest available(!), but both files not found", async t => {

            const appName = "foo";
            setupEnvironment({manifest: {name: appName, "coon-js": {env: "dev"}}});

            let spy = t.spyOn(applicationUtil.configLoader, "load").and.callThrough();

            t.expect(await applicationUtil.loadApplicationConfig()).toBeUndefined();

            t.expect(spy).toHaveBeenCalled(1);
        });


        t.it("loadApplicationConfig() - env-property (dev) in manifest available(!), but only default file found", async t => {

            const appName = "defaultfilefound";
            setupEnvironment({manifest: {name: appName, "coon-js": {"resourcePath": "coon-js", env: "dev"}}});

            let spy = t.spyOn(applicationUtil.configLoader, "load").and.callThrough();

            t.expect(await applicationUtil.loadApplicationConfig()).toEqual({application: {defaultfile: "found"}});

            t.expect(spy).toHaveBeenCalled(1);
        });


        t.it("loadApplicationConfig() - env-property (dev)  not available, default file found in default resources", async t => {

            // mock will have default path set tp "fixtures"
            const appName = "defaultfilefound";
            setupEnvironment({manifest: {name: appName}});

            let spy = t.spyOn(applicationUtil.configLoader, "load").and.callThrough();

            t.expect(await applicationUtil.loadApplicationConfig()).toEqual({application: {defaultfile: "found"}});

            t.expect(spy).toHaveBeenCalled(1);
        });


        t.it("loadApplicationConfig() - env-property (dev) available, env file found", async t => {
            const appName = "envfilefound";
            setupEnvironment({manifest: {name: appName, "coon-js": {"resourcePath": "coon-js", "env": "dev"}}});

            let spy = t.spyOn(applicationUtil.configLoader, "load").and.callThrough();

            t.expect(await applicationUtil.loadApplicationConfig()).toEqual({application: {envfile: "found"}});

            t.expect(spy).toHaveBeenCalled(1);

        });

        t.it("loadApplicationConfig() - env-property (dev) available, exception thrown", async t => {
            await loadApplicationConfigExceptionTemplate(t, {env: "dev"});
        });


        t.it("loadApplicationConfig() - env-property (dev) not available, exception thrown", async t => {
            await loadApplicationConfigExceptionTemplate(t);
        });


        t.it("loadPackages()", async t => {
            const appName = "testapp";

            setupEnvironment({manifest: {
                name: appName,
                packages: {
                    foo: {
                        name: "foo",
                        namespace: "foo",
                        "coon-js": {
                            package: {
                                autoLoad: {registerController: true}
                            }
                        }
                    },
                    snafu: {
                        name: "snafu",
                        namespace: "snafu"
                    },
                    bar: {
                        name: "bar",
                        namespace: "bar",
                        "coon-js": {
                            package: {
                                config: {
                                    conf: "set"
                                }
                            }
                        }
                    }
                }
            }});

            let envLoaderSpy = t.spyOn(coon.core.Environment, "loadPackage").and.callFake(async () => {}),
                batchLoaderSpy = t.spyOn(applicationUtil.batchConfigLoader, "load").and.callFake(async () => {});

            let ctrls = await applicationUtil.loadPackages(coon.core.Environment.getPackages());

            t.isDeeply(applicationUtil.batchConfigLoader.domains, {
                "bar": {defaultConfig: {conf: "set"}}
            });

            t.isDeeply(ctrls, ["foo.app.PackageController"]);
            t.expect(batchLoaderSpy).toHaveBeenCalled(1);
            t.expect(envLoaderSpy).toHaveBeenCalled(2);
            t.expect(envLoaderSpy.calls.all()[0].args[0]).toBe("foo");
            t.expect(envLoaderSpy.calls.all()[1].args[0]).toBe("bar");

            envLoaderSpy.remove();

        });


        t.it("extjs-lib-core#47", t => {

            coon.core.ConfigManager.register("foo", {
                plugins: {
                    controller: ["com.bar.fromConfigController"]
                }
            });

            const manifestPackages =  {
                    foo: {
                        included: false,
                        namespace: "foo",
                        "coon-js": {package: {autoLoad: {registerController: true}, config: {plugins: {controller: ["bar", "snafu.Controller"]}}}}
                    },
                    bar: {
                        included: true,
                        namespace: "com.bar",
                        "coon-js": {package: true}
                    }
                },
                result = {
                    "foo.app.PackageController": [
                        "com.bar.fromConfigController"
                    ]
                };

            setupEnvironment({manifest: {packages: manifestPackages}});

            Object.freeze(manifestPackages);
            Object.freeze(result);

            t.isDeeply(applicationUtil.getPluginsForType("controller", manifestPackages), result);
        });


        t.it("extjs-lib-core#48", t => {

            const manifestPackages =  {
                    foo: {
                        included: false,
                        namespace: "foo",
                        "coon-js": {package: {autoLoad: {registerController: true}, config: {plugins: {controller: ["bar", "snafu.Controller"]}}}}
                    },
                    anotherFoo: {
                        included: false,
                        namespace: "anotherFoo",
                        "coon-js": {package: {autoLoad: {registerController: true}, config: {plugins: {controller: "bar"}}}}
                    },
                    snafu: {
                        included: false,
                        namespace: "snafu",
                        "coon-js": {package: {controller: "mycustom.Controller", config: {plugins: {controller: "some.acme.controller.Plugin"}}}}
                    },
                    bar: {
                        included: true,
                        namespace: "com.bar",
                        "coon-js": {package: true}
                    }
                },
                result = {
                    "foo.app.PackageController": [
                        "com.bar.app.plugin.ControllerPlugin",
                        "snafu.Controller"
                    ],
                    "anotherFoo.app.PackageController": [
                        "com.bar.app.plugin.ControllerPlugin"
                    ]
                };

            setupEnvironment({manifest: {packages: manifestPackages}});

            Object.freeze(manifestPackages);
            Object.freeze(result);


            let pluginMap = applicationUtil.getControllerPlugins(manifestPackages);
            t.isDeeply(pluginMap, result);

            pluginMap = applicationUtil.getControllerPlugins(manifestPackages, "foo.app.PackageController");
            t.isDeeply(pluginMap, {
                "foo.app.PackageController": ["com.bar.app.plugin.ControllerPlugin", "snafu.Controller"]
            });

            pluginMap = applicationUtil.getControllerPlugins(manifestPackages, "anotherFoo.app.PackageController");
            t.isDeeply(pluginMap, {
                "anotherFoo.app.PackageController": ["com.bar.app.plugin.ControllerPlugin"]
            });

            pluginMap = applicationUtil.getControllerPlugins(manifestPackages, "notExisting");
            t.isDeeply(pluginMap, {});
        });


        t.it("getComponentPlugins", t => {

            const manifestPackages =  {
                    foo: {
                        included: false,
                        namespace: "foo",
                        "coon-js": {
                            package: {
                                autoLoad: {registerController: true},
                                config: {
                                    plugins: {
                                        components: [{
                                            cmp: "panel",
                                            event: "render",
                                            pclass: "pclass"
                                        }]}}}}
                    }
                },
                result = {
                    "foo.app.PackageController": [{
                        cmp: "panel",
                        event: "render",
                        pclass: "pclass"
                    }]
                };

            setupEnvironment({manifest: {packages: manifestPackages}});

            Object.freeze(manifestPackages);
            Object.freeze(result);


            let pluginMap = applicationUtil.getComponentPlugins(manifestPackages);
            t.isDeeply(pluginMap, result);

            pluginMap = applicationUtil.getComponentPlugins(manifestPackages,"foo.app.PackageController");
            t.isDeeply(pluginMap, result);

        });


        t.it("registerIoCBindings()", t => {

            const
                APP_BINDINGS = {},
                configSpy = t.spyOn(coon.core.ConfigManager, "get").and.callFake((domain, path) => {
                    if (domain === "APP" && path === "ioc.bindings") {
                        return APP_BINDINGS;
                    }
                }),
                containerSpy = t.spyOn(coon.core.ioc.Container, "bind").and.callFake(() => {});


            t.expect(applicationUtil.registerIoCBindings("domain")).toBeUndefined();
            t.expect(applicationUtil.registerIoCBindings("APP")).toEqual(APP_BINDINGS);

            t.expect(containerSpy.calls.count()).toBe(1);
            t.expect(containerSpy.calls.mostRecent().args[0]).toEqual(APP_BINDINGS);

            [configSpy, containerSpy].map(spy => spy.remove());

        });


    });

});
