define(function(require) {

	var when = require('./when');
	var forEachSeries = require('./forEachSeries');
	var anyToDeferred = require('./anyToDeferred');

	var reduce = function(arr, memo, iterator) {

		var superDeferred = when.defer();

		forEachSeries(arr, function(item, key) {
			return anyToDeferred(iterator(memo, item, key, arr));
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			superDeferred.resolve(memo);
		});

		return superDeferred.promise;

	};

	return reduce;

});
