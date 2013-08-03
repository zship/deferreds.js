define(function(require){

	'use strict';


	var assert = require('assert');

	var adapter = global.adapter;
	var delayed = require('./helpers/delayed');

	var Queue = require('deferreds/Queue');


	describe('deferreds/Queue', function() {

		it('should process tasks in parallel up to the concurrency limit', function(done) {
			var order = [];
			var delays = [2,1,3,1];

			var q = new Queue(function(task) {
				var t = delays.shift();
				return delayed(t).then(function() {
					order.push('processing ' + task);
				});
			}, 2);

			q.push(1);
			q.push(2);
			q.push(3);
			q.push(4);

			q.on('drained', function() {
				assert.deepEqual(order, [
					'processing 2',
					'processing 1',
					'processing 4',
					'processing 3'
				]);
				done();
			});

			q.start();
		});

	});

});
