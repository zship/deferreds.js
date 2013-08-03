'use strict';


var when = require('when');


var adapter = {
	name: 'when 2.2.0',
	fulfilled: when.resolve,
	rejected: when.reject,
	pending: function () {
		var pending = {};
		pending.promise = when.promise(function(resolve, reject) {
			pending.fulfill = resolve;
			pending.reject = reject;
		});
		return pending;
	}
};


module.exports = adapter;
