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
### Environment-specific configuration files
Application and Package configuration files will be looked up in the ```resources```-folder, and then in the
folder which's name can be configured in the ```coon-js```-section of the application's ```app.json```.
Example (*app.json*):
```json
"production": {
"coon-js" : {"resources" : "files", "env" : "prod"}
},
"development": {
"coon-js" : {"resources" : "files", "env" : "dev"}
},
```
Depending on the build you are using (in this case either the "production"- or the "development"-build), configuration-files
will be looked up in "resources/files" (note that the "resources"-folder is the folder-name/path returned by a
call to ```Ext.getResourcePath()```). A coon.js-Application will first query configuration files for the build that
is being used (by using the name pattern ```[application_name|package_name].[coon-js.env].conf.json```), and if that file could
not be loaded and results in a HTTP error-code, the mechanism will fall back to ```[application_name|package_name].conf.json```.
In short, environment-specific configuration files will always be given precedence over the default-configuration files.

For using specific package configuration files, see the section about **[Dynamic Package Loading](#dynpackload)**.

#### Layout of an application-configuration file <a name="app_conf"></a>
An application's configuration file need to contain valid json. The configuration needs to be an object
keyed under `[application_name].config`. For an application with the name `conjoon`, the layout needs to be
as follows:
```json
{
    "conjoon" : {
        "config" : {
            // this is the actual object that gets looked up and registered with the ConfigManager.   
        }
    }
}
```
Note how the configuration has to be introduced with the name of the application the config is used in, in this case `conjoon`.

## Dynamic Package Loading <a name="dynpackload"></a>
This Application implementation queries ```Ext.manifest``` for packages which are defined as
"used" in ```app.json``` and have the ```coon-js``` section configured with an entry ```packageController```
configured:
```
"coon-js": {"package" : {"controller" : true}}
```
Theses packages will be loaded by this application implementation dynamically, and
this application will make sure that all packages are loaded before the regular
application startup pipeline is continued.
We're actively overwriting ```onProfilesReady``` with an ```async``` implementation for this.

Any predefined ```launch()```-method will only be called if the ```preLaunchHook()```-process
returns true.
```preLaunchHook()``` will also take care of properly setting the ```MainView``` up if, and only
if all associated ```PackageController```s will return true in their ```preLaunchHook()```.

### Package Configurations
You can add configuration files to your packages which must follow the naming scheme
```[package_name].conf.json```. These configuration files must be placed in the ```resources```-folder
of the owning application, e.g. for the package ```myPackage``` and the app ```myApp``` using the following path:
```/myApp/resources/coon-js/myPackage.conf.json```.
Please note the ```coon-js```-directory name. This is adjustable by specifying a ```coon-js```-section
in your ```app.json``` file:
```
"coon-js": {"resources" : "coon-js"}
```
If you omit this setting, configuration files will be looked up directly in the ```resources```-folder.
This folder serves as the root for all configuration files for an **extjs-cn_core**-application.

Configuration files will be looked up if a package has the following section configured in its
package.json:
```
"coon-js": {"package" : {"config" : {}}}
```
or
```
"coon-js": {"package" : {"config" : true}}
```

This section can also hold configuration data that is then registered with the [coon.core.ConfigManager](https://github.com/coon-js/extjs-lib-core/blob/master/src/ConfigManager.js).
It can then be queried using a call to ```coon.coore.ConfigManager.get("myPackage")```. For more information,
refer to the docs of [coon.core.ConfigManager](https://github.com/coon-js/extjs-lib-core/blob/master/src/ConfigManager.js).
If a package holds a configuration entry in the above described section, its configuration file
will automatically be queried, resulting in a 404 if not specified. No further error-handling will happen when attempts
to loading configuration-files result in a HTTP-error.
If the file exists, its configuration will override the default-configuration found in the```package.json```,
if any.

## Using plugins

### ...with PackageControllers
[coon.core.app.PackageController](https://github.com/coon-js/extjs-lib-core/blob/master/src/app/PackageController.js)
can have an arbitrary number of plugins of the type [coon.core.app.plugin.ControllerPlugin](https://github.com/coon-js/extjs-lib-core/blob/master/src/app/plugin/ControllerPlugin.js)
that are called by the application during the ```preLaunchHook```-process. Regardless of the
state of the return-values of ```PackageController```'s ```preLaunchHook()```, all plugins will be executed during
the ```preLaunchHookProcess```.
For registering ```PluginControllers```, either create them and add them to the ```PackageController``` by hand
by calling ```coon.core.app.PackageController#addPlugin```, or use the package configuration as described above.
You can use the package-name to specify a single ```ControllerPlugin``` out of this package (it will be looked up in the
packages "app"-folder under the classname ```[package-namespace].app.plugin.ControllerPlugin```), or by specifying the fqn
of the ControllerPlugins to load:

package.json:
```json
// plug-coon_themeutil has the namespace coon.plugin.themeutil
// tries to create coon.plugin.themeutil.app.plugin.ControllerPlugin during application startup, must therefore be existing in memory
"coon-js": {"package" : {"config" : {"plugins" : {"controller" : ["plug-cn_themeutil"]}}}}
```

or

```json
// tries to create coon.plugin.themeutil.app.plugin.ControllerPlugin during application startup, must therefore be existing in memory
"coon-js": {"package" : {"config" : {"plugins" : {"controller" : ["coon.plugin.themeutil.app.plugin.ControllerPlugin"]}}}}
```

In order for a ```PackageController``` to use one or more ```ControllerPlugin```(s), you need to set the
```coon-js.package.controller```\-property in the configuration to ```true```. Otherwise, the controller will not get
registered as a ```PackageController``` for the application and will therefor not be loaded.

You can add as many plugins as you'd like in the configuration, and mix and match package names with fqns of
the ```ControllerPlugins``` you'd like to use.
Note: You need to make sure that owning packages are required by the ```PackageController```'s package using them.
For more information on ```PackageController```-plugins, see [coon.core.app.plugin.ControllerPlugin](https://github.com/coon-js/extjs-lib-core/blob/master/src/app/plugin/ControllerPlugin.js).

### ...with the Application
An application based upon the `coon-js`-library can also be configured with plugins. These plugins are loaded globally into the application.
Please use the application configuration for this, [as described above](#app_conf). The following is an example configuration for
loading the [coon.plugin.themeutil.app.plugin.ApplicationPlugin](https://github.com/coon-js/extjs-plug-themeutil/blob/master/src/app/plugin/ApplicationPlugin.js):

```json
{
    "conjoon" : {
        "config" : {
            "application" : {
                "plugins" : [
                    "extjs-plug-themeutil"
                ]
            }
        }
    }
}
```

### ... with Components
**extjs-lib-core** provides funtionality to specify component-plugins using the application configuration file. Plugins
referenced here need to be loaded via packages (i.e. by using `uses` in the `app.json`), or they need to have been made
generally available over the application itself, i.e. by bundling those plugins in the build.<br>
A plugin configuration itself in the application-configruation has teh following key/value-pairs:
- `cmp`: A valid component query the application uses to look up the represented component. 
- `event`: The name of the event that should be listened to for instantiating and registering the plugin
- `pclass`/`fclass`: The fqn (i.e. class name, including namespaces) for the plugin to use. If you are using a plugin that
extends `Ext.plugin.Abstract`, use `pclass`. If you are referencing a grid-feature (i.e. extending `Ext.grid.feature.Feature`), 
use `fclass`. 
```json
{
    "conjoon" : {
        "config": {
            "plugins": [
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

## Real world examples
For an in-depth look at how to use the Application-classes found within this package,
refer to the documentation of  [extjs-comp-navport](https://github.com/coon-js/extjs-comp-navport).
A large configurable application built with *coon-js* can be found in the [conjoon](https://github.com/conjoon/conjoon)\-repository.


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
