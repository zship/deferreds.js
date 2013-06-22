define(function(require) {

	'use strict';


	var Deferred = require('./Deferred');
	var forEachSeries = require('./forEachSeries');


	/**
	 * Version of map which is guaranteed to process items in order
	 * @param {Array} list
	 * @param {Function} iterator
	 * @return {Promise<Array>}
	 */
	var mapSeries = function(list, iterator) {

		var results = [];

		return forEachSeries(list, function(item, i) {
			return Deferred.fromAny(iterator(item, i, list))
				.then(function(transformed) {
					results[i] = transformed;
				});
		}).then(function() {
			return results;
		});

	};


	return mapSeries;

});
