define(function(require) {

	var when = require('./when');
	var each = require('./collection/forEach');
	var size = require('./collection/size');


	/**
	 * Invoke **iterator** once for each function in **arr**.
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {jQuery.Deferred}
	 */
	var forEach = function(list, iterator) {

		var superDeferred = when.defer();

		if (!size(list)) {
			superDeferred.reject();
			return superDeferred.promise;
		}

		var completed = 0;
		each(list, function(item, key) {
			when(iterator(item, key))
			.fail(function() {
				superDeferred.reject();
			})
			.done(function() {
				completed++;
				if (completed === size(list)) {
					superDeferred.resolve();
				}
			});
		});

		return superDeferred.promise;

	};

	return forEach;

});
