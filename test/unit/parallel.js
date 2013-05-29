define(function(require){

	'use strict';


	var parallel = require('deferreds/parallel');
	var Deferred = require('deferreds/Deferred');
	require('setimmediate');


	module('parallel');


	var _timedDeferred = function(t, val, entered, exited) {
		entered.push(val);

		var deferred = new Deferred();
		setTimeout(function() {
			exited.push(val);
			deferred.resolve(val);
		}, t*16);
		return deferred.promise();
	};


	test('parallel', function() {
		stop();
		expect(3);

		var entered = [];
		var exited = [];

		parallel([
			function() {
				return _timedDeferred(2, 'A', entered, exited);
			},
			function(){
				return _timedDeferred(3, 'B', entered, exited);
			},
			function(){
				return _timedDeferred(1, 'C', entered, exited);
			}
		]).then(function(results) {
			deepEqual(results, ['A', 'B', 'C']);
			deepEqual(entered, ['A', 'B', 'C']);
			deepEqual(exited, ['C', 'A', 'B']);
			start();
		});
	});

});
