define(function(require){

	var sortBy = require('sortBy');
	var Deferred = require('Deferred');
	var pluck = require('mout/collection/pluck');


	module('sortBy');


	var Delayed = function(val) {
		var deferred = new Deferred();
		setTimeout(function() {
			deferred.resolve(val);
		}, 10);
		return deferred.promise();
	};


	asyncTest('sortBy', function() {
		var people = [{name : 'curly', age : 50}, {name : 'moe', age : 30}];
		sortBy(people, function(person) {
			return Delayed(person.age);
		}).then(function(result) {
			equal(pluck(result, 'name').join(' '), 'moe curly', 'stooges sorted by age');
			start();
		});


		var list = [undefined, 4, 1, undefined, 3, 2];
		sortBy(list, function(item) {
			return Delayed(item);
		}).then(function(result) {
			equal(result.join(','), '1,2,3,4,,', 'sortBy with undefined values');
		});


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
			return Delayed(pair.x);
		}).then(function(result) {
			deepEqual(result, collection, 'sortBy should be stable');
		});

		setTimeout(function() {
			start();
		}, 60);
	});

});