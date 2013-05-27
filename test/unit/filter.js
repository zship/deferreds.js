define(function(require){

	'use strict';


	var filter = require('deferreds/filter');
	var Deferred = require('deferreds/Deferred');
	require('setimmediate');


	module('filter');


	test('filter', function() {
		stop();
		expect(1);

		filter([1,2,3], function(num) {
			var deferred = new Deferred();
			setImmediate(function(){
				var isOdd = (num % 2 !== 0);
				deferred.resolve(isOdd);
			});
			return deferred.promise();
		}).then(function(result) {
			deepEqual(result, [1, 3]);
			start();
		});
	});

});
