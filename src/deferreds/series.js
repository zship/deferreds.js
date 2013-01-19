define(function(require) {

	var Deferred = require('./Deferred');
	var isArray = require('mout/lang/isArray');
	var toArray = require('mout/lang/toArray');
	var anyToDeferred = require('./anyToDeferred');
	var forEachSeries = require('./forEachSeries');
	var mapSeries = require('./mapSeries');


	/**
	 * Executes all passed Functions one at a time.
	 * @param {Any} tasks
	 * @return {Promise}
	 */
	var series = function(tasks) {

		var superDeferred = new Deferred();

		var isArguments = false;
		if (arguments.length > 1) {
			isArguments = true;
			tasks = toArray(arguments);
		}

		if (isArray(tasks)) {
			mapSeries(tasks, function(task) {
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
			forEachSeries(tasks, function(task, key) {
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


	return series;

});
