define(function(require) {

	var $ = require('jquery');
	var map = require('../collection/map');
	var pluck = require('../collection/pluck');
	var forEachSeries = require('./forEachSeries');

	var rejectSeries = function(eachfn, arr, iterator) {

		var superDeferred = $.Deferred();
		var results = [];

		arr = map(arr, function(val, i) {
			return {index: i, value: val};
		});

		forEachSeries(arr, function (item) {
			return iterator(item.value)
			.fail(function() {
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

	return rejectSeries;

});
