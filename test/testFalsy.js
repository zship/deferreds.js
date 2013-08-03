define(function(require) {

	'use strict';


	var testFalsy = function(callback) {
		[false, '', 0, null].forEach(function(val) {
			it(JSON.stringify(val), function(done) {
				callback(val, done);
			});
		});
	};


	return testFalsy;

});
