define(function(require) {

	var $ = require('jquery');
	var forEach = require('./forEach');

	var find = function(eachfn, arr, iterator) {

		var superDeferred = $.Deferred();

		forEach(arr, function(item) {
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
