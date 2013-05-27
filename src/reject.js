define(function(require) {

	'use strict';


	var Deferred = require('./Deferred');
	var map = require('mout/collection/map');
	var pluck = require('mout/collection/pluck');
	var forEach = require('./forEach');


	/**
	 * Returns an array of all values in `list` without ones which the
	 * `iterator` truth test passes. Inverse of filter.
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var reject = function(list, iterator) {

		var superDeferred = new Deferred();
		var results = [];

		list = map(list, function(val, i) {
			return {index: i, value: val};
		});

		forEach(list, function(item) {
			return Deferred.fromAny(iterator(item.value, item.index, list))
				.then(function(result) {
					if (!result) {
						results.push(item);
					}
				});
		}).then(
			function() {
				results = results.sort(function(a, b) {
					return a.index - b.index;
				});
				results = pluck(results, 'value');
				superDeferred.resolve(results);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return reject;

});
