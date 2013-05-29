define(function(require){

	'use strict';


	var Chainable = require('deferreds/Chainable');
	var Deferred = require('deferreds/Deferred');
	require('setimmediate');


	module('Chainable');


	//just a quick class to return Deferred objects which resolve after a
	//timeout.
	var Delayed = function(t) {
		this._time = t || 10;
	};

	Delayed.prototype.resolve = function(val) {
		var deferred = new Deferred();
		setImmediate(function() {
			deferred.resolve(val);
		});
		return deferred.promise();
	};


	test('map/map', function() {
		stop();
		new Chainable([1, 2, 3, 4, 5])
			.map(function(val) {
				return new Delayed().resolve(val * 2);
			})
			.map(function(val) {
				return new Delayed().resolve(val * 2);
			})
			.then(function(result) {
				deepEqual(result, [4, 8, 12, 16, 20]);
				start();
			});
	});


	test('filter/reject/sortBy', function() {
		stop();
		var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		numbers = new Chainable(numbers)
			.filter(function(n) {
				return new Delayed().resolve(n % 2 === 0);
			})
			.filter(function(n) {
				return new Delayed().resolve(n % 4 !== 0);
			})
			.sortBy(function(n) {
				return new Delayed().resolve(-1 * n);
			})
			.then(function(result) {
				deepEqual(result, [10, 6, 2]);
				start();
			});
	});


	test('parallel/series', function() {
		stop();
		new Chainable()
			.parallel([
				function() {
					return 'A';
				},
				function() {
					return 'B';
				}
			])
			.done(function(result) {
				deepEqual(result, ['A', 'B']);
			})
			.series([
				function() {
					return new Delayed().resolve('C');
				},
				function() {
					return new Delayed().resolve('D');
				}
			])
			.then(function(results) {
				deepEqual(results, ['C', 'D']);
				start();
			});
	});

});
