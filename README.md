# @coon-js/extjs-lib-core ![MIT](https://img.shields.io/npm/l/@coon-js/extjs-lib-core) [![npm version](https://badge.fury.io/js/@coon-js%2Fextjs-lib-core.svg)](https://badge.fury.io/js/@coon-js%2Fextjs-lib-core)

This NPM package provides core functionality needed in ExtJS projects, and allows for
extended application configuration during runtime of an ExtJS-application.
This library also contains enhancements made to the PageMap-classes for dynamically adding/removing data from a BufferedStore.

## Installation
```bash
$ npm i --save-dev @coon-js/extjs-lib-core
```

For using the package as an external dependency in an application, use
```bash
$ npm i --save-prod @coon-js/extjs-lib-core
```
In your `app.json`, add this package as a requirement, and make sure your ExtJS `workspace.json`
is properly configured to look up local repositories in the `node_modules`-directory.

Example (`workspace.json`) :
```json 
{
  "packages": {
    "dir": "${workspace.dir}/node_modules/@l8js,${workspace.dir}/node_modules/@conjoon,${workspace.dir}/node_modules/@coon-js,${workspace.dir}/packages/local,${workspace.dir}/packages,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name},${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-treegrid,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-base,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-ios,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-material,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-aria,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-neutral,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-classic,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-gray,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-crisp,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-crisp-touch,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-neptune,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-neptune-touch,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-triton,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-graphite,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-material,${workspace.dir}/node_modules/@sencha/ext-calendar,${workspace.dir}/node_modules/@sencha/ext-charts,${workspace.dir}/node_modules/@sencha/ext-d3,${workspace.dir}/node_modules/@sencha/ext-exporter,${workspace.dir}/node_modules/@sencha/ext-pivot,${workspace.dir}/node_modules/@sencha/ext-pivot-d3,${workspace.dir}/node_modules/@sencha/ext-ux,${workspace.dir}/node_modules/@sencha/ext-font-ios",
    "extract": "${workspace.dir}/packages/remote"
  }
}
```

