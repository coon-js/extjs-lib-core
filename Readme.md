# lib-cn_core [![Build Status](https://travis-ci.org/coon-js/lib-cn_core.svg?branch=master)](https://travis-ci.org/coon-js/lib-cn_core)
This **Sencha ExtJS** package contains core functionality for the coon.js 
project.
Files found herein represent "universal" code, i.e. there are no 
view implementations in this package, but rather code that can
support views.  

## Naming
The following naming conventions apply:

#### Namespace
`coon.core.*`
#### Package name
`lib-cn_core`
#### Shorthand to be used with providing aliases
`cn_core`

**Example:**
Class `coon.core.data.proxy.RestForm` has the alias `proxy.cn_core-dataproxyrestform`

## Requirements
This Package needs ExtJS 6.7 for dynamic package loading. The PageMap-enhancements are
working with ExtJS 6.2 and up.
### Package Requirements
This package requires the [package-loader](https://www.sencha.com/blog/create-a-smooth-loading-experience-for-large-enterprise-apps-with-sencha-cmd/) package from Sencha.

## Tests
Tests are written with [Siesta](https://bryntum.com/siesta)