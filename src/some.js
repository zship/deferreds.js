define(function(require) {

	var when = require('./when');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');

	var some = function(arr, iterator) {

		var superDeferred = when.defer();

		forEach(arr, function(item, i) {
			return anyToDeferred(iterator(item, i))
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

		return superDeferred.promise;

	};

	return some;

});
