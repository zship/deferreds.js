define(function(require){

	'use strict';


	var filter = require('deferreds/filter');
	var Deferred = require('deferreds/Deferred');


	module('filter');


	test('filter', function() {
		stop();
		expect(1);

		filter([1,2,3], function(num) {
			var deferred = new Deferred();
			setTimeout(function(){
				var isOdd = (num % 2 !== 0);
				deferred.resolve(isOdd);
			}, 10);
			return deferred.promise();
		}).then(function(result) {
			deepEqual(result, [1, 3]);
			start();
		});
	});

});
