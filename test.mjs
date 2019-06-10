import {strict as assert} from 'assert';

import CleanCss from 'clean-css';
import CleanCssPromise from '.';
import test from 'testit';

test('Constructor', () => {
	test('throw an error when it takes an non-Object value', () => {
		assert.throws(() => new CleanCssPromise(Symbol('!')), {
			name: 'TypeError',
			code: 'ERR_INVALID_ARG_TYPE',
			message: /Expected an <Object> to specify clean-css options.*but got Symbol\(!\)\./u
		});
	});

	test('throw an error when `returnPromise` option receives any value', () => {
		assert.throws(() => new CleanCssPromise({returnPromise: true}), {
			message: /^clean-css-promise automatically enables `returnPromise` option and it's unconfigurable/u
		});
	});

	test('throw an error when `rebaseTo` option is not a string', () => {
		assert.throws(() => new CleanCssPromise({rebaseTo: new Set()}), {
			name: 'TypeError',
			message: 'Expected `rebaseTo` option to be a string or undefined, but got Set {}.'
		});
	});

	test('throw an error when `rebaseTo` option is explicitly disabled', () => {
		assert.throws(() => new CleanCssPromise({rebaseTo: false}), {
			name: 'TypeError',
			message: /If you want to disable `rebaseTo` option, do not pass any values to `rebaseTo`\./u
		});
	});

	test('throw an error when it takes too many arguments', () => {
		assert.throws(() => new CleanCssPromise({}, {}), {
			name: 'RangeError',
			message: 'Expected 0 or 1 argument (<Object>), but got 2 arguments.'
		});
	});
});

test('CleanCssPromise#options', () => {
	test('exists as CleanCSS#options does', () => {
		assert.deepEqual(new CleanCssPromise().options, new CleanCss().options);
	});
});

test('CleanCssPromise#minify()', async () => {
	test('minify CSS', async () => {
		assert.equal((await new CleanCssPromise().minify('a { color: #FF0000 }')).styles, 'a{color:red}');
	});

	test('support clean-css options', async () => {
		assert.equal(
			(await new CleanCssPromise({
				compatibility: {
					properties: {
						zeroUnits: false
					}
				}
			}).minify('b {font: 0px}')).styles,
			'b{font:0px}',
		);
	});

	test('fail when an error occurs while optimizing CSS', async () => {
		await assert.rejects(async () => new CleanCssPromise().minify('@import /foo;'), {
			message: /^An error occured while optimizing CSS with clean-css:/u
		});
	});

	test('fail when multiple errors occur while optimizing CSS', async () => {
		await assert.rejects(async () => new CleanCssPromise().minify(`@import url(https://example.org);
a}`, ''), ({message}) => message.startsWith(`3 errors occured while optimizing CSS with clean-css:
  1. Unexpected '}' at 2:1.
  2. Invalid character(s) 'a}' at 2:0. Ignoring.
  3. Skipping remote @import of "https://example.org" as resource is not allowed.`));
	});

	test('fail when the first argument is neither a string nor a plain object', async () => {
		await assert.rejects(async () => new CleanCssPromise().minify([]), {
			name: 'TypeError',
			code: 'ERR_INVALID_ARG_TYPE',
			message: 'Expected CleanCssPromise#minify() to receive <string> or <Object> as its first argument, but got [] (array).'
		});
	});

	test('fail when it takes 2 arguments but the first one is not a string', async () => {
		await assert.rejects(async () => new CleanCssPromise().minify({}, ''), {
			name: 'TypeError',
			code: 'ERR_INVALID_ARG_TYPE',
			message: 'Expected CleanCssPromise#minify() to receive <string> as its first argument when it takes 2 arguments, but got {} (object).'
		});
	});

	test('fail when the second argument is not a string', async () => {
		await assert.rejects(async () => new CleanCssPromise().minify('', -0), {
			name: 'TypeError',
			code: 'ERR_INVALID_ARG_TYPE',
			message: 'Expected CleanCssPromise#minify() to receive <string> as its second argument when it takes 2 arguments, but got -0 (number).'
		});
	});

	test('fail when it takes no arguments', async () => {
		await assert.rejects(async () => new CleanCssPromise().minify(), {
			name: 'RangeError',
			message: 'Expected 1 or 2 arguments (<string|Object>[, <string>]), but got no arguments.'
		});
	});

	test('fail when it takes too many arguments', async () => {
		await assert.rejects(async () => new CleanCssPromise().minify('', '', ''), {
			name: 'RangeError',
			message: 'Expected 1 or 2 arguments (<string|Object>[, <string>]), but got 3 arguments.'
		});
	});
});
