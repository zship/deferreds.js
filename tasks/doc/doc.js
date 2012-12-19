module.exports = function(grunt) {
	'use strict';


	var _ = grunt.utils._;
	var constants = require('./constants.js');
	//var rjsconfig = require('./rjsconfig.js');
	var requirejs = require(constants.rjs);
	var Deferred = require('simply-deferred').Deferred;

	var util = require('../util.js');
	var docutil = require('./doc/util.js');
	var Stopwatch = require('./doc/Stopwatch.js');

	var Types = require('./doc/Types.js');
	var runJsdoc = require('./doc/runJsdoc.js');
	var cacheJsdoc = require('./doc/cacheJsdoc.js');
	var getJsdocCache = require('./doc/getJsdocCache.js');
	var massageJsdoc = require('./doc/massageJsdoc.js');
	var mixinMarkdown = require('./doc/mixinMarkdown.js');
	var transformLongNames = require('./doc/transformLongNames.js');
	var parseMarkdown = require('./doc/parseMarkdown.js');
	//var deriveInheritance = require('./doc/deriveInheritance.js');
	var mixinInherited = require('./doc/mixinInherited.js');
	var renderModule = require('./doc/renderModule.js');
	var renderTaglist = require('./doc/renderTaglist.js');
	var renderMenu = require('./doc/renderMenu.js');
	var printSummary = require('./doc/printSummary.js');
	var traceDependencies = require('./doc/traceDependencies.js');


	//idea: put a search box above class list that filters the class list
	grunt.registerTask('doc', 'Runs jsdoc', function() {

		var totalStopwatch = new Stopwatch().start();
		var config = grunt.config.get(this.name);
		var done = this.async();

		['include', 'exclude'].forEach(function(name) {
			config[name] = util.expand(config[name]);
		});

		config.include = _.difference(config.include, config.exclude);

		Types.populateTypeMap(config.types || []);

		var files = config.include;
		var stopwatch = new Stopwatch().start();

		grunt.log.subhead('Generating documentation for ' + files.length + ' files');
		grunt.log.writeln('===========================================================');


		var rjsconfig = grunt.config.get('requirejs');

		requirejs.config({
			baseUrl: process.cwd() + '/src',
			packages: rjsconfig.packages,
			nodeRequire: require
		});

		docutil.rjsconfig = rjsconfig;


		var doclets = []; //jsdoc output
		var cache = {}; //cache info for previous doclets
		var graph = {}; //object graph to be passed to templates

		var documentedNames;
		var undocumentedNames;
		var markdownDocumentedNames;


		requirejs(['deferreds/waterfall'], function(waterfall) {
		waterfall([

			function() {
				cache = getJsdocCache(files);

				doclets = [];
				cache.fresh.forEach(function(filePath) {
					grunt.verbose.write('\t');
					doclets = doclets.concat(JSON.parse(grunt.file.read(filePath)));
				});

				return [cache, doclets];
			},


			function() {
				grunt.log.writeln('');
				grunt.log.writeln('Running jsdoc on ' + cache.stale.length + ' files (' + cache.fresh.length + ' cached)...');

				var deferred = new Deferred();

				if (!cache.stale.length) {
					deferred.resolve();
					return deferred.promise();
				}

				grunt.verbose.writeln(cache.stale.join(' '));

				runJsdoc(cache.stale).then(function(result) {
					var out = result.out;
					//console.log(JSON.stringify(out, false, 4));
					doclets = doclets.concat(out);
					deferred.resolve({out: out});
				});

				return deferred.promise();
			},


			function(result) {
				grunt.log.ok(stopwatch.elapsed() + 'ms');
				stopwatch.reset();

				grunt.log.writeln('');
				grunt.log.writeln('Updating jsdoc caches for future runs...');

				cache.stale.forEach(function(filePath) {
					cache.index[filePath] = docutil.hashFile(filePath);
				});

				grunt.verbose.write('\t');
				grunt.file.write(constants.fileHashesPath, JSON.stringify(cache.index, false, 2), 'utf-8');

				if (result && result.out) {
					cacheJsdoc(result.out);
				}

				grunt.log.ok(stopwatch.elapsed() + 'ms');
				stopwatch.reset();
			},


			function() {
				grunt.log.writeln('');
				grunt.log.writeln('Tracing AMD dependencies...');

				var deferred = new Deferred();
				traceDependencies(files).then(function(deps) {
					deferred.resolve(deps);
				});
				return deferred.promise();
			},


			function(deps) {
				grunt.log.ok(stopwatch.elapsed() + 'ms');
				stopwatch.reset();

				grunt.log.writeln('');
				grunt.log.writeln('Massaging jsdoc output...');

				//console.log(JSON.stringify(graph, false, 4));

				var result = massageJsdoc(doclets, deps);
				graph = result.graph;
				documentedNames = result.documented;
				undocumentedNames = result.undocumented;

				grunt.log.ok(stopwatch.elapsed() + 'ms');
				stopwatch.reset();

				//console.log(JSON.stringify(graph, false, 4));


				grunt.log.writeln('');
				grunt.log.writeln('Mixing in markdown documentation...');
				markdownDocumentedNames = mixinMarkdown(graph);
				grunt.log.ok(stopwatch.elapsed() + 'ms');
				stopwatch.reset();


				//console.log(JSON.stringify(graph, false, 4));


				grunt.log.writeln('');
				grunt.log.writeln('Transforming references to defined methods in descriptions into links...');
				transformLongNames(graph);
				grunt.log.ok(stopwatch.elapsed() + 'ms');
				stopwatch.reset();


				grunt.log.writeln('');
				grunt.log.writeln('Parsing and rendering markdown in descriptions...');
				parseMarkdown(graph);
				grunt.log.ok(stopwatch.elapsed() + 'ms');
				stopwatch.reset();


				grunt.log.writeln('');
				grunt.log.writeln('Mixing inherited methods into class definitions...');
				mixinInherited(graph);
				grunt.log.ok(stopwatch.elapsed() + 'ms');
				stopwatch.reset();


				grunt.log.writeln('');
				grunt.log.writeln('Rendering module definition files into ' + constants.docdir + '/out/classes...');
				_.each(graph, function(val, key) {
					if (!key) {
						return true; //continue
					}

					var jadeStopwatch = new Stopwatch().start();

					//var path = key.replace(/\./g, '/');
					grunt.verbose.write('\t');
					grunt.verbose.writeln('Rendering class definition file ' + key + '...');
					//console.log(path);
					//console.log(val);
					renderModule(val, key, config, function(graph, path, data) {
						var filePath = constants.docdir + '/out/classes/' + path + '.html';
						grunt.verbose.write('\t\t');
						grunt.file.write(filePath, data, 'utf-8');
					});

					grunt.verbose.write('\t');
					grunt.verbose.ok(jadeStopwatch.elapsed() + 'ms');
				});
				grunt.log.ok(stopwatch.elapsed() + 'ms');
				stopwatch.reset();


				grunt.log.writeln('');
				grunt.log.writeln('Rendering taglist files into ' + constants.docdir + '/out/taglists...');
				_.each(graph, function(val, key) {
					if (!key) {
						return true; //continue
					}

					var jadeStopwatch = new Stopwatch().start();

					//var path = key.replace(/\./g, '/');
					grunt.verbose.write('\t');
					grunt.verbose.writeln('Rendering taglist file ' + key + '...');
					//console.log(path);
					//console.log(val);
					renderTaglist(val, key, function(graph, path, data) {
						var filePath = constants.docdir + '/out/taglists/' + path + '.html';
						grunt.verbose.write('\t\t');
						grunt.file.write(filePath, data, 'utf-8');
					});
					grunt.verbose.write('\t');
					grunt.verbose.ok(jadeStopwatch.elapsed() + 'ms');
				});
				grunt.log.ok(stopwatch.elapsed() + 'ms');
				stopwatch.reset();


				grunt.log.writeln('');
				grunt.log.writeln('Rendering module list into ' + constants.docdir + '/out/menu.html...');

				var classList = _.clone(Object.keys(graph));
				var classStructure = {};
				_.each(classList, function(className) {
					var path = className.replace(/\//g,'.');
					docutil.setObject(path, className, classStructure);
				});

				var menu = renderMenu(classStructure, '');
				grunt.verbose.write('\t');
				grunt.file.write(constants.docdir + '/out/menu.html', menu, 'utf-8');

				grunt.log.ok(stopwatch.elapsed() + 'ms');
				stopwatch.reset();


				printSummary(graph, documentedNames, undocumentedNames, markdownDocumentedNames);

			}

		]).then(function() {

			grunt.log.writeln('');
			grunt.log.writeln('Total Time: ' + totalStopwatch.elapsed() + 'ms');

			done(); //grunt async

		}).fail(function(err) {
			console.log('failed');
			console.error(err);
		});
		});

	});

};
