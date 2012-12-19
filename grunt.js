module.exports = function( grunt ) {

	"use strict";

	//grunt's jshint helper expects options to be in an 'options' property
	function readJshint( path ) {
		var data = {};
		try {
			data = grunt.file.readJSON( path );
			grunt.utils._.each(data, function(val, key, o) {
				o.options = o.options || {};
				if (key !== 'globals') {
					o.options[key] = val;
					delete o[key];
				}
			});
			grunt.verbose.write( "Reading " + path + "..." ).ok();
		} catch(e) {}
		return data;
	}

	grunt.initConfig({
		pkg: '<json:package.json>',


		meta: {
			banner: '/*! <%= pkg.title %> v<%= pkg.version %> | MIT license */'
		},


		dist: {
			out: 'dist/deferreds.js',
			//remove requirejs dependency from built package (almond)
			standalone: true,
			//build standalone for node or browser
			env: 'node',
			//env: 'browser',
			exports: 'deferreds',
			//String or Array of files for which to trace dependencies and build
			include: 'src/deferreds/**/*.js',
			//include: 'src/deferreds/waterfall.js',
			//exclude files from the 'include' list. Useful to add specific
			//exceptions to globbing.
			exclude: [],
			//exclude files and their dependencies from the *built* source
			//Difference from 'exclude': files in 'excludeBuilt' will be
			//excluded even if they are dependencies of files in 'include'
			excludeBuilt: [],
			//exclude files from the *built* source, but keep any dependencies of the files.
			excludeShallow: []
		},


		doc: {
			repoview: 'https://github.com/zship/deferreds.js/blob/develop/',
			include: 'src/deferreds/**/*.js',
			types: (function() {
				var types = [];

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
		},


		clean: [
			'<config:dist.out>',
			'<config:min.dist.dest>'
		],


		min: {
			dist: {
				src: ['<banner>', 'dist/deferreds.js'],
				dest: 'dist/deferreds.min.js'
			}
		},


		uglify: {
			codegen: {
				ascii_only: true,
				beautify: false,
				max_line_length: 1000
			}
		},


		lint: {
			files: 'src/**/*.js'
		},


		jshint: (function() {
			return readJshint('src/.jshintrc') || {};
		})(),


		test: {
			generateFailing: ['src/deferreds/*.js'],
			run: false
		},


		server: {
			port: 8000,
			base: '.'
		},


		requirejs: {
			baseUrl: 'src/deferreds',
			optimize: 'none',
			packages: [
				{ name: 'amd-utils', location: '../lib/amd-utils/src' }
			],
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

	// no-arg grunt
	//grunt.registerTask( 'default', 'update_submodules dist min' );
	
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-amd-doc');

	grunt.loadTasks('tasks');
	grunt.loadTasks('tasks/dist');
	grunt.loadTasks('tasks/test');

};
