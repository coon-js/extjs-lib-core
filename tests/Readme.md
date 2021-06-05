# extjs-lib-core - Tests - Read Me

extjs-lib-core uses [Siesta](http://bryntum.com) for Unit/UI testing.

## Configuration
Make sure you download Siesta and set the paths to the resources properly 
in the files *index.html.template* and *tests.config.js.template*, then 
rename them:

```
index.html.template -> index.html
tests.config.js.template -> tests.config.js
```

## Using Modern/ Classic Toolkit for the tests
 - To run the tests with the classic toolkit, append the query string `toolkit=classic`
 - To run the tests with the modern toolkit, append the query string `toolkit=modern`
 
 *Example-URL:*
 `http://localhost:1841/packages/local/extjs-lib-core/tests/?toolkit=modern`