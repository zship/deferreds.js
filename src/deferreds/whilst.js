define(function(require) {

	var Deferred = require('./Deferred');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Repeatedly runs `iterator` until the result of `test` is false.
	 * @param {Function} test
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var whilst = function(test, iterator) {

		var superDeferred = new Deferred();

		var runTest = function(test, iterator) {
			anyToDeferred(test())
				.fail(function() {
					superDeferred.reject.apply(superDeferred, arguments);
				})
				.done(function(result) {
					if (result) {
						runIterator(test, iterator);
					}
					else {
						superDeferred.resolve();
					}
				});
		};

		var runIterator = function(test, iterator) {
			anyToDeferred(iterator())
				.fail(function() {
					superDeferred.reject.apply(superDeferred, arguments);
				})
				.done(function() {
					runTest(test, iterator);
				});
		};

		runTest(test, iterator);

		return superDeferred.promise();

	};


	return whilst;

});
