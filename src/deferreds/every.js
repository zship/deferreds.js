define(function(require) {

	var Deferred = require('./Deferred');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	var every = function(arr, iterator) {

		var superDeferred = new Deferred();

		forEach(arr, function(item, i) {
			return anyToDeferred(iterator(item, i))
			.fail(function() {
				superDeferred.reject();
			});
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			superDeferred.resolve();
		});

		return superDeferred.promise();

	};


	return every;

});
