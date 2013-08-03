'use strict';


var Q = require('q');


var adapter = {
	name: 'Q 0.9.6',
	fulfilled: Q.resolve,
	rejected: Q.reject,
	pending: function() {
		var deferred = Q.defer();
		return {
			promise: deferred.promise,
			fulfill: deferred.resolve,
			reject: deferred.reject
		};
	}
};


module.exports = adapter;
