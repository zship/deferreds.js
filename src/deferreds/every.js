define(function(require) {

	var Deferred = require('./Deferred');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Returns `true` if all values in `list` pass `iterator` truth test
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var every = function(list, iterator) {

		var superDeferred = new Deferred();

		forEach(list, function(item, i, list) {
			return anyToDeferred(iterator(item, i, list))
				.done(function(result) {
					if (result !== true) {
						superDeferred.resolve(false);
					}
				});
		}).fail(function() {
			superDeferred.reject.apply(superDeferred, arguments);
		}).done(function() {
			superDeferred.resolve(true);
		});

		return superDeferred.promise();

	};


	return every;

});
