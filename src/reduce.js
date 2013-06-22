define(function(require) {

	'use strict';


	var Promise = require('./Promise');
	var forEachSeries = require('./forEachSeries');


	/**
	 * Boils a `list` of values into a single value.
	 * @param {Array} list
	 * @param {Function} iterator
	 * @param {Any} memo
	 * @return {Promise}
	 */
	var reduce = function(list, iterator, memo) {

		return forEachSeries(list, function(item, key) {
			return Promise.fromAny(iterator(memo, item, key, list))
				.then(function(result) {
					memo = result;
				});
		}).then(function() {
			return memo;
		});

	};


	return reduce;

});
