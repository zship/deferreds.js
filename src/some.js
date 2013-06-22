define(function(require) {

	'use strict';


	var Promise = require('./Promise');
	var forEach = require('./forEach');


	/**
	 * Returns `true` if any values in `list` pass `iterator` truth test
	 * @param {Array} list
	 * @param {Function} iterator
	 * @return {Promise<Boolean>}
	 */
	var some = function(list, iterator) {

		return forEach(list, function(item, i) {
			return Promise.fromAny(iterator(item, i, list))
				.then(function(result) {
					if (result) {
						throw 'break';
					}
				});
		}).then(
			function() {
				return false;
			},
			function(err) {
				if (err === 'break') {
					return true;
				}
				throw err;
			}
		);

	};


	return some;

});
