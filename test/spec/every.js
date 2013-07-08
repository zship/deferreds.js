define(function(require){

	'use strict';


	var assert = require('assert');

	var delayed = require('./helpers/delayed');
	var testTruthy = require('./helpers/testTruthy');
	var testFalsy = require('./helpers/testFalsy');

	var every = require('deferreds/every');


	describe('deferreds/every', function() {

		describe('should be fulfilled with `true` if iterator is always fulfilled with a truthy value', function() {
			testTruthy(function(truthy, done) {
				every([1,2,3], function() {
					return delayed().then(function() {
						return truthy;
					});
				}).then(function(result) {
					assert.strictEqual(result, true);
				}).then(done, done);
			});
		});

		describe('should be fulfilled with `false` if iterator is ever fulfilled with a falsy value', function() {
			testFalsy(function(falsy, done) {
				every([1,2,3], function() {
					return delayed().then(function() {
						return falsy;
					});
				}).then(function(result) {
					assert.strictEqual(result, false);
				}).then(done, done);
			});
		});

		describe('can be fulfilled before all items have been processed if iterator is fulfilled with a falsy value', function() {
			testFalsy(function(falsy, done) {
				var order = [];

				every([1,2,3], function(x, i, list) {
					return delayed(x).then(function() {
						order.push(x);
						if (i === list.length - 1) {
							assert.deepEqual(order, [1,2,'callback',3]);
							done();
						}
						return x === 1 ? true : falsy;
					});
				}).then(function() {
					order.push('callback');
				});
			});
		});

	});

});
