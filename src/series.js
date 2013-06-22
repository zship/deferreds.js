define(function(require) {

	'use strict';


	var Promise = require('./Promise');
	var mapSeries = require('./mapSeries');


	/**
	 * Executes all passed Functions one at a time.
	 * @param {Array} tasks
	 * @return {Promise<Array>}
	 */
	var series = function(tasks) {

		return mapSeries(tasks, function(task) {
			return Promise.fromAny(task);
		});

	};


	return series;

});
