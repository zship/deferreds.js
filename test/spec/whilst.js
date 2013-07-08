define(function(require){

	'use strict';


	var assert = require('assert');

	var delayed = require('./helpers/delayed');
	var testFalsy = require('./helpers/testFalsy');

	var whilst = require('deferreds/whilst');


	describe('deferreds/whist', function() {

		describe('should alternate between `test` and `iterator` until the result of `test` is falsy', function() {
			testFalsy(function(falsy, done) {
				var called = [];
				var count = 0;

				whilst(
					function() {
						called.push('test ' + count);
						return (count !== 5) ? true : falsy;
					},
					function() {
						return delayed().then(function() {
							called.push('iterator ' + count);
							count++;
						});
					}
				).then(function() {
					assert.deepEqual(called, [
						'test 0',
						'iterator 0',
						'test 1',
						'iterator 1',
						'test 2',
						'iterator 2',
						'test 3',
						'iterator 3',
						'test 4',
						'iterator 4',
						'test 5'
					]);
					assert.strictEqual(count, 5);
					done();
				});
			});
		});

	});

});
