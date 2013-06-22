define(function(require) {

	'use strict';


	var Promise = require('./Promise');
	var forEach = require('./forEach');


	/**
	 * Produces a new Array by mapping each item in `list` through the
	 * transformation function `iterator`.
	 * @param {Array} list
	 * @param {Function} iterator
	 * @return {Promise<Array>}
	 */
	var map = function(list, iterator) {

		var results = [];

		return forEach(list, function(item, i) {
			return Promise.fromAny(iterator(item, i, list))
				.then(function(transformed) {
					results[i] = transformed;
				});
		}).then(function() {
			return results;
		});

	};


	return map;

});
