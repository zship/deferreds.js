define(function(require) {

	var Deferred = require('./Deferred');
	var anyToDeferred = require('./anyToDeferred');


	var until = function(test, iterator) {

		var superDeferred = new Deferred();

		if (test() === false) {
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

		return superDeferred.promise();

	};


	return until;

});
