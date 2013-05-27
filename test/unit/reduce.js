define(function(require){

	'use strict';


	var reduce = require('deferreds/reduce');
	var Deferred = require('deferreds/Deferred');


	module('reduce');


	test('reduce', function() {
		stop();
		expect(1);

		reduce([1, 2, 3], function(memo, num) {
			var deferred = new Deferred();
			setTimeout(function(){
				deferred.resolve(num + memo);
			}, 16);
			return deferred.promise();
		}, 0).then(function(result) {
			strictEqual(result, 6);
			start();
		});
	});


});
