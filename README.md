# clean-css-promise

[![NPM version](https://img.shields.io/npm/v/clean-css-promise.svg)](https://www.npmjs.com/package/clean-css-promise)
[![Build Status](https://travis-ci.org/shinnn/clean-css-promise.svg?branch=master)](https://travis-ci.org/shinnn/clean-css-promise)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/clean-css-promise.svg)](https://coveralls.io/github/shinnn/clean-css-promise?branch=master)

[clean-css](https://github.com/jakubpawlowicz/clean-css) with the default [Promise](https://developer.mozilla.org/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Promise) interface and some improvements

```javascript
const CleanCssPromise = require('clean-css-promise');

new CleanCssPromise()
.minify('p { margin: 1px 1px 1px 1px; }')
.then(({styles}) => console.log(styles)) //=> p{margin:1px}
```

## Installation

[Use npm.](https://docs.npmjs.com/cli/install)

```
npm install clean-css-promise
```

## API

```javascript
const CleanCssPromise = require('clean-css-promise');
```

### class CleanCssPromise([*options*])

*options*: `Object` ([clean-css constructor options](https://github.com/jakubpawlowicz/clean-css#constructor-options))  

Almost the same the original `clean-css`, except for:

* [`returnPromise` option](https://github.com/jakubpawlowicz/clean-css#promise-interface) is enabled by default, and cannot be disabled.
* [*onRejected*](https://promisesaplus.com/#point-30) function receives an error instead of an array.
* All problems that clean-css considers as *warnings*, for example broken CSS syntax, are regarded as *errors*.

```javascript
const CleanCssPromise = require('clean-css-promise');

new CleanCssPromise({})
.minify('@import url(/foo);}')
.catch(err => {
  err.message;
  /*=> `2 errors found while optimizing CSS with clean-css:
  1. Ignoring local @import of "/foo" as resource is missing.
  2. Invalid character(s) '?' at 1:18. Ignoring.

clean-css dangerously ignores these errors but clean-css-promise doesn't, because it's much more reasonable to update the CSS to fix all problems than to pretend that you didn't see the errors.` */
});
```

## License

Copyright (c) 2015 - 2017 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).
