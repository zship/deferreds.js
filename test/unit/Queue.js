define(function(require){

	'use strict';


	var Queue = require('deferreds/Queue');
	var Deferred = require('deferreds/Deferred');


	module('Queue');


	test('Basics', function() {
		stop();
		expect(1);

		var callOrder = [];
		var delays = [2,1,3,1];

		var q = new Queue(function(task) {
			var defer = new Deferred();
			setTimeout(function() {
				callOrder.push('processing ' + task);
				defer.resolve();
			}, delays.shift() * 16);
			return defer.promise();
		}, 2);

		q.push(1);
		q.push(2);
		q.push(3);
		q.push(4);

		q.on('drained', function() {
			deepEqual(callOrder, [
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
