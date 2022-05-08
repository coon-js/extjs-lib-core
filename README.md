# @coon-js/extjs-lib-core ![MIT](https://img.shields.io/npm/l/@coon-js/extjs-lib-core) [![npm version](https://badge.fury.io/js/@coon-js%2Fextjs-lib-core.svg)](https://badge.fury.io/js/@coon-js%2Fextjs-lib-core)

This NPM package provides core functionality needed in Ext JS projects, and allows for
extended application configuration during runtime of an Ext JS-application.
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

## Documentation
Refer to the [Documentation](./docs) for further information.

## Post-Install
[@coon-js/extjs-link](https://npmjs.org/coon-js/extjs-link) will start once the package was installed and guide you
through the process of creating symlinks to an existing ExtJS sdk installation.
This is only required if you want to run the tests (`./tests`), as [Siesta](https//npmjs.org/siesta-lite) relies on
an existing ExtJS installation.

### Development notes

#### Naming
The following naming conventions apply:
**Namespace** `coon.core.*`
**Package-name** `extjs-lib-core`
**Shorthand** `cn_core` (e.g. class `coon.core.data.proxy.RestForm` has the alias `proxy.cn_core-dataproxyrestform`)

### Requirements
This Package needs ExtJS 6.7 for dynamic package loading. The PageMap-enhancements are
working with ExtJS 6.2 and up.

## Tests
Tests are written with [Siesta](https://bryntum.com/siesta)

```bash
$ npm run build:test
$ npm test
```
