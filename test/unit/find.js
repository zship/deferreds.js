define(function(require){

	'use strict';


	var find = require('deferreds/find');
	var Deferred = require('deferreds/Deferred');
	require('setimmediate');


	module('find');


	test('find', function() {
		stop();
		expect(1);

		find([1,2,3], function(num) {
			var deferred = new Deferred();
			setImmediate(function(){
				var isEven = (num % 2 === 0);
				deferred.resolve(isEven);
			});
			return deferred.promise();
		}).then(function(result) {
			strictEqual(result, 2);
			start();
		});
	});


	test('find fail', function() {
		stop();
		expect(1);

		find([1,2,3,4,5], function(num) {
			var deferred = new Deferred();
			setImmediate(function(){
				deferred.resolve(num === 6);
			});
			return deferred.promise();
		}).then(function(result) {
			strictEqual(result, undefined);
			start();
		});
	});

});
