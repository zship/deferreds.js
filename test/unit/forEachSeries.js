define(function(require){

	'use strict';


	var forEachSeries = require('deferreds/forEachSeries');
	var Deferred = require('deferreds/Deferred');
	require('setimmediate');


	module('forEachSeries');


	test('forEachSeries', function() {
		stop();
		expect(4);

		var args = [];
		var completed = 0;

		forEachSeries([1, 3, 2], function(num, i) {
			var deferred = new Deferred();

			setImmediate(function(){
				strictEqual(completed, i + 1, num + ' waited for previous to complete');
				args.push(num);
				deferred.resolve();
			});

			completed++;
			return deferred.promise();
		}).then(function() {
			deepEqual(args, [1, 3, 2]);
			start();
		});
	});

});
