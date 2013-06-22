define(function(require) {

	'use strict';


	var Deferred = require('./Deferred');
	var forEach = require('./forEach');


	/**
	 * Returns `true` if all values in `list` pass `iterator` truth test
	 * @param {Array} list
	 * @param {Function} iterator
	 * @return {Promise<Boolean>}
	 */
	var every = function(list, iterator) {

		return forEach(list, function(item, i, list) {
			return Deferred.fromAny(iterator(item, i, list))
				.then(function(result) {
					if (!result) {
						throw 'break';
					}
				});
		}).then(
			function() {
				return true;
			},
			function(err) {
				if (err === 'break') {
					return false;
				}
				throw err;
			}
		);

	};


	return every;

});
