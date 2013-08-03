define(function(require){

	'use strict';


	var assert = require('assert');

	var delayed = require('./helpers/delayed');

	var Chainable = require('deferreds/Chainable');


	describe('deferreds/Chainable', function() {

		it('map/map', function(done) {
			new Chainable([1, 2, 3, 4, 5])
				.map(function(val) {
					return delayed().then(function() {
						return val * 2;
					});
				})
				.map(function(val) {
					return delayed().then(function() {
						return val * 2;
					});
				})
				.then(function(result) {
					assert.deepEqual(result, [4, 8, 12, 16, 20]);
				})
				.then(done, done);
		});


		it('filter/reject/sortBy', function(done) {
			var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
			numbers = new Chainable(numbers)
				.filter(function(n) {
					return delayed().then(function() {
						return n % 2 === 0;
					});
				})
				.filter(function(n) {
					return delayed().then(function() {
						return n % 4 !== 0;
					});
				})
				.sortBy(function(n) {
					return delayed().then(function() {
						return -1 * n;
					});
				})
				.then(function(result) {
					assert.deepEqual(result, [10, 6, 2]);
				})
				.then(done, done);
		});


		it('parallel/series', function(done) {
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
					assert.deepEqual(result, ['A', 'B']);
				})
				.series([
					function() {
						return delayed().then(function() {
							return 'C';
						});
					},
					function() {
						return delayed().then(function() {
							return 'D';
						});
					}
				])
				.then(function(results) {
					assert.deepEqual(results, ['C', 'D']);
				})
				.then(done, done);
		});

	});

});
