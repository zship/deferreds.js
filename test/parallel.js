define(function(require){

	'use strict';


	var assert = require('assert');

	var adapter = global.adapter;
	var delayed = require('./helpers/delayed');

	var parallel = require('deferreds/parallel');


	describe('deferreds/parallel', function() {

		it('should be fulfilled with the in-order results of evaluating each element', function(done) {
			parallel([
				function() {
					return delayed(1).then(function() {
						return 'A';
					});
				},
				'B',
				function() {
					return adapter.fulfilled('C');
				}
			]).then(function(results) {
				assert.deepEqual(results, ['A', 'B', 'C']);
			}).then(done, done);
		});

		it('should evaluate elements in parallel', function(done) {
			var order = [];
			parallel([
				function() {
					return delayed(2, 'A').then(function() {
						order.push('A');
					});
				},
				function() {
					return delayed(1, 'B').then(function() {
						order.push('B');
					});
				}
			]).then(function() {
				assert.deepEqual(order, ['B', 'A']);
			}).then(done, done);
		});

	});

});
