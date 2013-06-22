define(function(require) {

	'use strict';


	var partial = require('mout/function/partial');

	var Deferred = require('./Deferred');
	var Promise = require('./Promise');
	var toArray = require('mout/lang/toArray');


	/**
	 * Executes all passed Functions one at a time, each time passing the
	 * result to the next function in the chain.
	 * @param {Array} tasks
	 * @return {Promise}
	 */
	var pipe = function(tasks) {

		var deferred = new Deferred();
		var completed = 0;

		var iterate = function() {
			var args = toArray(arguments);
			var task = tasks[completed];
			args.unshift(task);
			Promise.fromAny( partial.apply(task, args) )
				.then(
					function() {
						completed++;
						if (completed === tasks.length) {
							deferred.resolve.apply(deferred, arguments);
						}
						else {
							iterate.apply(deferred, arguments);
						}
					},
					function() {
						deferred.reject.apply(deferred, arguments);
					}
				);
		};

		iterate();

		return deferred.promise();

	};


	return pipe;

});
