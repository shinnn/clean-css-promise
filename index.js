'use strict';

const {inspect} = require('util');

const CleanCss = require('clean-css');
const inspectWithKind = require('inspect-with-kind');

const CONSTRUCTOR_ERROR = 'Expected an <Object> to specify clean-css options https://github.com/jakubpawlowicz/clean-css';
const REBASE_TO_ERROR = 'Expected `rebaseTo` option to be a string or undefined';
const createLine = (msg, error, index) => `${msg}\n  ${index + 1}. ${error}`;

module.exports = class CleanCssPromise extends CleanCss {
	constructor(...args) {
		const argLen = args.length;

		if (argLen > 1) {
			const error = new RangeError(`Expected 0 or 1 argument (<Object>), but got ${argLen} arguments.`);
			error.code = 'ERR_TOO_MANY_ARGS';

			throw error;
		}

		const [options = {}] = args;

		if (argLen === 1) {
			if (options === null || typeof options !== 'object') {
				throw new TypeError(`${CONSTRUCTOR_ERROR}, but got a non-Object value ${
					inspectWithKind(options)
				} instead.`);
			}

			if (Array.isArray(options)) {
				throw new TypeError(`${CONSTRUCTOR_ERROR}, but got an array ${inspect(options)} instead.`);
			}

			if (options.returnPromise === false) {
				throw new Error('clean-css-promise requires `returnPromise` option to be enabled.');
			}

			if (options.returnPromise !== undefined) {
				throw new Error(`${'clean-css-promise enables `returnPromise` option by default, so you dont\'t need to ' +
          'pass any values to that option. But '}${
					inspect(options.returnPromise)
				} is provided.`);
			}

			if (options.rebaseTo !== undefined && typeof options.rebaseTo !== 'string') {
				throw new TypeError(`${REBASE_TO_ERROR}, but got ${inspect(options.rebaseTo)}.${
					options.rebaseTo === null || options.rebaseTo === false ?
						' If you want to disable `rebaseTo` option, do not pass any values to `rebaseTo`.' :
						''
				}`);
			}
		}

		super(options);
	}

	async minify(...args) {
		const argLen = args.length;

		if (argLen === 0) {
			const error = new RangeError('Expected 1 or 2 arguments (<string|Object>[, <string>]), but got no arguments.');
			error.code = 'ERR_MISSING_ARGS';

			throw error;
		}

		if (argLen > 2) {
			const error = new RangeError(`Expected 1 or 2 arguments (<string|Object>[, <string>]), but got ${argLen} arguments.`);
			error.code = 'ERR_TOO_MANY_ARGS';

			throw error;
		}

		const [input, sourceMap] = args;

		if (argLen === 2) {
			if (typeof input !== 'string') {
				const error = new TypeError(`Expected CleanCssPromise#minify() to receive <string> as its first argument when it takes 2 arguments, but got ${
					inspectWithKind(input)
				}.`);
				error.code = 'ERR_INVALID_ARG_TYPE';

				throw error;
			}

			if (typeof sourceMap !== 'string') {
				const error = new TypeError(`Expected CleanCssPromise#minify() to receive <string> as its second argument when it takes 2 arguments, but got ${
					inspectWithKind(sourceMap)
				}.`);
				error.code = 'ERR_INVALID_ARG_TYPE';

				throw error;
			}
		}

		return new Promise((resolve, reject) => {
			super.minify(...args, (unusedArg, result) => {
				const errors = [...result.errors, ...result.warnings];
				const errorCount = errors.length;

				if (errorCount !== 0) {
					const errorMessage = errorCount !== 1 ? errors.reduce(
						createLine,
						`${errors.length} errors occured while optimizing CSS with clean-css:`
					) : `An error occured while optimizing CSS with clean-css: ${errors[0]}`;

					reject(new Error(`${errorMessage
					}\n\nclean-css dangerously ignores ${
						errorCount === 1 ? 'this error' : 'these errors'
					} but clean-css-promise doesn't, because it's much more reasonable to update the CSS` +
            ' to fix all problems than to pretend that you didn\'t see the errors.'));
				}

				resolve(result);
			});
		});
	}
};
