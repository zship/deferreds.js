define(function(require) {

	var Deferred = require('./Deferred');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Returns `true` if any values in `list` pass `iterator` truth test
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var some = function(list, iterator) {

		var superDeferred = new Deferred();

		forEach(list, function(item, i) {
			return anyToDeferred(iterator(item, i, list))
				.done(function(result) {
					if (result) {
						superDeferred.resolve(true);
					}
				});
		}).fail(function() {
			superDeferred.reject.apply(superDeferred, arguments);
		}).done(function() {
			superDeferred.resolve(false);
		});

		return superDeferred.promise();

	};


	return some;

});
