define(function(require) {

	'use strict';


	var grunt = require('grunt');
	var promisesAplusTests = require('promises-aplus-tests');

	var Deferred = require('deferreds/Deferred');


	grunt.registerTask('promises-aplus-test', 'Runs Promises/A+ test suite on Deferred.js', function() {
		var done = this.async();

		var adapter = {
			pending: function() {
				var deferred = new Deferred();
				return {
					promise: deferred.promise(),
					fulfill: function(value) {
						deferred.resolve(value);
					},
					reject: function(reason) {
						deferred.reject(reason);
					}
				};
			}
		};

		promisesAplusTests(adapter, {bail: true}, function(err) {
			done();
		});
	});

});
