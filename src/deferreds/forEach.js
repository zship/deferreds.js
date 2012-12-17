define(function(require) {

	var Deferred = require('./Deferred');
	var each = require('amd-utils/collection/forEach');
	var size = require('amd-utils/collection/size');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Invoke **iterator** once for each function in **arr**.
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {jQuery.Deferred}
	 */
	var forEach = function(list, iterator) {

		var superDeferred = new Deferred();

		if (!size(list)) {
			superDeferred.reject();
			return superDeferred.promise;
		}

		var completed = 0;
		each(list, function(item, key) {
			anyToDeferred(iterator(item, key))
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

		return superDeferred.promise();

	};


	return forEach;

});
