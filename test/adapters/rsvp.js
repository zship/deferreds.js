'use strict';


var RSVP = require('rsvp');


var adapter = {
	name: 'RSVP 2.0.0',
	fulfilled: function(value) {
		return new RSVP.Promise(function(resolve, reject) {
			resolve(value);
		});
	},
	rejected: function(error) {
		return new RSVP.Promise(function(resolve, reject) {
			reject(error);
		});
	},
	pending: function () {
		var pending = {};
		pending.promise = new RSVP.Promise(function(resolve, reject) {
			pending.fulfill = resolve;
			pending.reject = reject;
		});
		return pending;
	}
};


module.exports = adapter;
