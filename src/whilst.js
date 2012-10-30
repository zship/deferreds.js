define(function(require) {

	var $ = require('jquery');


	var whilst = function(test, iterator) {

		var superDeferred = $.Deferred();

		if (test()) {
			iterator()
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

		return superDeferred;

	};

	return whilst;

});
