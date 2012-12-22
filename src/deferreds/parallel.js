define(function(require) {

	var Deferred = require('./Deferred');
	var isArray = require('amd-utils/lang/isArray');
	var toArray = require('amd-utils/lang/toArray');
	var anyToDeferred = require('./anyToDeferred');
	var forEach = require('./forEach');
	var map = require('./map');


	/**
	 * Executes all passed Functions in parallel.
	 * @param {Any} tasks
	 * @return {Promise}
	 */
	var parallel = function(tasks) {

		var superDeferred = new Deferred();

		var isArguments = false;
		if (arguments.length > 1) {
			isArguments = true;
			tasks = toArray(arguments);
		}

		if (isArray(tasks)) {
			map(tasks, function(task) {
				return anyToDeferred(task);
			}).fail(function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}).done(function(results) {
				if (isArguments) {
					superDeferred.resolve.apply(superDeferred, results);
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
