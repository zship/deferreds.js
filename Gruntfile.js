/*global require:false */

var path = require('path');
var fs = require('fs');
var rjsconfig = JSON.parse(fs.readFileSync(path.resolve('.amdconfig')));

var Module = require('module');
var Modules = require('amd-tools/util/Modules');

var _isInProject = function(filename) {
	return (
		filename.indexOf(path.resolve('.')) !== -1 &&
		filename.indexOf(path.resolve('node_modules')) === -1
	);
};

var _resolveFilename = Module._resolveFilename;
Module._resolveFilename = function(request, parent) {
	var dirname = path.dirname(parent.filename);
	if (!_isInProject(dirname)) {
		return _resolveFilename.apply(this, arguments);
	}

	var filename = Modules.getFile(request, dirname, rjsconfig);
	if (filename) {
		return filename;
	}

	return _resolveFilename.apply(this, arguments);
};

var _extensionsJs = require.extensions['.js'];
require.extensions['.js'] = function(localModule, filename) {
	if (!_isInProject(filename)) {
		return _extensionsJs.apply(this, arguments);
	}

	var contents = fs.readFileSync(filename, 'utf8');
	contents = 'if (typeof define !== "function") { var define = require("amdefine")(module) }\n\n' + contents;
	localModule._compile(contents, filename);
};


module.exports = function( grunt ) {

	"use strict";


	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),


		'amd-dist': {
			all: {
				options: {
					//remove requirejs dependency from built package (almond)
					standalone: true,
					//build standalone for node or browser
					//env: 'node',
					env: 'browser',
					exports: 'Deferreds'
				},
				files: [{
					src: 'src/**/*.js',
					dest: 'dist/browser/Deferreds.js'
				}]
			}
		},


		'amd-doc': {
			all: {
				src: 'src/**/*.js',
				options: {
					out: 'doc/out',
					cache: 'doc/cache',
					mixin: 'doc/mixin',
					srcview: function(file, line) {
						var repo = 'https://github.com/zship/deferreds.js/blob/master/';
						return repo + path.relative('.', file) + '#L' + line;
					},
					types: function(name, own) {
						if (own) {
							return '#/' + name;
						}

						if (name.search(/^mout\//) !== -1) {
							var parts = name.split('/');
							if (parts.length === 3) {
								return 'http://moutjs.com/docs/v0.6.0/' + parts[1] + '.html#' + parts[2];
							}
							return 'http://moutjs.com/docs/v0.6.0/' + parts[1] + '.html';
						}
						if (name === 'signals') {
							return 'http://millermedeiros.github.io/js-signals/';
						}
						if (name === 'setimmediate') {
							return 'https://github.com/NobleJS/setImmediate';
						}
					},
					depLink: function(id) {
						if (id.search(/^deferreds\//) !== -1) {
							return '#/' + id;
						}
						if (id.search(/^mout\//) !== -1) {
							var parts = id.split('/');
							if (parts.length === 3) {
								return 'http://moutjs.com/docs/v0.6.0/' + parts[1] + '.html#' + parts[2];
							}
							return 'http://moutjs.com/docs/v0.6.0/' + parts[1] + '.html';
						}
						if (id === 'signals') {
							return 'http://millermedeiros.github.io/js-signals/';
						}
						if (id === 'setimmediate') {
							return 'https://github.com/NobleJS/setImmediate';
						}
						return '';
					}
				}
			}
		},


		uglify: {
			all: {
				options: {
					banner: '/*! <%= pkg.name %> v<%= pkg.version %> | MIT license */\n'
				},
				files: [
					{
						src: 'dist/browser/Deferreds.js',
						dest: 'dist/browser/Deferreds.min.js'
					}
				]
			}
		},


		jshint: {
			src: {
				options: {
					jshintrc: 'src/.jshintrc'
				},
				files: {
					src: 'src/**/*.js'
				}
			},
			test: {
				options: {
					jshintrc: 'test/unit/.jshintrc'
				},
				files: {
					src: 'test/unit/**/*.js'
				}
			}
		},


		'amd-test': {
			mode: 'qunit',
			runner: 'test/runner.html',
			files: ['test/lib/es5-shim.js', 'test/unit/**/*.js']
		},


		connect: {
			test: {
				options: {
					port: 8080,
					base: '.',
					keepalive: true
				}
			}
		},


		qunit: {
			all: {
				files: {
					src: 'test/runner.html'
				},
				options: {
					'--web-security': false
					//'--remote-debugger-port': 9222
				}
			}
		},


		'amd-check': {
			files: ['src/**/*.js', 'test/unit/**/*.js']
		},


		nodefy: {
			all: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: '**/*.js',
					dest: 'dist/'
				}]
			}
		},


		copy: {
			publish: {
				files: [
					{
						src: [
							'package.json',
							'MIT-LICENSE.txt',
							'README.md'
						],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'src/',
						src: '**/*.js',
						dest: 'dist/amd/'
					}
				]
			}
		},


		clean: {
			publish: {
				files: [{
					src: 'dist/'
				}]
			}
		},


		requirejs: grunt.file.readJSON('.amdconfig')

	});


	grunt.loadTasks('tasks');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-nodefy');
	grunt.loadNpmTasks('grunt-amd-dist');
	grunt.loadNpmTasks('grunt-amd-doc');

	grunt.registerTask('test', ['promises-aplus-test', 'test-impl']);
	grunt.registerTask('dist', ['clean:publish', 'nodefy', 'amd-dist', 'uglify', 'copy:publish']);
	//grunt.registerTask('dist', ['amd-dist', 'uglify']);

};
