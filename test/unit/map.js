define(function(require){

	'use strict';


	var map = require('deferreds/map');
	var Deferred = require('deferreds/Deferred');
	require('setimmediate');


	module('map');


	test('map', function() {
		stop();
		expect(1);

		map([1, 2, 3], function(num) {
			var deferred = new Deferred();
			setImmediate(function(){
				deferred.resolve(num * 2);
			});
			return deferred.promise();
		}).then(function(result) {
			deepEqual(result, [2, 4, 6]);
			start();
		});
	});

});
