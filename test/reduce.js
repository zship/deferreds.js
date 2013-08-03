define(function(require){

	'use strict';


	var assert = require('assert');
	require('setimmediate');

	var delayed = require('./helpers/delayed');

	var reduce = require('deferreds/reduce');


	describe('deferreds/reduce', function() {

		it('should reduce a list of values down to a single value', function(done) {
			reduce([1, 2, 3], function(memo, num) {
				return delayed().then(function() {
					return num + memo;
				});
			}, 0).then(function(result) {
				assert.strictEqual(result, 6);
			}).then(done, done);
		});

	});

});
