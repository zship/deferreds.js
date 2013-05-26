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
					repoview: 'https://github.com/zship/deferreds.js/blob/develop/',
					types: (function() {
						var types = [];

						['Number', 'String', 'Object', 'Function', 'Array', 'RegExp', 'Boolean'].forEach(function(val) {
							types.push({
								name: val,
								link: 'https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/' + val
							});
						});

						types.push({
							name: 'Any',
							link: 'https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects'
						});

						types.push({
							name: 'void',
							link: 'https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/undefined'
						});

						types.push({
							name: 'Element',
							link: 'https://developer.mozilla.org/en-US/docs/DOM/element'
						});

						types.push({
							name: 'Constructor',
							link: 'https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/constructor'
						});

						types.push({
							name: 'jQuery',
							link: 'http://api.jquery.com/jQuery/'
						});

						types.push({
							name: 'jquery',
							link: 'http://api.jquery.com/jQuery/'
						});

						types.push({
							name: 'require',
							link: 'http://requirejs.org/'
						});

						types.push({
							regexp: /amd-utils\/.*/,
							link: 'http://millermedeiros.github.com/amd-utils/'
						});

						types.push({
							regexp: /dojo\/(.*)/,
							link: 'http://dojotoolkit.org/reference-guide/1.8/dojo/$1.html'
						});

						return types;
					})()
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
					src: 'src/**/*.js',
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


		requirejs: {
			baseUrl: '.',
			optimize: 'none',
			paths: {
				'deferreds': 'src',
				'mout': 'lib/mout'
			},
			keepBuildDir: true,
			locale: "en-us",
			useStrict: false,
			skipModuleInsertion: false,
			findNestedDependencies: false,
			removeCombined: false,
			preserveLicenseComments: false,
			logLevel: 0
		}

	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-nodefy');
	grunt.loadNpmTasks('grunt-amd-dist');
	grunt.loadNpmTasks('grunt-amd-doc');
	grunt.loadNpmTasks('grunt-amd-test');
	grunt.loadNpmTasks('grunt-amd-check');

	grunt.registerTask('test', ['amd-test', 'qunit']);
	grunt.registerTask('dist', ['clean:publish', 'nodefy', 'amd-dist', 'uglify', 'copy:publish']);
	//grunt.registerTask('dist', ['amd-dist', 'uglify']);

};
