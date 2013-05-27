define(function(require){

	'use strict';


	var mapSeries = require('deferreds/mapSeries');
	var Deferred = require('deferreds/Deferred');
	require('setimmediate');


	module('mapSeries');


	test('mapSeries', function() {
		stop();
		expect(4);

		var completed = 0;

		mapSeries([1, 2, 3], function(num, i) {
			var deferred = new Deferred();

			setImmediate(function(){
				strictEqual(completed, i + 1, num + ' waited for previous to complete');
				deferred.resolve(num * 2);
			});

			completed++;
			return deferred.promise();
		}).then(function(result) {
			deepEqual(result, [2, 4, 6]);
			start();
		});
	});

});
