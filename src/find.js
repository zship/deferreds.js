define(function(require) {

	'use strict';


	var Promise = require('./Promise');
	var forEach = require('./forEach');


	/**
	 * Returns the first value in `list` matching the `iterator` truth test
	 * @param {Array} list
	 * @param {Function} iterator
	 * @return {Promise<Any>}
	 */
	var find = function(list, iterator) {

		var found;

		return forEach(list, function(item, i) {
			return Promise.fromAny(iterator(item, i, list))
				.then(function(result) {
					if (result) {
						found = item;
						throw 'break';
					}
				});
		}).then(
			function() {
				return found;
			},
			function(err) {
				if (err === 'break') {
					return found;
				}
				throw err;
			}
		);

	};


	return find;

});
