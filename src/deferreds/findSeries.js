define(function(require) {

	var Deferred = require('./Deferred');
	var forEachSeries = require('./forEachSeries');
	var anyToDeferred = require('./anyToDeferred');


	var find = function(list, iterator) {

		var superDeferred = new Deferred();

		forEachSeries(list, function(item, i) {
			return anyToDeferred(iterator(item, i, list))
				.done(function(result) {
					if (result) {
						superDeferred.resolve(item);
					}
				});
		}).fail(function() {
			superDeferred.reject.apply(superDeferred, arguments);
		}).done(function() {
			superDeferred.resolve(undefined);
		});

		return superDeferred.promise();

	};


	return find;

});
