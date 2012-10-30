define(function(require) {

	var $ = require('jquery');
	var isArray = require('amd-utils/lang/isArray');
	var size = require('../collection/size');
	var objectKeys = require('amd-utils/object/keys');


	/**
	 * Version of forEach which is guaranteed to execute passed functions in
	 * order.
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {jQuery.Deferred}
	 */
	var forEachSeries = function(list, iterator) {

		var superDeferred = $.Deferred();

		if (!size(list)) {
			superDeferred.reject();
			return superDeferred;
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

			iterator(item, key)
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

		return superDeferred;

	};

	return forEachSeries;

});
