'use strict';


var jQuery = require('jquery');


var adapter = {
	name: 'jQuery.Deferred 1.8.3',
	pending: function() {
		var deferred = new jQuery.Deferred();
		return {
			promise: deferred.promise(),
			fulfill: deferred.resolve.bind(deferred),
			reject: deferred.reject.bind(deferred)
		};
	}
};


module.exports = adapter;
