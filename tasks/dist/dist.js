module.exports = function(grunt) {
	'use strict';

	var path = require('path');
	var libdir = path.resolve(__dirname + '/lib');
	var requirejs = require(libdir + '/r.js');
	var util = require('./util.js');
	var _ = grunt.utils._;


	grunt.registerTask('dist', 'Runs requirejs optimizer', function() {
		var config = grunt.config.get(this.name);
		var done = this.async();

		var rjsconfig = grunt.config.get('requirejs');

		['include', 'exclude', 'excludeBuilt', 'excludeShallow'].forEach(function(name) {
			config[name] = util.expand(config[name]).map(function(file) {
				return util.fileToModuleName(file, rjsconfig);
			});
		});

		config.include = _.difference(config.include, config.exclude);

		//console.log(JSON.stringify(config.include, false, 4));

		//'exclude' is a requirejs property meaning 'exclude a module and its
		//dependencies'. We used the name for our own purpose, now reassign it
		//to align with requirejs' meaning.
		config.exclude = _.uniq(config.excludeBuilt);


		//use almond to remove requirejs dependency
		if (config.standalone) {
			config.name = util.fileToModuleName(libdir + '/almond.js', rjsconfig);
			config.wrap = {};
			if (config.env === 'node') {
				config.wrap.start = 'module.exports = (function() {\n\t"use strict";';
			}
			else {
				config.wrap.start = 'window["' + config.exports + '"] = (function() {\n\t"use strict";';
			}
			config.wrap.end = '';
		}
		else {
			config.wrap = {};
			config.wrap.start = '(function() {\n\t"use strict";';
			config.wrap.end = '\n})();';
		}


		//------------------------------------------------------------
		// Merge our config values into a config object compatible with
		// requirejs
		//------------------------------------------------------------
		config = _.extend(_.clone(rjsconfig), config);

		requirejs.optimize(config, function(buildResponse) {
			if (!config.standalone) {
				done();
				return;
			}

			//when built without requirejs support, provide global references to
			//every object in the whole dependency graph
			//var basePath = _.initial(__dirname.split('/')).join('/');
			var deps = buildResponse.split('\n');
			deps = _.chain(deps)
				.compact()
				.rest(2)
				.map(function(file) {
					return util.fileToModuleName(file, rjsconfig);
				})
				.value();


			var appendString = '\n\n/*\n';
			appendString += '-----------------------------------------\n';
			appendString += 'Global definitions for a built project\n';
			appendString += '-----------------------------------------\n';
			appendString += '*/\n\n';
			appendString += 'return {\n';
			deps.forEach(function(file, i) {
				appendString += '\t"' + file + '": require("' + file + '")';
				//appendString += 'lang.setObject("' + path.replace(/\//g, '.') + '", require("' + path + '"), window);\n';
				if (i < deps.length - 1) {
					appendString += ',\n';
				}
				else {
					appendString += '\n';
				}
			});
			appendString += '};\n';
			appendString += '\n\n})();';

			var contents = grunt.file.read(config.out);
			contents += appendString;
			grunt.file.write(config.out, contents, 'utf-8');

			done();
		});

	});

};
