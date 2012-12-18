define(function(require) {

	var Deferred = require('./Deferred');
	var anyToDeferred = require('./anyToDeferred');


	var until = function(test, iterator) {

		var superDeferred = new Deferred();

		var runTest = function(test, iterator) {
			anyToDeferred(test())
				.fail(function() {
					superDeferred.reject.apply(superDeferred, arguments);
				})
				.done(function(result) {
					if (result) {
						superDeferred.resolve();
					}
					else {
						runIterator(test, iterator);
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


	return until;

});
