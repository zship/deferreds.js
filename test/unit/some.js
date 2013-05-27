define(function(require){

	'use strict';


	var some = require('deferreds/some');
	var Deferred = require('deferreds/Deferred');
	require('setimmediate');


	module('some');


	test('some true', function() {
		stop();
		expect(1);

		some([1,2,3], function(num) {
			var deferred = new Deferred();
			setImmediate(function(){
				deferred.resolve(num === 3);
			});
			return deferred.promise();
		}).then(function(result) {
			strictEqual(result, true);
			start();
		});
	});


	test('some false', function() {
		stop();
		expect(1);

		some([1,2,3], function() {
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


	test('some early return', function() {
		stop();

		var callOrder = [];

		some([1,2,3], function(x, i, list) {
			var deferred = new Deferred();

			setTimeout(function(){
				callOrder.push(x);
				deferred.resolve(x === 2);

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
