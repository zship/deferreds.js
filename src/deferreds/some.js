define(function(require) {

	var Deferred = require('./Deferred');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	var some = function(arr, iterator) {

		var superDeferred = new Deferred();

		forEach(arr, function(item, i) {
			return anyToDeferred(iterator(item, i))
			.done(function() {
				superDeferred.resolve();
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


	return some;

});
