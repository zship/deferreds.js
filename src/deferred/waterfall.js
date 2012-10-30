define(function(require) {

	var $ = require('jquery');
	var isArray = require('amd-utils/lang/isArray');
	var toArray = require('amd-utils/lang/toArray');
	var anyToDeferred = require('./anyToDeferred');
	var objkeys = require('amd-utils/object/keys');
	var size = require('../collection/size');


	var waterfall = function(tasks) {

		var superDeferred = $.Deferred();

		if (arguments.length > 1) {
			tasks = toArray(arguments);
		}

		if (!size(tasks)) {
			superDeferred.reject();
			return superDeferred;
		}

		var completed = 0;
		var keys;
		if (!isArray(tasks)) {
			keys = objkeys(tasks);
		}

		var iterate = function() {
			var args = toArray(arguments);
			var task;
			var key;

			if (isArray(tasks)) {
				key = completed;
				task = tasks[key];
			}
			else {
				key = keys[completed];
				task = tasks[key];
			}

			args.unshift(task);

			anyToDeferred.apply(this, args)
			.fail(function(err) {
				superDeferred.reject(key, err);
			})
			.done(function(result) {
				completed += 1;
				if (completed === size(tasks)) {
					superDeferred.resolve(result);
				}
				else {
					iterate(result);
				}
			});
		};

		iterate();

		return superDeferred;

	};

	return waterfall;

});
