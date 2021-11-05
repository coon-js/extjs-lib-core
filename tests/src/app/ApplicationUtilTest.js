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

StartTest((t) => {
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
                t.expect(spy.calls.all()[0].args[2]).toBe(`${appName}.config`);

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

        t.it("constructor sets up properly", (t) => {

            t.isInstanceOf(applicationUtil.batchConfigLoader, "coon.core.app.BatchConfigLoader");
            t.isInstanceOf(applicationUtil.configLoader, "coon.core.app.ConfigLoader");
            t.expect(applicationUtil.batchConfigLoader.configLoader).toBe(applicationUtil.configLoader);

        });


        t.it("getCoonPackages()", (t) => {

            const manifestPackages = {
                    foo: {
                        included: false,
                        namespace: "foo",
                        "coon-js": {package: true}
                    },
                    bar: {
                        included: true,
                        namespace: "com.bar",
                        "coon-js": {package: {controller: true}}
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
                        "coon-js": {package: true}
                    },
                    "bar": {
                        included: true,
                        namespace: "com.bar",
                        "coon-js": {
                            package: {
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


        t.it("getApplicationConfigUrls()", (t) => {

            setupEnvironment({manifest: {name: "appname", "coon-js": {env: "testing"}}});

            let defaultPath = "fixtures/coon-js/appname.conf.json",
                envPath =  "fixtures/coon-js/appname.testing.conf.json";

            t.expect(applicationUtil.getApplicationConfigUrls()).toEqual({
                default: defaultPath,
                environment: envPath
            });

        });


        t.it("getPackageNameForController()", (t) => {

            const manifest =  {
                foo: {
                    included: false,
                    namespace: "foo",
                    "coon-js": {package: {controller: "FOOBAR"}}
                },
                bar: {
                    included: true,
                    namespace: "com.bar",
                    "coon-js": {package: {controller: true}}
                },
                snafu: {
                    included: false,
                    namespace: "snafu",
                    "coon-js": {package: true}
                }
            };

            t.expect(applicationUtil.getPackageNameForController("com.bar.app.PackageController", manifest)).toBe("bar");
            t.expect(applicationUtil.getPackageNameForController("FOOBAR", manifest)).toBe("foo");
            t.expect(applicationUtil.getPackageNameForController("snafuctrl", manifest)).toBeUndefined();

        });


        t.it("getComponentPlugins()", t => {

            const PLUGINCFG = {};
            t.expect(applicationUtil.getComponentPlugins({})).toEqual({});
            t.expect(applicationUtil.getComponentPlugins({
                "plugins": PLUGINCFG
            })).toBe(PLUGINCFG);


        });

        t.it("getControllerPlugins()", (t) => {

            const manifestPackages =  {
                    foo: {
                        included: false,
                        namespace: "foo",
                        "coon-js": {package: {controller: true, config: {plugins: {controller: ["bar", "snafu.Controller"]}}}}
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
                    }
                },
                result = {
                    "foo.app.PackageController": [
                        "com.bar.app.plugin.ControllerPlugin",
                        "snafu.Controller"
                    ],
                    "mycustom.Controller": [
                        "some.acme.controller.Plugin"
                    ]
                };

            setupEnvironment({manifest: {packages: manifestPackages}});

            Object.freeze(manifestPackages);
            Object.freeze(result);

            t.isDeeply(applicationUtil.getControllerPlugins(manifestPackages), result);


            t.isDeeply(applicationUtil.getControllerPlugins({foobar: {}}), {});
        });


        t.it("getApplicationPlugins()", (t) => {

            const
                applicationConfig = {
                    "application": {
                        "plugins": [
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

            t.isDeeply(applicationUtil.getApplicationPlugins(applicationConfig, manifestPackages), result);
        });


        t.it("loadApplicationConfig() - no env-property in manifest available", async t => {
            const appName = "foo";
            setupEnvironment({manifest: {name: appName}});

            let spy = t.spyOn(applicationUtil.configLoader, "load").and.callFake(async () => {});

            applicationUtil.loadApplicationConfig();

            t.expect(spy).toHaveBeenCalled(1);
            t.expect(spy.calls.mostRecent().args[0]).toBe(appName);
            t.expect(spy.calls.mostRecent().args[1]).toBeUndefined();
            t.expect(spy.calls.mostRecent().args[2]).toBe(appName + ".config");
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
            setupEnvironment({manifest: {name: appName, "coon-js": {"resources": "coon-js", env: "dev"}}});

            let spy = t.spyOn(applicationUtil.configLoader, "load").and.callThrough();

            t.expect(await applicationUtil.loadApplicationConfig()).toEqual({defaultfile: "found"});

            t.expect(spy).toHaveBeenCalled(1);
        });


        t.it("loadApplicationConfig() - env-property (dev)  not available, default file found in default resources", async t => {

            // mock will have default path set tp "fixtures"
            const appName = "defaultfilefound";
            setupEnvironment({manifest: {name: appName}});

            let spy = t.spyOn(applicationUtil.configLoader, "load").and.callThrough();

            t.expect(await applicationUtil.loadApplicationConfig()).toEqual({defaultfile: "found"});

            t.expect(spy).toHaveBeenCalled(1);
        });


        t.it("loadApplicationConfig() - env-property (dev) available, env file found", async t => {
            const appName = "envfilefound";
            setupEnvironment({manifest: {name: appName, "coon-js": {"resources": "coon-js", "env": "dev"}}});

            let spy = t.spyOn(applicationUtil.configLoader, "load").and.callThrough();

            t.expect(await applicationUtil.loadApplicationConfig()).toEqual({envfile: "found"});

            t.expect(spy).toHaveBeenCalled(1);

        });

        t.it("loadApplicationConfig() - env-property (dev) available, exception thrown", async t => {
            await loadApplicationConfigExceptionTemplate(t, {env: "dev"});
        });


        t.it("loadApplicationConfig() - env-property (dev) not available, exception thrown", async t => {
            await loadApplicationConfigExceptionTemplate(t);
        });


        t.it("loadPackages()", async (t) => {
            const appName = "testapp";

            setupEnvironment({manifest: {
                name: appName,
                packages: {
                    foo: {
                        name: "foo",
                        namespace: "foo",
                        "coon-js": {
                            package: {
                                controller: true
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
                "bar": {conf: "set"}
            });

            t.isDeeply(ctrls, ["foo.app.PackageController"]);
            t.expect(batchLoaderSpy).toHaveBeenCalled(1);
            t.expect(envLoaderSpy).toHaveBeenCalled(2);
            t.expect(envLoaderSpy.calls.all()[0].args[0]).toBe("foo");
            t.expect(envLoaderSpy.calls.all()[1].args[0]).toBe("bar");

            envLoaderSpy.remove();

        });


    });

});
