define(function(require) {

	var when = require('./when');
	var map = require('./collection/map');
	var pluck = require('./collection/pluck');
	var forEachSeries = require('./forEachSeries');
	var anyToDeferred = require('./anyToDeferred');

	var filter = function(eachfn, arr, iterator) {

		var superDeferred = when.defer();
		var results = [];

		arr = map(function(val, i) {
			return {index: i, value: val};
		});

		forEachSeries(arr, function(item) {
			return anyToDeferred(iterator(item.value, item.index))
			.done(function() {
				results.push(item);
			});
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			results = results.sort(function(a, b) {
				return a.index - b.index;
			});
			results = pluck(results, 'value');
			superDeferred.resolve(results);
		});

		return superDeferred.promise;

	};

	return filter;

});
