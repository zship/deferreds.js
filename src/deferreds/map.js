define(function(require) {

	var Deferred = require('./Deferred');
	var cmap = require('amd-utils/collection/map');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	var map = function(list, iterator) {

		var superDeferred = new Deferred();
		var results = [];

		list = cmap(list, function (val, i) {
			return {index: i, value: val};
		});

		forEach(list, function(item) {
			return anyToDeferred(iterator(item.value, item.index, list))
				.fail(function() {
					superDeferred.reject.apply(superDeferred, arguments);
				})
				.done(function(transformed) {
					results[item.index] = transformed;
				});
		}).fail(function() {
			superDeferred.reject.apply(superDeferred, arguments);
		}).done(function() {
			superDeferred.resolve(results);
		});

		return superDeferred.promise();

	};


	return map;

});
