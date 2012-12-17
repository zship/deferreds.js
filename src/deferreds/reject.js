define(function(require) {

	var Deferred = require('./Deferred');
	var map = require('amd-utils/collection/map');
	var pluck = require('amd-utils/collection/pluck');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	var reject = function(eachfn, arr, iterator) {

		var superDeferred = new Deferred();
		var results = [];

		arr = map(arr, function(val, i) {
			return {index: i, value: val};
		});

		forEach(arr, function (item) {
			return anyToDeferred(iterator(item.value, item.index))
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

		return superDeferred.promise();

	};


	return reject;

});
