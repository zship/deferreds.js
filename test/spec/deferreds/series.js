define(function(require){

	var series = require('deferreds/series');
	var Deferred = require('deferreds/Deferred');


	module('deferreds/series');


	var _timedDeferred = function(t, val, entered, exited) {
		entered.push(val);

		var deferred = new Deferred();
		setTimeout(function() {
			exited.push(val);
			deferred.resolve(val);
		}, t);
		return deferred.promise();
	};


	asyncTest('series', function() {
		expect(3);

		var entered = [];
		var exited = [];

		series([
			function() {
				return _timedDeferred(20, 'A', entered, exited);
			},
			function(){
				return _timedDeferred(30, 'B', entered, exited);
			},
			function(){
				return _timedDeferred(10, 'C', entered, exited);
			}
		]).then(function(results) {
			deepEqual(results, ['A', 'B', 'C']);
			deepEqual(entered, ['A', 'B', 'C']);
			deepEqual(exited, ['A', 'B', 'C']);
			start();
		});
	});


	asyncTest('series w/ arguments', function() {
		expect(3);

		var entered = [];
		var exited = [];

		series(
			function() {
				return _timedDeferred(20, 'A', entered, exited);
			},
			function(){
				return _timedDeferred(30, 'B', entered, exited);
			},
			function(){
				return _timedDeferred(10, 'C', entered, exited);
			}
		).then(function(results) {
			deepEqual(results, ['A', 'B', 'C']);
			deepEqual(entered, ['A', 'B', 'C']);
			deepEqual(exited, ['A', 'B', 'C']);
			start();
		});
	});

});
