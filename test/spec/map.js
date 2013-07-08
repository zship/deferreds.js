define(function(require){

	'use strict';


	var assert = require('assert');

	var delayed = require('./helpers/delayed');

	var mapParallel = require('deferreds/map');
	var mapSeries = require('deferreds/mapSeries');


	var _testMap = function(map) {
		it('should be fulfilled with values transformed by iterator', function(done) {
			map([1, 2, 3], function(num) {
				return delayed().then(function() {
					return num * 2;
				});
			}).then(function(result) {
				assert.deepEqual(result, [2, 4, 6]);
			}).then(done, done);
		});
	};


	describe('deferreds/map', function() {
		_testMap(mapParallel);
	});

	describe('deferreds/mapSeries', function() {
		_testMap(mapSeries);
	});

});
