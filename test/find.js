define(function(require){

	'use strict';


	var assert = require('assert');

	var delayed = require('./helpers/delayed');
	var testTruthy = require('./helpers/testTruthy');

	var findParallel = require('deferreds/find');
	var findSeries = require('deferreds/findSeries');


	var _testFind = function(find) {
		describe('should be fulfilled with the first value for which iterator was fulfilled with a truthy value', function() {
			testTruthy(function(truthy, done) {
				find([1,2,3], function(num) {
					return delayed().then(function() {
						var isEven = (num % 2 === 0);
						return isEven ? truthy : false;
					});
				}).then(function(result) {
					assert.strictEqual(result, 2);
				}).then(done, done);
			});
		});

		it('should be fulfilled with `undefined` if iterator was fulfilled with only falsy values', function(done) {
			find([1,2,3,4,5], function(num) {
				return delayed().then(function() {
					return num === 6;
				});
			}).then(function(result) {
				assert.strictEqual(result, undefined);
			}).then(done, done);
		});
	};


	describe('deferreds/find', function() {
		_testFind(findParallel);
	});

	describe('deferreds/findSeries', function() {
		_testFind(findSeries);
	});

});
