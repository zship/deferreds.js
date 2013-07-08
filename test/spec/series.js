define(function(require){

	'use strict';


	var assert = require('assert');

	var adapter = require('./promiseImpl');
	var delayed = require('./helpers/delayed');

	var series = require('deferreds/series');


	describe('deferreds/series', function() {

		it('should process tasks in series', function(done) {
			var order = [];
			series([
				function() {
					return delayed(2).then(function() {
						order.push(1);
					});
				},
				function() {
					return delayed(1).then(function() {
						order.push(2);
					});
				}
			]).then(function() {
				assert.deepEqual(order, [1, 2]);
			}).then(done, done);
		});

		it('should immediately reject its promise if any task is ever rejected', function(done) {
			series([
				function() {
					return adapter.rejected('error');
				},
				function() {
					assert(false, 'should not be called');
				}
			]).then(null, function(err) {
				assert.strictEqual(err, 'error');
			}).then(done, done);
		});

	});

});
