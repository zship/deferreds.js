define(function(require) {

	var $ = require('jquery');
	var forEachSeries = require('./forEachSeries');

	var reduce = function(arr, memo, iterator) {

		var superDeferred = $.Deferred();

		forEachSeries(arr, function(item, key) {
			return iterator(memo, item, key, arr);
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			superDeferred.resolve(memo);
		});

		return superDeferred;

	};

	return reduce;

});
