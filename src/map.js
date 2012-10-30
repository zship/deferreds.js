define(function(require) {

	var $ = require('jquery');
	var cmap = require('./collection/map');
	var forEach = require('./forEach');

	var map = function(eachfn, arr, iterator) {

		var superDeferred = $.Deferred();
		var results = [];

		arr = cmap(arr, function (val, i) {
			return {index: i, value: val};
		});

		forEach(arr, function(item) {
			return iterator(item.value)
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

		return superDeferred;

	};

	return map;

});
