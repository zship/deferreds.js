define(function(require) {

	'use strict';


	var Deferred = require('./Deferred');


	/**
	 * Repeatedly runs `iterator` until the result of `test` is true.
	 * @param {Function} test
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var until = function(test, iterator) {

		var superDeferred = new Deferred();

		var runTest = function(test, iterator) {
			Deferred.fromAny(test()).then(
				function(result) {
					if (result) {
						superDeferred.resolve();
					}
					else {
						runIterator(test, iterator);
					}
				},
				function() {
					superDeferred.reject.apply(superDeferred, arguments);
				}
			);
		};

		var runIterator = function(test, iterator) {
			Deferred.fromAny(iterator()).then(
				function() {
					runTest(test, iterator);
				},
				function() {
					superDeferred.reject.apply(superDeferred, arguments);
				}
			);
		};

		runTest(test, iterator);

		return superDeferred.promise();

	};


	return until;

});
