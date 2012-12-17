define(function(require) {

	var Deferred = require('./Deferred');
	var cmap = require('amd-utils/collection/map');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	var map = function(arr, iterator) {

		var superDeferred = new Deferred();
		var results = [];

		arr = cmap(arr, function (val, i) {
			return {index: i, value: val};
		});

		forEach(arr, function(item) {
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

		return superDeferred.promise();

	};


	return map;

});
