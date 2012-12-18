define(function(require) {

	var Deferred = require('./Deferred');
	var map = require('amd-utils/collection/map');
	var pluck = require('amd-utils/collection/pluck');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	var reject = function(list, iterator) {

		var superDeferred = new Deferred();
		var results = [];

		list = map(list, function(val, i) {
			return {index: i, value: val};
		});

		forEach(list, function(item) {
			return anyToDeferred(iterator(item.value, item.index, list))
				.done(function(result) {
					if (!result) {
						results.push(item);
					}
				});
		}).fail(function() {
			superDeferred.reject.apply(superDeferred, arguments);
		}).done(function() {
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
