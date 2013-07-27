var nodeRequire = require;

define(function(require) {

	'use strict';


	var path = require('path');
	var mixin = require('mout/object/mixIn');
	var difference = require('mout/array/difference');
	var Mocha = require('mocha');
	var glob = require('glob');


	var runner = function(adapter, mochaOpts, callback) {

		mochaOpts = mixin({
			reporter: 'spec',
			timeout: 500,
			slow: Infinity,
			bail: true
		}, mochaOpts);


		var mocha = new Mocha(mochaOpts);

		var include = glob.sync('spec/*.js', {
			cwd: __dirname
		}).map(function(file) {
			return path.resolve(__dirname, file);
		});

		var exclude = ['Promise.js', 'promiseImpl.js'].map(function(file) {
			return path.resolve(__dirname, 'spec', file);
		});

		var files = difference(include, exclude);
		files = files.map(function(file) {
			mocha.addFile(file);
			return file;
		});

		global.adapter = adapter;

		mocha.run(function(err) {
			if (err) {
				throw err;
			}
			files.forEach(function(file) {
				delete nodeRequire.cache[file];
			});
			callback();
		});

	};


	return runner;

});
