define(function(require) {

	var when = require('./when');
	var anyToDeferred = require('./anyToDeferred');


	var until = function(test, iterator) {

		var superDeferred = when.defer();

		if (!test()) {
			anyToDeferred(iterator())
			.fail(function(err) {
				superDeferred.reject(err);
			})
			.done(function() {
				until(test, iterator);
			});
		}
		else {
			superDeferred.resolve();
		}

		return superDeferred.promise;

	};

	return until;

});
