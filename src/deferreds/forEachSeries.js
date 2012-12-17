define(function(require) {

	var Deferred = require('./Deferred');
	var isArray = require('amd-utils/lang/isArray');
	var size = require('amd-utils/collection/size');
	var objectKeys = require('amd-utils/object/keys');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Version of forEach which is guaranteed to execute passed functions in
	 * order.
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {jQuery.Deferred}
	 */
	var forEachSeries = function(list, iterator) {

		var superDeferred = new Deferred();

		if (!size(list)) {
			superDeferred.reject();
			return superDeferred.promise;
		}

		var completed = 0;
		var keys;
		if (!isArray(list)) {
			keys = objectKeys(list);
		}

		var iterate = function() {
			var item;
			var key;

			if (isArray(list)) {
				key = completed;
				item = list[key];
			}
			else {
				key = keys[completed];
				item = list[key];
			}

			anyToDeferred(iterator(item, key))
			.fail(function() {
				superDeferred.reject();
			})
			.done(function() {
				completed += 1;
				if (completed === size(list)) {
					superDeferred.resolve();
				}
				else {
					iterate();
				}
			});
		};
		iterate();

		return superDeferred.promise();

	};


	return forEachSeries;

});
