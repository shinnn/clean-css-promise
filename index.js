'use strict';

const inspect = require('util').inspect;

const CleanCss = require('clean-css');

const CONSTRUCTOR_ERROR = 'Expected an object to specify clean-css options';
const REBASE_TO_ERROR = 'Expected `rebaseTo` option to be a string or undefined';
const createLine = (msg, error, index) => `${msg}\n  ${index + 1}. ${error}`;

module.exports = class CleanCssPromise extends CleanCss {
  constructor(options) {
    if (options !== undefined && options !== null) {
      if (typeof options !== 'object') {
        throw new TypeError(`${CONSTRUCTOR_ERROR}, but got a non-object value ${
          inspect(options)
        } instead.`);
      }

      if (Array.isArray(options)) {
        throw new TypeError(`${CONSTRUCTOR_ERROR}, but got an array ${inspect(options)} instead.`);
      }

      if (options.returnPromise === false) {
        throw new Error('clean-css-promise requires `returnPromise` option to be enabled.');
      }

      if (options.returnPromise !== undefined) {
        throw new Error(
          'clean-css-promise enables `returnPromise` option by default, so you dont\'t need to ' +
          'pass any values to that option. But ' +
          inspect(options.returnPromise) +
          ' is provided.'
        );
      }

      if (options.rebaseTo !== undefined && typeof options.rebaseTo !== 'string') {
        throw new TypeError(`${REBASE_TO_ERROR}, but got ${inspect(options.rebaseTo)}.${
          options.rebaseTo === null || options.rebaseTo === false ?
          ' If you want to disable `rebaseTo` option, do not pass any values to `rebaseTo`.' :
          ''
        }`);
      }
    } else {
      options = {};
    }

    super(options);
  }

  minify(source) {
    return new Promise((resolve, reject) => {
      super.minify(source, (unusedArg, result) => {
        const errors = result.errors.concat(result.warnings);
        const errorCount = errors.length;

        if (errorCount !== 0) {
          const errorMessage = errorCount !== 1 ? errors.reduce(
            createLine,
            `${errors.length} errors found while optimizing CSS with clean-css:`
          ) : `An error found while optimizing CSS with clean-css:\n  * ${errors[0]}`;

          reject(new Error(
            errorMessage +
            `\n\nclean-css dangerously ignores ${
              errorCount === 1 ? 'this error' : 'these errors'
            } but clean-css-promise doesn't, because it's much more reasonable to update the CSS` +
            ' to fix all problems than to pretend that you didn\'t see the errors.'
          ));
        }

        resolve(result);
      });
    });
  }
};
