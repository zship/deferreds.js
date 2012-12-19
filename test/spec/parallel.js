define(function(require){

	var parallel = require('parallel');
	var Deferred = require('Deferred');


	module('parallel');


	var _timedDeferred = function(t, val, entered, exited) {
		entered.push(val);

		var deferred = new Deferred();
		setTimeout(function() {
			exited.push(val);
			deferred.resolve(val);
		}, t);
		return deferred.promise();
	};


	asyncTest('parallel', function() {
		expect(3);

		var entered = [];
		var exited = [];

		parallel([
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
			deepEqual(exited, ['C', 'A', 'B']);
			start();
		});
	});


	asyncTest('parallel w/ arguments', function() {
		expect(3);

		var entered = [];
		var exited = [];

		parallel(
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
			deepEqual(exited, ['C', 'A', 'B']);
			start();
		});
	});

});
