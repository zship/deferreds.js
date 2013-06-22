define(function(require) {

	'use strict';


	var Deferred = require('./Deferred');
	var Promise = require('./Promise');


	/**
	 * Invoke `iterator` once for each function in `list`
	 * @param {Array} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var forEach = function(list, iterator) {

		var deferred = new Deferred();

		if (!list.length) {
			deferred.resolve();
			return deferred.promise();
		}

		var completed = 0;
		list.forEach(function(item, i) {
			Promise.fromAny(iterator(item, i, list))
				.then(
					function() {
						completed++;
						if (completed === list.length) {
							deferred.resolve();
						}
					},
					function() {
						deferred.reject.apply(deferred, arguments);
					}
				);
		});

		return deferred.promise();

	};


	return forEach;

});
