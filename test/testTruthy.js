define(function(require) {

	'use strict';


	var testTruthy = function(callback) {
		[true, 'a', 5, {}].forEach(function(val) {
			it(JSON.stringify(val), function(done) {
				callback(val, done);
			});
		});
	};


	return testTruthy;

});
