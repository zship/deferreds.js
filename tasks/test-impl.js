module.exports = function(grunt) {

	'use strict';


	var runner = require('../test/runner');

	var forOwn = require('mout/object/forOwn');
	var jQuery = require('jquery');
	var Deferred = require('deferreds/Deferred');
	var Q = require('q');
	var RSVP = require('rsvp');
	var when = require('when');


	var _normalizeAdapter = function(adapter) {
		if (!adapter.fulfilled) {
			adapter.fulfilled = function (value) {
				var tuple = adapter.pending();
				tuple.fulfill(value);
				return tuple.promise;
			};
		}

		if (!adapter.rejected) {
			adapter.rejected = function (reason) {
				var tuple = adapter.pending();
				tuple.reject(reason);
				return tuple.promise;
			};
		}
	};


	var implementations = {

		'deferreds/Deferred 1.0.4': {
			pending: function() {
				var deferred = new Deferred();
				return {
					promise: deferred.promise(),
					fulfill: deferred.resolve.bind(deferred),
					reject: deferred.reject.bind(deferred)
				};
			}
		},

		'jQuery.Deferred 1.8.3': {
			pending: function() {
				var deferred = new jQuery.Deferred();
				return {
					promise: deferred.promise(),
					fulfill: deferred.resolve.bind(deferred),
					reject: deferred.reject.bind(deferred)
				};
			}
		},

		'Q 0.9.6': {
			fulfilled: Q.resolve,
			rejected: Q.reject,
			pending: function() {
				var deferred = Q.defer();
				return {
					promise: deferred.promise,
					fulfill: deferred.resolve,
					reject: deferred.reject
				};
			}
		},

		'RSVP 2.0.0': {
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
		},

		'when 2.2.0': {
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
		}
	};


	forOwn(implementations, function(adapter) {
		_normalizeAdapter(adapter);
	});


	grunt.registerTask('test-impl', function() {
		var done = this.async();

		var keys = Object.keys(implementations);
		var i = 0;

		var _run = function() {
			if (i === keys.length) {
				done();
				return;
			}

			var name = keys[i];
			var impl = implementations[name];
			i++;

			var title = 'Running test suite with: ' + name;
			grunt.log.writeln();
			grunt.log.writeln(title);
			for (var j = 0; j < title.length; j++) {
				grunt.log.write('-');
			}
			grunt.log.writeln();

			runner(impl, {}, _run);
		};

		_run();
	});

};
