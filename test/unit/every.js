define(function(require){

	'use strict';


	var every = require('deferreds/every');
	var Deferred = require('deferreds/Deferred');
	require('setimmediate');


	module('every');


	test('every true', function() {
		stop();
		expect(1);

		every([1,2,3], function() {
			var deferred = new Deferred();
			setImmediate(function(){
				deferred.resolve(true);
			});
			return deferred.promise();
		}).then(function(result) {
			strictEqual(result, true);
			start();
		});
	});


	test('every false', function() {
		stop();
		expect(1);

		every([1,2,3], function() {
			var deferred = new Deferred();
			setImmediate(function(){
				deferred.resolve(false);
			});
			return deferred.promise();
		}).then(function(result) {
			strictEqual(result, false);
			start();
		});
	});


	test('every early return', function() {
		stop();

		var callOrder = [];

		every([1,2,3], function(x, i, list) {
			var deferred = new Deferred();

			setTimeout(function(){
				callOrder.push(x);
				deferred.resolve(x === 1);

				if (i === list.length - 1) {
					deepEqual(callOrder, [1,2,'callback',3]);
					start();
				}
			}, x*16);

			return deferred.promise();
		}).then(function() {
			callOrder.push('callback');
		});
	});

});
