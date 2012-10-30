define(function(require) {

	var when = require('./when');


	var whilst = function(test, iterator) {

		var superDeferred = when.defer();

		if (test()) {
			when(iterator())
			.fail(function(err) {
				superDeferred.reject(err);
			})
			.done(function() {
				whilst(test, iterator);
			});
		}
		else {
			superDeferred.resolve();
		}

		return superDeferred.promise;

	};

	return whilst;

});
