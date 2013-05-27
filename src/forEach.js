define(function(require) {

	'use strict';


	var Deferred = require('./Deferred');
	var each = require('mout/collection/forEach');
	var size = require('mout/collection/size');


	/**
	 * Invoke `iterator` once for each function in `list`
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var forEach = function(list, iterator) {

		var superDeferred = new Deferred();

		if (!size(list)) {
			superDeferred.resolve();
			return superDeferred.promise();
		}

		var completed = 0;
		each(list, function(item, key) {
			Deferred.fromAny(iterator(item, key, list))
				.then(
					function() {
						completed++;
						if (completed === size(list)) {
							superDeferred.resolve();
						}
					},
					function() {
						superDeferred.reject.apply(superDeferred, arguments);
					}
				);
		});

		return superDeferred.promise();

	};


	return forEach;

});
