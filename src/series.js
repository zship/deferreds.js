define(function(require) {

	'use strict';


	var Deferred = require('./Deferred');
	var isArray = require('mout/lang/isArray');
	var toArray = require('mout/lang/toArray');
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
				return Deferred.fromAny(task);
			}).then(
				function(results) {
					if (isArguments) {
						superDeferred.resolve.apply(superDeferred, results);
					}
					else {
						superDeferred.resolve(results);
					}
				},
				function() {
					superDeferred.reject.apply(superDeferred, arguments);
				}
			);
		}
		else {
			var results = {};
			forEachSeries(tasks, function(task, key) {
				var deferred = Deferred.fromAny(task);
				return deferred.then(function(result) {
					results[key] = result;
				});
			}).then(
				function() {
					superDeferred.resolve(results);
				},
				function() {
					superDeferred.reject.apply(superDeferred, arguments);
				}
			);
		}

		return superDeferred.promise();

	};


	return series;

});