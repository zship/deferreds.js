define(function(require){

	var Queue = require('deferreds/Queue');
	var Deferred = require('deferreds/Deferred');


	module('Queue');


	asyncTest('Basics', function() {
		expect(1);

		var call_order = [];
		var delays = [160,80,240,80];

		var q = new Queue(function(task) {
			var defer = new Deferred();
			setTimeout(function() {
				call_order.push('processing ' + task);
				defer.resolve();
			}, delays.shift());
			return defer.promise();
		}, 2);

		q.push(1);
		q.push(2);
		q.push(3);
		q.push(4);

		q.on('drained', function() {
			deepEqual(call_order, [
				'processing 2',
				'processing 1',
				'processing 4',
				'processing 3'
			]);
			start();
		});

		q.start();

	});

});
