define(function(require) {

	'use strict';


	var Deferred = require('./Deferred');
	var Promise = require('./Promise');


	/**
	 * Version of forEach which is guaranteed to execute passed functions in
	 * order.
	 * @param {Array} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var forEachSeries = function(list, iterator) {

		var deferred = new Deferred();

		if (!list.length) {
			deferred.resolve();
			return deferred.promise();
		}

		var completed = 0;

		var iterate = function() {
			Promise.fromAny(iterator(list[completed], completed, list))
				.then(
					function() {
						completed += 1;
						if (completed === list.length) {
							deferred.resolve();
						}
						else {
							iterate();
						}
					},
					function() {
						deferred.reject.apply(deferred, arguments);
					}
				);
		};
		iterate();

		return deferred.promise();

	};


	return forEachSeries;

});
