module.exports = function(grunt) {

	'use strict';


	var requirejs = require('requirejs');
	var mixin = require('mout/object/mixIn');
	requirejs.config({
		baseUrl: __dirname,
		nodeRequire: require,
		paths: {
			'setImmediate': 'setimmediate'
		}
	});

	var Deferred = requirejs('../src/Deferred');
	var promisesAplusTests = require('promises-aplus-tests');


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

};
