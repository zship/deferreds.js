define(function(require) {

	var Deferred = require('./Deferred');
	var cmap = require('amd-utils/collection/map');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Produces a new Array by mapping each item in `list` through the
	 * transformation function `iterator`.
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var map = function(list, iterator) {

		var superDeferred = new Deferred();
		var results = [];

		list = cmap(list, function (val, i) {
			return {index: i, value: val};
		});

		forEach(list, function(item) {
			return anyToDeferred(iterator(item.value, item.index, list))
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
