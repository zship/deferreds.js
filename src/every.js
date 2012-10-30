define(function(require) {

	var $ = require('jquery');
	var forEach = require('./forEach');

	var every = function(arr, iterator) {

		var superDeferred = $.Deferred();

		forEach(arr, function(item) {
			return iterator(item)
			.fail(function() {
				superDeferred.reject();
			});
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			superDeferred.resolve();
		});

		return superDeferred;

	};

	return every;

});
