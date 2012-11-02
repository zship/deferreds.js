define(function(require) {

	var when = require('./when');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');

	var every = function(arr, iterator) {

		var superDeferred = when.defer();

		forEach(arr, function(item, i) {
			return anyToDeferred(iterator(item, i))
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
