define(function(require) {

	var when = require('./when');
	var forEachSeries = require('./forEachSeries');

	var find = function(eachfn, arr, iterator) {

		var superDeferred = when.defer();

		forEachSeries(arr, function(item) {
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
