define(function(require) {

	'use strict';


	var Promise = require('./Promise');
	var forEachSeries = require('./forEachSeries');


	/**
	 * Version of filter which is guaranteed to process items in order
	 * @param {Array} list
	 * @param {Function} iterator
	 * @return {Promise<Array>}
	 */
	var filterSeries = function(list, iterator) {

		var results = [];

		return forEachSeries(list, function(item, i) {
			return Promise.fromAny(iterator(item, i, list))
				.then(function(result) {
					if (result === true) {
						results.splice(i, 0, item);
					}
				});
		}).then(function() {
			return results;
		});

	};


	return filterSeries;

});
