define(function(require) {

	'use strict';


	var Deferred = require('./Deferred');
	var forEach = require('./forEach');


	/**
	 * Returns `true` if all values in `list` pass `iterator` truth test
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var every = function(list, iterator) {

		var superDeferred = new Deferred();

		forEach(list, function(item, i, list) {
			return Deferred.fromAny(iterator(item, i, list))
				.then(function(result) {
					if (result !== true) {
						superDeferred.resolve(false);
					}
				});
		}).then(
			function() {
				superDeferred.resolve(true);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return every;

});
