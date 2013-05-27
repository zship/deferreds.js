define(function(require){

	'use strict';


	var filterSeries = require('deferreds/filterSeries');
	var Deferred = require('deferreds/Deferred');
	require('setimmediate');


	module('filterSeries');


	test('filterSeries', function() {
		stop();
		expect(4);

		var completed = 0;

		filterSeries([1,2,3], function(num, i) {
			var deferred = new Deferred();

			setImmediate(function(){
				strictEqual(completed, i + 1, num + ' waited for previous to complete');
				var isOdd = (num % 2 !== 0);
				deferred.resolve(isOdd);
			});

			completed++;
			return deferred.promise();
		}).then(function(result) {
			deepEqual(result, [1, 3]);
			start();
		});
	});

});
