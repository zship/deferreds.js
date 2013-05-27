define(function(require){

	'use strict';


	var reduceRight = require('deferreds/reduceRight');
	var Deferred = require('deferreds/Deferred');
	require('setimmediate');


	module('reduceRight');


	test('reduceRight', function() {
		stop();
		expect(2);

		var called = [];

		reduceRight([1, 2, 3], function(memo, num) {
			var deferred = new Deferred();
			setImmediate(function(){
				called.push(num);
				deferred.resolve(num + memo);
			});
			return deferred.promise();
		}, 0).then(function(result) {
			deepEqual(called, [3, 2, 1]);
			strictEqual(result, 6);
			start();
		});
	});

});
