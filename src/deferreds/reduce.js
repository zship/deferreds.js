define(function(require) {

	var Deferred = require('./Deferred');
	var forEachSeries = require('./forEachSeries');
	var anyToDeferred = require('./anyToDeferred');


	var reduce = function(list, iterator, memo) {

		var superDeferred = new Deferred();

		forEachSeries(list, function(item, key) {
			return anyToDeferred(iterator(memo, item, key, list))
				.done(function(result) {
					memo = result;
				});
		}).fail(function() {
			superDeferred.reject.apply(superDeferred, arguments);
		}).done(function() {
			superDeferred.resolve(memo);
		});

		return superDeferred.promise();

	};


	return reduce;

});
