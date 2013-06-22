define(function(require) {

	'use strict';


	var Deferred = require('./Deferred');
	var Promise = require('./Promise');


	/**
	 * Repeatedly runs `iterator` until the result of `test` is false.
	 * @param {Function} test
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var whilst = function(test, iterator) {

		var deferred = new Deferred();

		var runTest = function(test, iterator) {
			Promise.fromAny(test()).then(
				function(result) {
					if (result) {
						runIterator(test, iterator);
					}
					else {
						deferred.resolve();
					}
				},
				function() {
					deferred.reject.apply(deferred, arguments);
				}
			);
		};

		var runIterator = function(test, iterator) {
			Promise.fromAny(iterator()).then(
				function() {
					runTest(test, iterator);
				},
				function() {
					deferred.reject.apply(deferred, arguments);
				}
			);
		};

		runTest(test, iterator);

		return deferred.promise();

	};


	return whilst;

});
