define(function(require) {

	var Deferred = require('./Deferred');
	var anyToDeferred = require('./anyToDeferred');


	var whilst = function(test, iterator) {

		var superDeferred = new Deferred();

		if (test() === true) {
			anyToDeferred(iterator())
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

		return superDeferred.promise();

	};


	return whilst;

});
