define(function(require) {

	var when = require('./when');
	var map = require('./collection/map');
	var pluck = require('./collection/pluck');
	var forEach = require('./forEach');

	var reject = function(eachfn, arr, iterator) {

		var superDeferred = when.defer();
		var results = [];

		arr = map(arr, function(val, i) {
			return {index: i, value: val};
		});

		forEach(arr, function (item) {
			return when(iterator(item.value))
			.fail(function() {
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

	return reject;

});
