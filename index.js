'use strict';

const arrayToError = require('array-to-error');
const CleanCss = require('clean-css');

module.exports = class CleanCssPromise extends CleanCss {
  minify(source) {
    const minify = super.minify.bind(this);
    return new Promise(function promisify(resolve, reject) {
      minify(source, function minifyCallback(errors, result) {
        if (errors) {
          reject(arrayToError(errors));
          return;
        }

        resolve(result);
      });
    });
  }
};
