'use strict';


var path = require('path');

var mixin = require('mout/object/mixIn');
var forOwn = require('mout/object/forOwn');
var difference = require('mout/array/difference');
var Mocha = require('mocha');
var glob = require('glob');
var Modules = require('amd-tools/util/Modules');

var requirejs = require('amd-tools/util/requirejs')({nodeRequire: require});


Mocha.prototype.loadFiles = function(fn){
	var self = this;
	var suite = this.suite;
	var pending = this.files.length;
	this.files.forEach(function(file){
		suite.emit('pre-require', global, file, self);
		suite.emit('require', requirejs(file), file, self);
		suite.emit('post-require', global, file, self);
		--pending || (fn && fn());
	});
};


var runner = function(rjsconfig, mochaOpts, callback) {
	requirejs.config(rjsconfig);
	mochaOpts = mixin({
		reporter: 'spec',
		timeout: 200,
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

	files.forEach(function(file) {
		var id = Modules.getId(file, rjsconfig);
		mocha.addFile(id);
	});

	var promiseImplementations = requirejs('test/promiseImplementations');
	var keys = Object.keys(promiseImplementations);
	var currImpl = requirejs('test/spec/promiseImpl');
	var i = 0;

	var _run = function() {
		if (i === keys.length) {
			callback();
			return;
		}

		var name = keys[i];
		var impl = promiseImplementations[name];
		mixin(currImpl, impl);
		i++;

		console.log('Running test suite with ' + name);
		console.log('---------------------------');

		mocha.run(function(err) {
			if (err) {
				throw err;
			}
			_run();
		});
	};

	_run();
};


module.exports = runner;
