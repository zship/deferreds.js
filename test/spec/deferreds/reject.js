define(function(require){

	var reject = require('deferreds/reject');
	var Deferred = require('deferreds/Deferred');


	module('deferreds/reject');


	asyncTest('reject', function() {
		expect(1);

		reject([1,2,3], function(num) {
			var deferred = new Deferred();
			setTimeout(function(){
				var isOdd = (num % 2 !== 0);
				deferred.resolve(isOdd);
			}, 10);
			return deferred.promise();
		}).then(function(result) {
			deepEqual(result, [2]);
			start();
		});
	});

});
