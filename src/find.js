define(function(require) {

	var when = require('./when');
	var forEach = require('./forEach');

	var find = function(eachfn, arr, iterator) {

		var superDeferred = when.defer();

		forEach(arr, function(item) {
			return when(iterator(item))
			.done(function() {
				superDeferred.resolve(item);
			});
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			superDeferred.reject();
		});

		return superDeferred.promise;

	};

	return find;

});
