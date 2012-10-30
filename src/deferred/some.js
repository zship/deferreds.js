define(function(require) {

	var $ = require('jquery');
	var forEach = require('./forEach');

	var some = function(arr, iterator) {

		var superDeferred = $.Deferred();

		forEach(arr, function(item) {
			return iterator(item)
			.done(function() {
				superDeferred.resolve();
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

	return some;

});
