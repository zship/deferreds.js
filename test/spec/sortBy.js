define(function(require){

	'use strict';


	var assert = require('assert');
	var pluck = require('mout/collection/pluck');

	var delayed = require('./helpers/delayed');

	var sortBy = require('deferreds/sortBy');


	describe('deferreds/sortBy', function() {

		it('should be fulfilled with a list sorted by the iterator\'s results', function(done) {
			var people = [{name : 'curly', age : 50}, {name : 'moe', age : 30}];
			sortBy(people, function(person) {
				return delayed().then(function() {
					return person.age;
				});
			}).then(function(result) {
				assert.equal(pluck(result, 'name').join(' '), 'moe curly');
			}).then(done, done);
		});

		it('should sort `undefined` higher than other values', function(done) {
			var list = [undefined, 4, 1, undefined, 3, 2];
			sortBy(list, function(item) {
				return delayed().then(function() {
					return item;
				});
			}).then(function(result) {
				assert.equal(result.join(','), '1,2,3,4,,');
			}).then(done, done);
		});

		it('should be stable', function(done) {
			function Pair(x, y) {
				this.x = x;
				this.y = y;
			}

			var collection = [
				new Pair(1, 1), new Pair(1, 2),
				new Pair(1, 3), new Pair(1, 4),
				new Pair(1, 5), new Pair(1, 6),
				new Pair(2, 1), new Pair(2, 2),
				new Pair(2, 3), new Pair(2, 4),
				new Pair(2, 5), new Pair(2, 6),
				new Pair(undefined, 1), new Pair(undefined, 2),
				new Pair(undefined, 3), new Pair(undefined, 4),
				new Pair(undefined, 5), new Pair(undefined, 6)
			];

			sortBy(collection, function(pair) {
				return delayed().then(function() {
					return pair.x;
				});
			}).then(function(result) {
				assert.deepEqual(result, collection);
			}).then(done, done);
		});

	});

});
