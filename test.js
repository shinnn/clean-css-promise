'use strict';

const CleanCss = require('clean-css');
const CleanCssPromise = require('.');
const test = require('tape');

test('CleanCssPromise class', t => {
	t.deepEqual(
		new CleanCssPromise().options,
		new CleanCss().options,
		'should be an inheritance of CleanCSS class.'
	);

	t.throws(
		() => new CleanCssPromise(1),
		/^TypeError.*Expected an <Object> to specify clean-css options.*but got a non-Object value 1/u,
		'should throw an error when it takes a non-Object argument.'
	);

	t.throws(
		() => new CleanCssPromise([]),
		/^TypeError.*https:\/\/github.com\/jakubpawlowicz\/clean-css, but got an array \[\] instead\./u,
		'should throw an error when it takes an array.'
	);

	t.throws(
		() => new CleanCssPromise({returnPromise: false}),
		/^Error.*clean-css-promise requires `returnPromise` option to be enabled\./u,
		'should throw an error when `returnPromise` option is disabled.'
	);

	t.throws(
		() => new CleanCssPromise({returnPromise: true}),
		/^Error.*so you dont't need to pass any values to that option\. But true is provided\./u,
		'should throw an error when `returnPromise` option receives any value.'
	);

	t.throws(
		() => new CleanCssPromise({rebaseTo: new Set()}),
		/^TypeError.*Expected `rebaseTo` option to be a string or undefined, but got Set \{\}\./u,
		'should throw an error when `rebaseTo` option is not a string.'
	);

	t.throws(
		() => new CleanCssPromise({rebaseTo: false}),
		/^TypeError.*If you want to disable `rebaseTo` option, do not pass any values to `rebaseTo`\./u,
		'should throw an error when `rebaseTo` option is explicitly disabled.'
	);

	t.throws(
		() => new CleanCssPromise({}, {}),
		/^RangeError.*Expected 0 or 1 argument \(<Object>\), but got 2 arguments\./u,
		'should throw an error when it takes too many arguments.'
	);

	t.end();
});

test('CleanCssPromise#minify()', async t => {
	t.equal(
		(await new CleanCssPromise().minify('a { color: #FF0000 }')).styles,
		'a{color:red}',
		'should minify CSS.'
	);

	t.equal(
		(await new CleanCssPromise({
			compatibility: {
				properties: {
					zeroUnits: false
				}
			}
		}).minify('b {font: 0px}')).styles,
		'b{font:0px}',
		'should support clean-css options.'
	);

	try {
		await new CleanCssPromise().minify('@import /foo;');
	} catch ({message}) {
		t.ok(
			message.startsWith('An error occured while optimizing CSS with clean-css:'),
			'should fail when an error occurs while optimizing CSS.'
		);
	}

	try {
		await new CleanCssPromise().minify('@import url(https://exmaple.com);a}', '');
	} catch ({message}) {
		t.ok(
			message.startsWith(`3 errors occured while optimizing CSS with clean-css:
  1. Unexpected '}' at 1:34.
  2. Invalid character(s) 'a}' at 1:33. Ignoring.
  3. Skipping remote @import of "https://exmaple.com" as resource is not allowed.`),
			'should fail when multiple errors occur while optimizing CSS.'
		);
	}

	try {
		await new CleanCssPromise().minify(new Set(), '');
	} catch ({message}) {
		t.equal(
			message,
			'Expected CleanCssPromise#minify() to receive <string> as its first argument when it takes 2 arguments, but got Set {}.',
			'should fail when it takes 2 arguments but the first one is not a string.'
		);
	}

	try {
		await new CleanCssPromise().minify('', -0);
	} catch ({message}) {
		t.equal(
			message,
			'Expected CleanCssPromise#minify() to receive <string> as its second argument when it takes 2 arguments, but got -0 (number).',
			'should fail when the second argument is not a string.'
		);
	}

	try {
		await new CleanCssPromise().minify();
	} catch ({message}) {
		t.equal(
			message,
			'Expected 1 or 2 arguments (<string|Object>[, <string>]), but got no arguments.',
			'should fail when it takes too no arguments.'
		);
	}

	try {
		await new CleanCssPromise().minify('', '', '');
	} catch ({message}) {
		t.equal(
			message,
			'Expected 1 or 2 arguments (<string|Object>[, <string>]), but got 3 arguments.',
			'should fail when it takes too many arguments.'
		);
	}

	t.end();
});
