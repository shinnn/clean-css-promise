'use strong';

const CleanCss = require('clean-css');
const CleanCssPromise = require('.');
const test = require('tape');

test('CleanCssPromise()', t => {
  t.plan(6);

  t.strictEqual(CleanCssPromise.name, 'CleanCssPromise', 'should have a function name.');

  t.deepEqual(new CleanCssPromise().options, new CleanCss().options, 'should have `option` proprty.');

  new CleanCssPromise().minify('a { color: #FF0000 }').then(result => {
    t.strictEqual(result.styles, 'a{color:red}', 'should minify CSS.');
  }).catch(t.fail);

  new CleanCssPromise({keepSpecialComments: 1}).minify('/*!*/').then(result => {
    t.strictEqual(result.styles, '/*!*/', 'should support clean-css options.');
  }).catch(t.fail);

  new CleanCssPromise().minify('@import /foo;@import /bar;').then(t.fail, err => {
    const reasons = [
      'Broken @import declaration of "/foo"',
      'Broken @import declaration of "/bar"'
    ];

    t.strictEqual(err.message, reasons.join('\n'), 'should fail when it cannot finish minification.');
    t.deepEqual(err.reasons, reasons, 'should add an array of details to the error object');
  });
});
