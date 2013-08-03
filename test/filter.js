define(function(require){

	'use strict';


	var assert = require('assert');

	var delayed = require('./helpers/delayed');
	var testTruthy = require('./helpers/testTruthy');
	require('setimmediate');

	var filterParallel = require('deferreds/filter');
	var filterSeries = require('deferreds/filterSeries');


	var _testFilter = function(filter) {
		describe('should be fulfilled with the values for which iterator was fulfilled with a truthy value', function() {
			testTruthy(function(truthy, done) {
				filter([1,2,3], function(num) {
					return delayed().then(function() {
						var isOdd = (num % 2 !== 0);
						return isOdd ? truthy : false;
					});
				}).then(function(result) {
					assert.deepEqual(result, [1, 3]);
				}).then(done, done);
			});
		});
	};


	describe('deferreds/filter', function() {
		_testFilter(filterParallel);
	});

	describe('deferreds/filterSeries', function() {
		_testFilter(filterSeries);
	});

});
