'use strict';

var path = require('path');
var grunt = require('grunt');
var _ = grunt.utils._;


var util = {

	/**
	 * Transform globbed config values into lists of files
	 * @param {Array|String} arr
	 */
	expand: function(arr) {
		arr = arr || [];
		var files = [];

		if (_.isString(arr)) {
			arr = [arr];
		}

		arr.forEach(function(val) {
			files = files.concat(grunt.file.expandFiles(val));
		});

		return _.uniq(files);
	},


	fileToModuleName: function(baseUrl, filePath) {
		var baseDirectory = path.resolve(process.cwd() + '/' + baseUrl);
		var absolutePath = path.resolve(process.cwd() + '/' + filePath);
		return absolutePath.replace(baseDirectory + '/', '').replace('.js', '');
	}

};


module.exports = util;
