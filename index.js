'use strict';

const {inspect} = require('util');

const CleanCss = require('clean-css');
const inspectWithKind = require('inspect-with-kind');
const isPlainObj = require('is-plain-obj');

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

		if (argLen === 1) {
			const [options] = args;

			if (!isPlainObj(options)) {
				const error = new TypeError(`${CONSTRUCTOR_ERROR}, but got ${
					inspectWithKind(options)
				}.`);
				error.code = 'ERR_INVALID_ARG_TYPE';

				throw error;
			}

			if (options.returnPromise !== undefined) {
				throw new Error(`clean-css-promise automatically enables \`returnPromise\` option and it's unconfigurable, but a value ${
					inspect(options.returnPromise)
				} was provided for it.`);
			}

			if (options.rebaseTo !== undefined && typeof options.rebaseTo !== 'string') {
				throw new TypeError(`${REBASE_TO_ERROR}, but got ${inspect(options.rebaseTo)}.${
					options.rebaseTo === null || options.rebaseTo === false ?
						' If you want to disable `rebaseTo` option, do not pass any values to `rebaseTo`.' :
						''
				}`);
			}
		}

		super(...args);
	}

	async minify(...args) {
		const argLen = args.length;

		if (argLen === 0) {
			const error = new RangeError('Expected 1 or 2 arguments (<string|Object>[, <string>]), but got no arguments.');
			error.code = 'ERR_MISSING_ARGS';

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
		} else if (argLen === 1) {
			if (typeof input !== 'string' && !isPlainObj(input)) {
				const error = new TypeError(`Expected CleanCssPromise#minify() to receive <string> or <Object> as its first argument, but got ${
					inspectWithKind(input)
				}.`);
				error.code = 'ERR_INVALID_ARG_TYPE';

				throw error;
			}
		} else {
			const error = new RangeError(`Expected 1 or 2 arguments (<string|Object>[, <string>]), but got ${argLen} arguments.`);
			error.code = 'ERR_TOO_MANY_ARGS';

			throw error;
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
