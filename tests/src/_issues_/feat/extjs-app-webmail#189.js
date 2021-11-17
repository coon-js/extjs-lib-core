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


StartTest(t => {

    t.requireOk(
        "coon.core.env.VendorBase",
        "coon.core.FileLoader",
        "coon.core.Environment", () => {

            const
                RESOURCE_PATH = "./fixtures/";

            let loader, batchLoader;

            const setupVendorBase = (keyFunc) => {
                    coon.core.Environment._vendorBase = undefined;

                    let vendorBase = Ext.create("coon.core.env.VendorBase");
                    vendorBase.getPathForResource = (resource) => RESOURCE_PATH + "/" + resource;
                    vendorBase.getManifest = keyFunc;
                    coon.core.Environment.setVendorBase(vendorBase);
                },
                createApplicationUtilSpies = () => {
                    const
                        applicationUtil = Ext.create("coon.core.app.ApplicationUtil"),
                        batchLoader = applicationUtil.batchConfigLoader,
                        batchSpy = t.spyOn(batchLoader, "load").and.callFake(() => ({})),
                        domainSpy = t.spyOn(batchLoader, "addDomain"),
                        configSpy = t.spyOn(coon.core.ConfigManager, "register"),
                        loadPkgSpy = t.spyOn(coon.core.Environment, "loadPackage");

                    return {
                        applicationUtil,
                        batchLoader,
                        batchSpy,
                        domainSpy,
                        configSpy,
                        loadPkgSpy
                    };
                };

            t.beforeEach(function () {

                loader = Ext.create(
                    "coon.core.app.ConfigLoader",
                    coon.core.FileLoader
                );

                batchLoader = Ext.create("coon.core.app.BatchConfigLoader", loader);

                setupVendorBase((key) => {
                    switch (key) {
                    case "coon-js.resourceFolder":
                        return "coon-js";
                    case "coon-js.env":
                        return "testing";
                    }
                });
            });

            t.afterEach(function () {

                loader.destroy();
                loader = null;

                coon.core.ConfigManager.configs = {};
                coon.core.Environment._vendorBase = undefined;

            });

            // +----------------------------------------------------------------------------
            // |                    =~. Tests .~=
            // +----------------------------------------------------------------------------


            t.it("ConfigLoader.load() - do not register with ConfigManager", async t => {
                const expected = {
                    "config": {
                        "foo": "bar"
                    }
                };
                t.expect(coon.core.ConfigManager.get("mockDomain")).toBeUndefined();
                let config = await loader.load("mockDomain", undefined, undefined, false);
                t.expect(config).toEqual(expected);
                t.expect(coon.core.ConfigManager.get("mockDomain")).toBeUndefined();
            });


            t.it("BatchConfigLoader.loadDomain() - fileName in config", async (t) => {
                const
                    loadSpy = t.spyOn(batchLoader.configLoader, "load").and.callFake(() => ({})),
                    Environment = coon.core.Environment;

                await batchLoader.loadDomain("domain", {fileName: "configFile"});

                t.expect(loadSpy.calls.mostRecent().args[1]).toBe(
                    Environment.getPathForResource(Environment.getManifest("coon-js.resourceFolder") + "/configFile")
                );

                loadSpy.remove();
            });


            t.it("ApplicationUtil.loadPackages() - loadFromFile=false", async t => {

                const {
                        applicationUtil,
                        loadPkgSpy,
                        batchSpy,
                        domainSpy,
                        configSpy
                    } = createApplicationUtilSpies(),
                    config = {"property": "value"};

                t.expect(await applicationUtil.loadPackages({
                    "conjoon": {
                        "namespace": "org.conjoon",
                        "coon-js": {
                            "package": {
                                "autoLoad": false,
                                "loadFromFile": false,
                                "config": config
                            }
                        }
                    }})).toEqual([]);

                t.expect(configSpy.calls.mostRecent().args).toEqual(["conjoon", config]);
                t.expect(loadPkgSpy.calls.count()).toBe(0);
                t.expect(coon.core.ConfigManager.get("conjoon")).toEqual(config);
                t.expect(domainSpy.calls.count()).toBe(0);

                [loadPkgSpy, batchSpy, domainSpy, configSpy].map(spy => spy.remove());
            });


            t.it("ApplicationUtil.loadPackages() - config is fileName", async t => {

                const {
                    applicationUtil,
                    loadPkgSpy,
                    batchSpy,
                    domainSpy,
                    configSpy
                } = createApplicationUtilSpies();

                t.expect(await applicationUtil.loadPackages({
                    "conjoon": {
                        "namespace": "org.conjoon",
                        "coon-js": {
                            "package": {
                                "config": "fileName"
                            }
                        }
                    }})).toEqual([]);

                t.expect(configSpy.calls.count()).toBe(0);
                t.expect(loadPkgSpy.calls.count()).toBe(1);
                t.expect(domainSpy.calls.mostRecent().args).toEqual([
                    "conjoon", {}, "fileName"
                ]);

                [loadPkgSpy, batchSpy, domainSpy, configSpy].map(spy => spy.remove());
            });


            t.it("Application.onProfilesReady()", async t => {
                coon.core.Environment._vendorBase = undefined;

                const
                    protSpyProf = t.spyOn(Ext.app.Application.prototype, "onProfilesReady").and.callFake(() => []),
                    protSpyCons = t.spyOn(Ext.app.Application.prototype, "constructor").and.callFake(() => []),
                    app = Ext.create("coon.core.app.Application", {name: "conjoonTest", mainView: "Ext.Panel"}),
                    loadSpy = t.spyOn(app.applicationUtil, "loadApplicationConfig").and.callFake(() => ({})),
                    initPSpy = t.spyOn(app, "initPackagesAndConfiguration").and.callFake(() => []),
                    initASpy = t.spyOn(app, "initApplicationConfigurationAndPlugins").and.callFake(() =>{});

                t.expect(await app.onProfilesReady()).toEqual([]);

                t.expect(loadSpy.calls.count()).toBe(1);

                [protSpyProf, protSpyCons, initPSpy, initASpy].map(spy => spy.remove());
            });


            t.it("Application.initApplicationConfigurationAndPlugins()", t => {

                coon.core.Environment._vendorBase = undefined;

                const
                    appName = "conjoonTest",
                    manifestPackages = {},
                    appConf = {
                        "application": {},
                        "plugins": [],
                        "packages": {}
                    },
                    confSpy = t.spyOn(coon.core.ConfigManager, "get").and.callFake(
                        domain => domain === "conjoonTest" ? appConf : undefined
                    ),
                    envSpy = t.spyOn(coon.core.Environment, "getPackages").and.returnValue(manifestPackages),
                    protSpyProf = t.spyOn(Ext.app.Application.prototype, "onProfilesReady").and.callFake(() => []),
                    protSpyCons = t.spyOn(Ext.app.Application.prototype, "constructor").and.callFake(() => []),
                    app = Ext.create("coon.core.app.Application", {name: appName, mainView: "Ext.Panel"}),
                    nameSpy = t.spyOn(app, "getName").and.returnValue(appName),
                    plugSpy = t.spyOn(app.applicationUtil, "getApplicationPlugins").and.callFake(() => []);

                app.initApplicationConfigurationAndPlugins();

                t.expect(confSpy.calls.count()).toBe(1);
                t.expect(confSpy.calls.mostRecent().args[0]).toBe(app.getName());

                t.expect(plugSpy.calls.mostRecent().args).toEqual([appConf, manifestPackages]);

                [envSpy, nameSpy, plugSpy, protSpyProf, protSpyCons].map(spy => spy.remove());
            });


            t.it("Application.initPackagesAndConfiguration()", async t => {

                coon.core.Environment._vendorBase = undefined;

                let packageControllers = [],
                    manifestPackages = {
                        "mail": {
                            "namespace": "conjoon",
                            "coon-js": {
                                "package": {}
                            }
                        },
                        "contacts": {
                            "namespace": "conjoon.contacts"
                        },
                        "todo": {
                            "namespace": "todo",
                            "coon-js": {
                                "package": {
                                    "autoLoad": false
                                }
                            }
                        },
                        "calendar": {
                            "namespace": "calendar",
                            "coon-js": {
                                "package": {
                                    "autoLoad": true,
                                    "config": {"key": "value"}
                                }
                            }
                        },
                        "messages": {
                            "namespace": "messages"
                        }
                    },

                    appConfPackages = {
                        "mail": {
                            "autoLoad": {"registerController": true}
                        },
                        "contacts": {
                            "autoLoad": true,
                            "config": {"key": "value"}
                        },
                        "messages": {
                            "autoLoad": true,
                            "config": "config.json"
                        }
                    };

                const
                    appPrototype = coon.core.app.Application.prototype,
                    mock = {
                        applicationUtil: {
                            loadPackages: function () {}
                        }
                    },
                    envSpy = t.spyOn(coon.core.Environment, "getPackages").and.callFake(() => manifestPackages),
                    loadPkgSpy = t.spyOn(mock.applicationUtil, "loadPackages").and.callFake(() => packageControllers);

                t.expect(await appPrototype.initPackagesAndConfiguration.call(mock, appConfPackages)).toBe(packageControllers);
                t.isDeeply(loadPkgSpy.calls.mostRecent().args, [{
                    "mail": {
                        "coon-js": {
                            "package": {
                                "autoLoad": {"registerController": true}
                            }
                        },
                        "namespace": "conjoon"
                    },
                    "contacts": {
                        "coon-js": {
                            "package": {
                                "autoLoad": true,
                                "config": {"key": "value"},
                                "loadFromFile": false
                            }
                        },
                        "namespace": "conjoon.contacts"
                    },
                    "calendar": {
                        "namespace": "calendar",
                        "coon-js": {
                            "package": {
                                "autoLoad": true,
                                "config": {"key": "value"}
                            }
                        }
                    },
                    "messages": {
                        "namespace": "messages",
                        "coon-js": {
                            "package": {
                                "autoLoad": true,
                                "config": "config.json",
                                "loadFromFile": true
                            }
                        }
                    }
                }]);

                t.expect(manifestPackages.contacts).toEqual({
                    "namespace": "conjoon.contacts"
                });

                [loadPkgSpy, envSpy].map(spy => spy.remove());
            });

        });

});
