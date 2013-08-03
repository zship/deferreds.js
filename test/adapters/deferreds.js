'use strict';


var Deferred = require('deferreds/Deferred');


var adapter = {
	name: 'deferreds/Deferred 1.0.4',
	pending: function() {
		var deferred = new Deferred();
		return {
			promise: deferred.promise(),
			fulfill: deferred.resolve.bind(deferred),
			reject: deferred.reject.bind(deferred)
		};
	}
};


module.exports = adapter;
