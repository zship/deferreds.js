define(function(require) {

	var Deferred = require('./Deferred');
	var forEachSeries = require('./forEachSeries');
	var anyToDeferred = require('./anyToDeferred');


	var find = function(eachfn, arr, iterator) {

		var superDeferred = new Deferred();

		forEachSeries(arr, function(item, i) {
			return anyToDeferred(iterator(item), i)
			.done(function() {
				superDeferred.resolve(item);
			});
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			superDeferred.reject();
		});

		return superDeferred.promise();

	};


	return find;

});