## Post-Install
[@coon-js/extjs-link](https://npmjs.org/coon-js/extjs-link) will start once the package was installed and guide you
through the process of creating symlinks to an existing ExtJS sdk installation.
This is only required if you want to run the tests (`./tests`), as [Siesta](https//npmjs.org/siesta-lite) relies on
an existing ExtJS installation.


## Configuration
### Environment-specific configuration files <a name="env_files"></a>
Application and Package configuration files will be looked up in the `resource path`, and then in the
folder that was configured with the `coon-js`-section of the application's `app.json`.
Example (*app.json*):
```json
{
    "production": {
        "coon-js" : {
            "resourcePath": "files",
            "env": "prod"
        }
    },
    "development": {
        "coon-js" : {
            "resourcePath": "files",
            "env": "dev"
        }
    }    
}

```
Depending on the build you are using (in this case either the `production`- or the `development`-build), configuration-files
will be looked up in `resources/files` (note that the `resources`-folder is the folder-name/path returned by a
call to `Ext.getResourcePath()`). A **coon.js**-Application will first query configuration files for the build that
is being used (by using the name pattern `[application_name].[coon-js.env].conf.json`), and if that file could
not be loaded and results in a **HTTP error**-code, loading will fall back to ```[application_name].conf.json```.
In short, environment-specific configuration files will always be given precedence over the default-configuration files.

For using specific package configuration files, see the section about **[Dynamic Package Loading](#dynpackload)**.

#### Layout of an application-configuration file <a name="app_conf"></a>
An application's configuration file need to contain valid json. The configuration needs to be an object
keyed under `[application_name].config`. For an application with the name `conjoon`, the layout needs to be
as follows:
```json
{
    "conjoon": {
    }
}
```
Note how the configuration has to be introduced with the name of the application the config is used in, in this case `conjoon`.

#### Sections considered within an application configuration file
The following sections are considered when reading out a **coon.js**-application configuration file:

 * `services`: services shared amongst modules, registered with `coon.core.ServiceProvider`
 * `application`: runtime related configuration for the application. Will be available via `coon.core.ConfigManager.get([application_name])`
 * `plugins`: Controller-/Component-Plugins that need to be registered for various targets
 * `packages`: Configuration for packages used by the application. Can also be used to disable/enable applications <a name="apppackages"></a>

#### Registering Services

Configuration for services that get registered with the `coon.core.ServiceProvider` is done by providing the abstract under which 
a concrete service can be found. Both the abstract and the concrete must extend `coon.core.service.Service`.

The following makes sure that during runtime an instance of `coon.core.service.GravatarService` is returned
for `coon.core.ServiceProvider.get("coon.core.service.UserImageService")`. This instance is a shared instance.

```json
{
  "conjoon": {
    "services": {
      "coon.core.service.UserImageService": {
        "xclass": "coon.core.service.GravatarService",
        "args": [
          {
            "params": {
              "d": "blank"
            } 
          }
        ]
      }
    }
  }
}
```

## Dynamic Package Loading <a name="dynpackload"></a>
**Note**: This is only available when the `packages`-section of the **[Application configuration](#apppackages)** was not set.
This Application implementation queries ```Ext.manifest``` for packages which are part of the `used`-configuration in
an application's `app.json`. Those packages need to have a `coon-js` section configured with a `package`-entry:
```json
{
    "coon-js": {
        "package" : {
            "autoLoad" : true
        }
    }    
}

```
If `autoLoad` is set to `true`, these packages will be loaded by this application implementation dynamically upon 
startup.
<br> If the `packageConfiguration` is configured with the `registerController` set to `true`, this package's 
`PackageController` - if any - will be registered with the application, and during startup, it's `preLaunchHook`-method
is called when the application is ready to settle into its `launch()`-method. If any of the registered `PackageController`s
`preLaunchHook` method returns `false`, the application's `launch()` will not be called.
```json
{
    "coon-js": {"package" : {"autoLoad" : {"registerController": true}}}
}
```

### Package Configurations
You can add configuration files to your packages which must follow the naming scheme
`[package_name].conf.json`. These configuration files must be placed in the folder as described with the
[coon-js\.env-section](#env_files).<br>
This folder now serves as the root for all configuration files for an **coon-js**-application.

Configuration files will be looked up if a package has the following section configured in its
package.json:
```json
{
    "coon-js": {
        "package" : {
            "config" : {}
        }
    }
}
```
or
```json
{
    "coon-js": {
        "package" : {
            "config" : true
        }
    }
}
```
or
```json
{
    "coon-js": {
        "package" : {
            "config" : "filename"
        }
    }
}
```
While the first two entries will fall back to the file name computed as described with the [coon-js\.env-section](#env_files),
the last example will define the file-name holding the application's configuration. This is convenient for larger
configurations that need to be separated from either the `package.json` of the owning package or the application-configuration
file. By default, the file will be looked up in the package's resource-folder. If a path is specified, this path is interpreted 
and resolved given the following template variables:
<br>
1. The following resolves to the resource-path of the owning package, depending on the build environment:
```json
{
    "autoLoad": {
        "registerController": true
    }, 
    "config": "extjs-app-webmail.conf.json"
}
```

```json
{
    "autoLoad": {
        "registerController": true
    }, 
    "config": "${package.resourcePath}/extjs-app-webmail.conf.json"
}
```


2. The following resolves to `resources/[coon-js.resourcePath]/extjs-app-webmail.conf.json` and represents a file available from the application's resources folder itself:
```json
{
    "autoLoad": {
        "registerController": true
    }, 
    "config": "${coon-js.resourcePath}/extjs-app-webmail.conf.json"
}
```
(in this case, configuration will be read out from the resources-folder of the application, not the package itself.)



<br>
The configuration's data is then registered with the [coon.core.ConfigManager](https://github.com/coon-js/extjs-lib-core/blob/master/src/ConfigManager.js)
and can be queried calling `coon.coore.ConfigManager.get([package_name])`. (For more information,
refer to the docs of [coon.core.ConfigManager](https://github.com/coon-js/extjs-lib-core/blob/master/src/ConfigManager.js).)
<br>
If any of the files described above exist, its configuration will override the default-configuration found in the```package.json```,
if any.

## Using plugins

### ...with PackageControllers
[coon.core.app.PackageController](https://github.com/coon-js/extjs-lib-core/blob/master/src/app/PackageController.js)
can have an arbitrary number of plugins of the type [coon.core.app.plugin.ControllerPlugin](https://github.com/coon-js/extjs-lib-core/blob/master/src/app/plugin/ControllerPlugin.js)
that are called by the application during the `preLaunchHook`-process. Regardless of the
state of the return-values of `PackageController`'s `preLaunchHook()`, all plugins will be executed during
the `preLaunchHookProcess`.<br>
For registering `PluginControllers`, either create them and add them to the `PackageController` by hand
by calling `coon.core.app.PackageController#addPlugin`, or use the package configuration as described above.
You can use the package-name to specify a single `ControllerPlugin` out of this package (it will be looked up in the
packages "app"-folder under the classname `[package-namespace].app.plugin.ControllerPlugin`), or by specifying the fqn
of the ControllerPlugins to load:

_package.json:_
<br>
(`plug-coon_themeutil` has the namespace `coon.plugin.themeutil`;
tries to create `coon.plugin.themeutil.app.plugin.ControllerPlugin` during application startup, must therefore be existing in memory)
```json
{
    "coon-js": {
        "package" : {
            "config" : {
                "plugins" : {
                    "controller" : ["plug-cn_themeutil"]
                }
            }
        }
    }
}
```

**or**
<br>
(tries to create `coon.plugin.themeutil.app.plugin.ControllerPlugin` during application startup, must therefore be existing in memory)
```json
{
    "coon-js": {
        "package" : {
            "config" : {
                "plugins" : {
                    "controller" : ["coon.plugin.themeutil.app.plugin.ControllerPlugin"]
                }
            }
        }
    }
}
```
A controller plugin can also be configured with arguments that get applied to the constructor of
the ControllerPlugin. For specifying constructor arguments, the configuration for the controller
plugin has to be an object with the keys `xclass` holding the fqn of the controller plugin, and
`args`, which is an array of argument that get passed to the constructor.

In the following example, `{property: "value"}` is passed as the first argument to the constructor:
```json
 {
    "coon-js": {
        "plugins": {
            "controller": [
                {
                    "xclass": "conjoon.cn_material.app.plugin.ControllerPlugin",
                    "args": [
                        {
                            "property": "value"
                        }
                    ]
                }
            ]
        }
    }
}
```

In order for a `PackageController` to use one or more `ControllerPlugin`(s), you need to set the
`coon-js.package.controller`\-property in the configuration to `true`. Otherwise, the controller will not get
registered as a `PackageController` for the application and will therefore not be loaded.

You can add as many plugins as you'd like in the configuration, and mix and match package names with fqns of
the `ControllerPlugins` you'd like to use.<br>
**Note:** You need to make sure that owning packages are defined as dependencies, if they are required by the 
`PackageController`'s package using them.<br>
For more information on `PackageController`-plugins, see [coon.core.app.plugin.ControllerPlugin](https://github.com/coon-js/extjs-lib-core/blob/master/src/app/plugin/ControllerPlugin.js).

### ...with the Application
An application based upon the `coon-js`-library can also be configured with plugins. These plugins are loaded 
globally into the application.<br>
Please use the application configuration for this, [as described above](#app_conf). The following is an example 
configuration for loading the [coon.plugin.themeutil.app.plugin.ApplicationPlugin](https://github.com/coon-js/extjs-plug-themeutil/blob/master/src/app/plugin/ApplicationPlugin.js):

```json
{
    "conjoon" : {
        "plugins": {
            "application" : [
                "extjs-plug-themeutil"
            ]
        }
    }
}
```

#### ComponentPlugins
**extjs-lib-core** provides funtionality to specify component-plugins using the application configuration file, or 
package configurations. <br>
Plugins referenced here need to be loaded via packages (i.e. by using `uses` in the `app.json`), or they need to 
have been made generally available by the application itself, i.e. by bundling those plugins in the build.<br>
A plugin configuration itself in the application-configuration has the following key/value-pairs:
- `cmp`: A valid component query the application uses to look up the represented component. 
- `event`: The name of the event that should be listened to for instantiating and registering the plugin
- `pclass`/`fclass`: The fqn (i.e. class name, including namespaces) for the plugin to use. If you are using a plugin that
extends `Ext.plugin.Abstract`, use `pclass`. If you are referencing a grid-feature (i.e. extending `Ext.grid.feature.Feature`), 
use `fclass`. 
  
_Example for specifying component plugins using the application configuration:_
```json
{
    "conjoon" : {
        "plugins": {
            "components": [
                {
                    "cmp": "cn_navport-tbar",
                    "pclass": "conjoon.theme.material.plugin.ModeSwitchPlugin",
                    "event": "beforerender"
                },
                {
                    "cmp": "cn_mail-mailmessagegrid",
                    "fclass": "conjoon.cn_mail.view.mail.message.grid.feature.PreviewTextLazyLoad",
                    "event": "cn_init"
                }
            ]
        }
    }
}
```

_Example for specifying component plugins using a package configuration:_
```json
{
    "coon-js": {
        "package" : {
            "config" : {
                "plugins" : {
                    "controller" : [
                        "plug-cn_themeutil"
                    ],
                    "components": [
                        {
                            "cmp": "cn_navport-tbar",
                            "pclass": "conjoon.theme.material.plugin.ModeSwitchPlugin",
                            "event": "beforerender"
                        },
                        {
                            "cmp": "cn_mail-mailmessagegrid",
                            "fclass": "conjoon.cn_mail.view.mail.message.grid.feature.PreviewTextLazyLoad",
                            "event": "cn_init"
                        }
                    ]
                }
            }
        }
    }
}
```

## Configuration best practices
It is recommended to use the `packages`-section of the application configuration to make sure the application
itself handles all the packages.<br>
For this, specifying the `packages`-section in the configuration file will make sure that packages defined here
completely overwrite the settings found in their original `package.json`. <br> 
Configuration of packages in the application configuration is the same as configuring packages in the associated
`package.json`, except for section keys used.

_Example for package configuration in the application configuration file:_
```json
{
    "conjoon": {
        "packages" : {
            "extjs-app-webmail" : {
                "autoLoad": {
                    "registerController": true
                },
                "config": "${coon-js.resourcePath}/extjs-app-webmail.conf.json"
            },
            "extjs-app-imapuser": {
                "autoLoad": {
                    "registerController": true
                },
                "config": {
                    "service": {
                        "rest-imapuser": {
                            "base": "https://php-ms-imapuser.ddev.site/rest-imapuser/api/v0"
                        }
                    }
                }
            }
        }
    }
}
```


## Real world examples
For an in-depth look at how to use the Application-classes found within this package,
refer to the documentation of  [extjs-comp-navport](https://github.com/coon-js/extjs-comp-navport).
A large configurable application built with *coon-js* can be found in the [conjoon](https://github.com/conjoon/conjoon)-repository.


### Development notes

#### Naming
The following naming conventions apply:

#### Namespace
`coon.core.*`
#### Package name
`extjs-lib-core`
#### Shorthand to be used with providing aliases
`cn_core`

**Example:**
Class `coon.core.data.proxy.RestForm` has the alias `proxy.cn_core-dataproxyrestform`

### Requirements
This Package needs ExtJS 6.7 for dynamic package loading. The PageMap-enhancements are
working with ExtJS 6.2 and up.

## Tests
Tests are written with [Siesta](https://bryntum.com/siesta)

```bash
$ npm run setup:tests
$ npm test
```
