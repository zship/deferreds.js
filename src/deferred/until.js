define(function(require) {

	var $ = require('jquery');


	var until = function(test, iterator) {

		var superDeferred = $.Deferred();

		if (!test()) {
			iterator()
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

		return superDeferred;

	};

	return until;

});
