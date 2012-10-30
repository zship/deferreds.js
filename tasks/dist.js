module.exports = function(grunt) {
	'use strict';

	var libdir = '../lib';
	var requirejs = require(libdir + '/r.js');
	var rjsconfig = require('./rjsconfig');
	var _ = grunt.utils._;


	grunt.registerTask('dist', 'Runs requirejs optimizer', function() {
		var config = grunt.config.get(this.name);
		var done = this.async();
		var files = [];
		var baseUrl = rjsconfig.baseUrl;
		var rStripBaseUrl = new RegExp('^' + baseUrl + '\\/');


		//------------------------------------------------------------
		// Transform globbed config values into lists of files
		//------------------------------------------------------------
		if (_.isString(config.include)) {
			config.include = [config.include];
		}

		config.include.forEach(function(val) {
			files = files.concat(
				grunt.file.expandFiles(baseUrl + '/' + val).map(function(path) {
					return path.replace(rStripBaseUrl, '').replace('.js', '');
				})
			);
		});


		config.exclude = config.exclude || [];
		if (_.isString(config.exclude)) {
			config.exclude = [config.exclude];
		}

		config.exclude.forEach(function(val) {
			var excludedFiles = grunt.file.expandFiles(baseUrl + '/' + val).map(function(path) {
				return path.replace(rStripBaseUrl, '').replace('.js', '');
			});
			files = _.difference(files, excludedFiles);
		});

		//'include' is a requirejs property. We used the name for our own
		//purpose, now reassign it to align with requirejs' meaning.
		config.include = _.uniq(files);
		files = [];


		config.excludeBuilt = config.excludeBuilt || [];
		if (_.isString(config.excludeBuilt)) {
			config.excludeBuilt = [config.excludeBuilt];
		}

		config.excludeBuilt.forEach(function(val) {
			files = files.concat(
				grunt.file.expandFiles(baseUrl + '/' + val).map(function(path) {
					return path.replace(rStripBaseUrl, '').replace('.js', '');
				})
			);
		});

		//'exclude' is a requirejs property meaning 'exclude a module and its
		//dependencies'. We used the name for our own purpose, now reassign it
		//to align with requirejs' meaning.
		config.exclude = _.uniq(files);
		files = [];


		config.excludeShallow = config.excludeShallow || [];
		if (_.isString(config.excludeShallow)) {
			config.excludeShallow = [config.excludeShallow];
		}

		config.excludeShallow.forEach(function(val) {
			files = files.concat(
				grunt.file.expandFiles(baseUrl + '/' + val).map(function(path) {
					return path.replace(rStripBaseUrl, '').replace('.js', '');
				})
			);
		});

		config.excludeShallow = _.uniq(files);


		//use almond to remove requirejs dependency
		if (config.standalone) {
			config.name = libdir + '/almond';
			config.wrap = {};
			config.wrap.start = '(function() {\n\t"use strict";';
			config.wrap.end = '\n})();';
		}



		//------------------------------------------------------------
		// Merge our config values into a config object compatible with
		// requirejs
		//------------------------------------------------------------
		config = _.extend(rjsconfig, config);

		requirejs.optimize(config, function (buildResponse) {
			if (!config.standalone) {
				done();
				return;
			}

			var basePath = _.initial(__dirname.split('/')).join('/');
			var exportPaths = [];
			config.exports.forEach(function(val) {
				exportPaths = exportPaths.concat(
					grunt.file.expandFiles(basePath + '/' + baseUrl + '/' + val)
				);
			});

			config.exportsExclude.forEach(function(val) {
				var excludedFiles = grunt.file.expandFiles(basePath + '/' + baseUrl + '/' + val);
				exportPaths = _.difference(exportPaths, excludedFiles);
			});

			//when built without requirejs support, provide global references to
			//requested objects in the dependency graph (requested with <config:dist.exports>)
			var deps = buildResponse.split('\n');
			deps = _.chain(deps)
				.compact()
				.rest(2)
				.filter(function(path) {
					return _.contains(exportPaths, path);
				})
				.map(function(path) {
					path = path.replace(new RegExp('^' + basePath), '');
					path = path.replace(/^\/src\//, '');
					path = path.replace(/\.js/, '');
					return path;
				})
				.value();

			//console.log(deps);

			var appendString = '\n\n/*\n';
			appendString += '-------------------------------------------\n';
			appendString += 'Global definitions for a built deferreds.js\n';
			appendString += '-------------------------------------------\n';
			appendString += '*/\n\n';
			appendString += 'window.Deferreds = {\n';
			for (var i = 0; i < deps.length; i++) {
				var path = deps[i];
				appendString += '\t"' + _.last(path.split('/')) + '": require("' + path + '")';
				if (i < deps.length - 1) {
					appendString += ',\n';
				}
				else {
					appendString += '\n';
				}
			}
			appendString += '};\n';

			var contents = grunt.file.read(config.out);
			contents += appendString;
			grunt.file.write(config.out, contents, 'utf-8');

			done();
		});

	});

};
