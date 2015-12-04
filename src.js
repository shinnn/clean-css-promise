'use strict';

const arrayToError = require('array-to-error');
const CleanCss = require('clean-css');
const PinkiePromise = require('pinkie-promise');

module.exports = class CleanCssPromise extends CleanCss {
  minify(source) {
    const originalMinify = super.minify.bind(this);
    return new PinkiePromise(function promisify(resolve, reject) {
      originalMinify(source, function minifyCallback(errors, result) {
        if (errors) {
          reject(arrayToError(errors));
          return;
        }

        resolve(result);
      });
    });
  }
};
