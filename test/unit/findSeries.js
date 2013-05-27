define(function(require){

	'use strict';


	var findSeries = require('deferreds/findSeries');
	var Deferred = require('deferreds/Deferred');


	module('findSeries');


	test('findSeries', function() {
		stop();
		expect(4);

		var completed = 0;

		findSeries([1,2,3], function(num, i) {
			var deferred = new Deferred();

			setTimeout(function(){
				strictEqual(completed, i + 1, num + ' waited for previous to complete');
				var isEven = (num % 2 === 0);
				deferred.resolve(isEven);
			}, 10);

			completed++;
			return deferred.promise();
		}).then(function(result) {
			strictEqual(result, 2);
			start();
		});
	});


	test('findSeries fail', function() {
		stop();
		expect(6);

		var completed = 0;

		findSeries([1,2,3,4,5], function(num, i) {
			var deferred = new Deferred();

			setTimeout(function(){
				strictEqual(completed, i + 1, num + ' waited for previous to complete');
				deferred.resolve(num === 6);
			}, 10);

			completed++;
			return deferred.promise();
		}).then(function(result) {
			strictEqual(result, undefined);
			start();
		});
	});

});
