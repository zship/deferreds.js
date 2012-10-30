define(function(require) {

	var $ = require('jquery');
	var map = require('../collection/map');
	var pluck = require('../collection/pluck');
	var forEach = require('./forEach');

	var filter = function(eachfn, arr, iterator) {

		var superDeferred = $.Deferred();
		var results = [];

		arr = map(function(val, i) {
			return {index: i, value: val};
		});

		forEach(arr, function(item) {
			return iterator(item.value)
			.done(function() {
				results.push(item);
			});
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			results = results.sort(function(a, b) {
				return a.index - b.index;
			});
			results = pluck(results, 'value');
			superDeferred.resolve(results);
		});

		return superDeferred;

	};

	return filter;

});
