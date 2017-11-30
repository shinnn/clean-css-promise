'use strict';

const CleanCss = require('clean-css');
const CleanCssPromise = require('.');
const test = require('tape');

const expectedMsg = `3 errors found while optimizing CSS with clean-css:
  1. Unexpected '}' at 1:34.
  2. Invalid character(s) 'a}' at 1:33. Ignoring.
  3. Skipping remote @import of "https://exmaple.com" as resource is not allowed.`;

test('CleanCssPromise class', t => {
	t.deepEqual(
		new CleanCssPromise().options,
		new CleanCss().options,
		'should be an inheritance of CleanCSS class.'
	);

	t.throws(
		() => new CleanCssPromise(1),
		/^TypeError.*Expected an object to specify clean-css options, but got a non-object value 1 instead\./,
		'should throw an error when it takes a non-object argument.'
	);

	t.throws(
		() => new CleanCssPromise([]),
		/^TypeError.*Expected an object to specify clean-css options, but got an array \[] instead\./,
		'should throw an error when it takes an array.'
	);

	t.throws(
		() => new CleanCssPromise({returnPromise: false}),
		/^Error.*clean-css-promise requires `returnPromise` option to be enabled\./,
		'should throw an error when `returnPromise` option is disabled.'
	);

	t.throws(
		() => new CleanCssPromise({returnPromise: true}),
		/^Error.*so you dont't need to pass any values to that option\. But true is provided\./,
		'should throw an error when `returnPromise` option receives any value.'
	);

	t.throws(
		() => new CleanCssPromise({rebaseTo: new Set()}),
		/^TypeError.*Expected `rebaseTo` option to be a string or undefined, but got Set {}\./,
		'should throw an error when `rebaseTo` option is not a string.'
	);

	t.throws(
		() => new CleanCssPromise({rebaseTo: false}),
		/^TypeError.*If you want to disable `rebaseTo` option, do not pass any values to `rebaseTo`\./,
		'should throw an error when `rebaseTo` option is explicitly disabled.'
	);

	t.end();
});

test('CleanCssPromise#minify()', t => {
	t.plan(4);

	new CleanCssPromise().minify('a { color: #FF0000 }').then(result => {
		t.equal(result.styles, 'a{color:red}', 'should minify CSS.');
	}).catch(t.fail);

	new CleanCssPromise({
		compatibility: {
			properties: {
				zeroUnits: false
			}
		}
	}).minify('b {font: 0px}').then(result => {
		t.equal(result.styles, 'b{font:0px}', 'should support clean-css options.');
	}).catch(t.fail);

	new CleanCssPromise(null).minify('@import /foo;').then(t.fail, ({message}) => {
		t.ok(
			message.startsWith('An error found while optimizing CSS with clean-css'),
			'should fail when an error occurs while optimizing CSS.'
		);
	});

	new CleanCssPromise().minify('@import url(https://exmaple.com);a}').then(t.fail, ({message}) => {
		t.ok(
			message.startsWith(expectedMsg),
			'should fail when multiple errors occur while optimizing CSS.'
		);
	});
});
