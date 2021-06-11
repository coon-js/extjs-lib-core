# @coon-js/extjs-lib-core - Tests 

extjs-lib-core uses [Siesta](http://bryntum.com) for Unit/UI testing.

### Configuration

Run 
```
npx extjs-link
```
in the NPM package. The tool will guide you through the process of symlinking to an existing ExtJS SDK installation
(build files are required to properly run the tests in a Siesta-Browser environment).

After this was done, run 
```
npm test
```
which will start a lightweight local webserver on **127.0.0.1**/**localhost** on port **8000**. This will also
automatically open your system's default web-browser and load the test main-page.

### Using Modern/ Classic Toolkit for the tests
 - To run the tests with the classic toolkit, append the query string `toolkit=classic` (default)
 - To run the tests with the modern toolkit, append the query string `toolkit=modern`
 
 *Example-URL:*
 `http://127.0.0.1:8000/tests/index.html?toolkit=modern`