define(function(require) {

	var when = require('./when');
	var isArray = require('amd-utils/lang/isArray');
	var toArray = require('amd-utils/lang/toArray');
	var anyToDeferred = require('./anyToDeferred');
	var forEach = require('./forEach');
	var map = require('./map');


	var parallel = function(tasks) {

		var superDeferred = when.defer();

		var wasPassedArguments = false;
		if (arguments.length > 1) {
			wasPassedArguments = true;
			tasks = toArray(arguments);
		}

		if (isArray(tasks)) {
			map(tasks, function(task) {
				return anyToDeferred(task);
			})
			.fail(function() {
				superDeferred.reject();
			})
			.done(function(results) {
				if (wasPassedArguments) {
					superDeferred.resolveWith(this, results);
				}
				else {
					superDeferred.resolve(results);
				}
			});
		}
		else {
			var results = {};
			forEach(tasks, function(task, key) {
				var deferred = anyToDeferred(task);
				return deferred.done(function(result) {
					results[key] = result;
				});
			})
			.fail(function() {
				superDeferred.reject();
			})
			.done(function() {
				superDeferred.resolve(results);
			});
		}

		return superDeferred.promise;

	};

	return parallel;

});
