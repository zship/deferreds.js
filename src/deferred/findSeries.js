define(function(require) {

	var $ = require('jquery');
	var forEachSeries = require('./forEachSeries');

	var find = function(eachfn, arr, iterator) {

		var superDeferred = $.Deferred();

		forEachSeries(arr, function(item) {
			return iterator(item)
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

		return superDeferred;

	};

	return find;

});
