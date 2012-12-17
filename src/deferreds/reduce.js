define(function(require) {

	var Deferred = require('./Deferred');
	var forEachSeries = require('./forEachSeries');
	var anyToDeferred = require('./anyToDeferred');


	var reduce = function(arr, memo, iterator) {

		var superDeferred = new Deferred();

		forEachSeries(arr, function(item, key) {
			return anyToDeferred(iterator(memo, item, key, arr));
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			superDeferred.resolve(memo);
		});

		return superDeferred.promise();

	};


	return reduce;

});
