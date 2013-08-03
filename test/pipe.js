define(function(require) {

	'use strict';


	var assert = require('assert');

	var adapter = global.adapter;
	var delayed = require('./helpers/delayed');

	var pipe = require('deferreds/pipe');


	describe('deferreds/pipe', function() {

		it('should pass the fulfilled value(s) of each function to the next function in the chain', function(done) {
			this.timeout(0);
			pipe([
				function() {
					var deferred = adapter.pending();
					delayed(2).then(function() {
						deferred.fulfill('one');
					});
					return deferred.promise;
				},
				function(arg) {
					assert.strictEqual(arg, 'one');
					var deferred = adapter.pending();
					delayed(1).then(function() {
						deferred.fulfill([arg, 'two']);
					});
					return deferred.promise;
				},
				function(list) {
					assert.strictEqual(list[0], 'one');
					assert.strictEqual(list[1], 'two');
					return 'three';
				}
			]).then(function(arg){
				assert.strictEqual(arg, 'three');
			}).then(done, done);
		});

		it('should process tasks in series', function(done) {
			var order = [];
			pipe([
				function() {
					return delayed(2).then(function() {
						order.push(1);
					});
				},
				function() {
					return delayed(1).then(function() {
						order.push(2);
					});
				},
				function() {
					assert.deepEqual(order, [1, 2]);
				}
			]).then(done, done);
		});

		it('should immediately reject its promise if any task is ever rejected', function(done) {
			pipe([
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
