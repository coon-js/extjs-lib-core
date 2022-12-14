# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.0.1](https://github.com/coon-js/extjs-lib-core/compare/v1.0.0...v1.0.1) (2022-12-14)


### Bug Fixes

* **build:** delorean config not reverted before release ([b865ac0](https://github.com/coon-js/extjs-lib-core/commit/b865ac0bcd3417ae129fce974685393c5daa06d2))

## [1.0.0](https://github.com/coon-js/extjs-lib-core/compare/v0.8.3...v1.0.0) (2022-12-14)


### Features

* add coon.core.data.request.Configurator ([4a861bd](https://github.com/coon-js/extjs-lib-core/commit/4a861bd17d25c3704660dcfc185770a952fbc026)), closes [conjoon/extjs-app-webmail#255](https://github.com/conjoon/extjs-app-webmail/issues/255)
* add coon.core.data.request.Configurator ([87cd918](https://github.com/coon-js/extjs-lib-core/commit/87cd918236ee00bc41a174e58cb17b480b6e083b)), closes [conjoon/extjs-app-webmail#255](https://github.com/conjoon/extjs-app-webmail/issues/255)
* add ioc-Container ([cd68882](https://github.com/coon-js/extjs-lib-core/commit/cd688822b31e190b1a053317cd82721138e4f101)), closes [conjoon/extjs-app-webmail#255](https://github.com/conjoon/extjs-app-webmail/issues/255)
* allow for $refs in bindings according to JSON schema ([0814690](https://github.com/coon-js/extjs-lib-core/commit/0814690b1dd4cc7c2247f92aa7de959a2a81b20e)), closes [coon-js/extjs-lib-core#93](https://github.com/coon-js/extjs-lib-core/issues/93)
* allow for configuration of target specifics instead of just class names ([07c4ce3](https://github.com/coon-js/extjs-lib-core/commit/07c4ce30bf95d912c26910d137199f7c66a2498d)), closes [coon-js/extjs-lib-core#93](https://github.com/coon-js/extjs-lib-core/issues/93)
* config considers IoC-bindings from packages and apps ([f81d27d](https://github.com/coon-js/extjs-lib-core/commit/f81d27dea72d09377edf4d7681752867e0da2910)), closes [conjoon/extjs-app-webmail#255](https://github.com/conjoon/extjs-app-webmail/issues/255)


### Bug Fixes

* "classresolved"-observer has no constructorInjector available ([722f4c5](https://github.com/coon-js/extjs-lib-core/commit/722f4c5777043cd7f9f268da4595d0b9f93cea65)), closes [conjoon/extjs-app-webmail#255](https://github.com/conjoon/extjs-app-webmail/issues/255)
* constructor cfg-object overwritten with already existing dependencies ([8a73f08](https://github.com/coon-js/extjs-lib-core/commit/8a73f088434088e3d7a9565fe5ecaae2748f55fd)), closes [coon-js/extjs-lib-core#92](https://github.com/coon-js/extjs-lib-core/issues/92)
* ioc throws error if Ext.create's 1st arg is an object w/ alias ([b2019ef](https://github.com/coon-js/extjs-lib-core/commit/b2019efaa4b0f552434c88871fd888726a574983)), closes [conjoon/extjs-app-webmail#255](https://github.com/conjoon/extjs-app-webmail/issues/255)

### [0.8.3](https://github.com/coon-js/extjs-lib-core/compare/v0.8.2...v0.8.3) (2022-11-14)


### Bug Fixes

* application breaks for controller plugin w/o args ([95940a0](https://github.com/coon-js/extjs-lib-core/commit/95940a086b190453e77a9a29817c2ba1ba66a5a6)), closes [coon-js/extjs-lib-core#88](https://github.com/coon-js/extjs-lib-core/issues/88)

### [0.8.2](https://github.com/coon-js/extjs-lib-core/compare/v0.8.1...v0.8.2) (2022-05-16)


### Bug Fixes

* build throws error for arrow function's argument list ([1cb287b](https://github.com/coon-js/extjs-lib-core/commit/1cb287b6cd1687577a0bc112079463ea91a1afdf)), closes [coon-js/extjs-lib-core#85](https://github.com/coon-js/extjs-lib-core/issues/85)

### [0.8.1](https://github.com/coon-js/extjs-lib-core/compare/v0.8.0...v0.8.1) (2022-05-14)


### Features

* add a ServiceLocator and provide config options for auto-registering services ([232a1be](https://github.com/coon-js/extjs-lib-core/commit/232a1be2ccbe647e174954b927627b2c9bbb0048)), closes [conjoon/conjoon#12](https://github.com/conjoon/conjoon/issues/12)


### Bug Fixes

* ApplicationPlugins not loaded when fqn has application's namespace ([73f20e5](https://github.com/coon-js/extjs-lib-core/commit/73f20e5fc2af42d706481e7bba57b70d0bd5b5e3)), closes [coon-js/extjs-lib-core#81](https://github.com/coon-js/extjs-lib-core/issues/81)

## [0.8.0](https://github.com/coon-js/extjs-lib-core/compare/v0.7.2...v0.8.0) (2022-04-21)


### Features

* allow args to be defined in config for plugins ([d44f1fb](https://github.com/coon-js/extjs-lib-core/commit/d44f1fbde8e930cc9183a918d26d190ebeb5a484)), closes [coon-js/extjs-lib-core#76](https://github.com/coon-js/extjs-lib-core/issues/76)

### [0.7.2](https://github.com/coon-js/extjs-lib-core/compare/v0.7.1...v0.7.2) (2022-01-14)


### Bug Fixes

* fix wrong version prefix for allowing broader range of version compatibility ([a0fa764](https://github.com/coon-js/extjs-lib-core/commit/a0fa764d934eb591e9230cbef5223ed7a33b8db4))

### [0.7.1](https://github.com/coon-js/extjs-lib-core/compare/v0.7.0...v0.7.1) (2022-01-14)

## [0.7.0](https://github.com/coon-js/extjs-lib-core/compare/v0.6.1...v0.7.0) (2022-01-13)


### Features

* add component plugin config to package configuration ([8fcd3d5](https://github.com/coon-js/extjs-lib-core/commit/8fcd3d5120e3f74afc19e304499b95a9fafaee8d)), closes [coon-js/extjs-lib-core#46](https://github.com/coon-js/extjs-lib-core/issues/46)
* add option to application config to specify component plugins ([95b7fae](https://github.com/coon-js/extjs-lib-core/commit/95b7fae5cd672f2571bdd7c46f20001be65d91e1)), closes [coon-js/extjs-lib-core#43](https://github.com/coon-js/extjs-lib-core/issues/43)
* allow for package configurations in application config ([ce86f2b](https://github.com/coon-js/extjs-lib-core/commit/ce86f2bfecaba24ef198c0c83c187583b0fb0dd1)), closes [conjoon/extjs-app-webmail#189](https://github.com/conjoon/extjs-app-webmail/issues/189)
* allow for template vars in config option for file locations ([d6918db](https://github.com/coon-js/extjs-lib-core/commit/d6918dbdd469f379045d33208da73b23dcdb9fd7)), closes [coon-js/extjs-lib-core#58](https://github.com/coon-js/extjs-lib-core/issues/58)
* controller plugin consumes constructor arguments ([5b6e6e5](https://github.com/coon-js/extjs-lib-core/commit/5b6e6e5570115c3ff063a2bc5540baa9fd63fabc)), closes [coon-js/extjs-lib-core#49](https://github.com/coon-js/extjs-lib-core/issues/49)


### Bug Fixes

* controller plugins in configuration files are now considered properly ([2ceebff](https://github.com/coon-js/extjs-lib-core/commit/2ceebffbf656e864e034ae18237a5a4d1418a5c0)), closes [coon-js/extjs-lib-core#47](https://github.com/coon-js/extjs-lib-core/issues/47)

### [0.6.1](https://github.com/coon-js/extjs-lib-core/compare/v0.6.0...v0.6.1) (2021-10-08)
