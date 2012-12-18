define(function(require) {

	var Deferred = require('./Deferred');
	var isArray = require('amd-utils/lang/isArray');
	var toArray = require('amd-utils/lang/toArray');
	var anyToDeferred = require('./anyToDeferred');
	var forEach = require('./forEach');
	var map = require('./map');


	var parallel = function(tasks) {

		var superDeferred = new Deferred();

		if (arguments.length > 1) {
			tasks = toArray(arguments);
		}

		if (isArray(tasks)) {
			map(tasks, function(task) {
				return anyToDeferred(task);
			}).fail(function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}).done(function(results) {
				superDeferred.resolve(results);
			});
		}
		else {
			var results = {};
			forEach(tasks, function(task, key) {
				var deferred = anyToDeferred(task);
				return deferred.done(function(result) {
					results[key] = result;
				});
			}).fail(function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}).done(function() {
				superDeferred.resolve(results);
			});
		}

		return superDeferred.promise();

	};


	return parallel;

});
