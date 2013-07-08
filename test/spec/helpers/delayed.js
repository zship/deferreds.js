define(function(require){

	'use strict';


	require('setimmediate');

	var adapter = require('../promiseImpl');


	//create Promise objects which are fulfilled after a timeout.
	var delayed = function(t) {
		var deferred = adapter.pending();
		if (t) {
			setTimeout(function() {
				deferred.fulfill();
			}, t * 16);
		}
		else {
			setImmediate(function() {
				deferred.fulfill();
			});
		}
		return deferred.promise;
	};


	return delayed;

});
