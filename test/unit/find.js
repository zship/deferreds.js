define(function(require){

	'use strict';


	var find = require('deferreds/find');
	var Deferred = require('deferreds/Deferred');


	module('find');


	test('find', function() {
		stop();
		expect(1);

		find([1,2,3], function(num) {
			var deferred = new Deferred();
			setTimeout(function(){
				var isEven = (num % 2 === 0);
				deferred.resolve(isEven);
			}, 10);
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
			setTimeout(function(){
				deferred.resolve(num === 6);
			}, 10);
			return deferred.promise();
		}).then(function(result) {
			strictEqual(result, undefined);
			start();
		});
	});

});
