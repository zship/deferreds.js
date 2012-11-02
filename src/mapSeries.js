define(function(require) {

	var when = require('./when');
	var cmap = require('./collection/map');
	var forEachSeries = require('./forEachSeries');
	var anyToDeferred = require('./anyToDeferred');

	var mapSeries = function(arr, iterator) {

		var superDeferred = when.defer();
		var results = [];

		arr = cmap(arr, function (val, i) {
			return {index: i, value: val};
		});

		forEachSeries(arr, function(item) {
			return anyToDeferred(iterator(item.value, item.index))
			.fail(function(err) {
				results[item.index] = err;
			})
			.done(function(transformed) {
				results[item.index] = transformed;
			});
		})
		.fail(function(err) {
			superDeferred.reject(err);
		})
		.done(function() {
			superDeferred.resolve(results);
		});

		return superDeferred.promise;

	};

	return mapSeries;

});
