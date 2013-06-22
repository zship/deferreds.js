define(function(require) {

	'use strict';


	var Promise = require('./Promise');
	var map = require('./map');


	/**
	 * Executes all passed Functions in parallel.
	 * @param {Array} tasks
	 * @return {Promise<Array>}
	 */
	var parallel = function(tasks) {

		return map(tasks, function(task) {
			return Promise.fromAny(task);
		});

	};


	return parallel;

});
