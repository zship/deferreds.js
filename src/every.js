define(function(require) {

	var when = require('./when');
	var forEach = require('./forEach');

	var every = function(arr, iterator) {

		var superDeferred = when.defer();

		forEach(arr, function(item) {
			return when(iterator(item))
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

		return superDeferred.promise;

	};

	return every;

});
