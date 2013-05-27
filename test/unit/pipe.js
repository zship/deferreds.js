define(function(require){

	'use strict';


	var pipe = require('deferreds/pipe');
	var Deferred = require('deferreds/Deferred');


	module('pipe');


	test('Basics', function() {
		stop();
		expect(6);

		var callOrder = [];
		pipe([
			function() {
				var deferred = new Deferred();
				setTimeout(function() {
					callOrder.push('fn1');
					deferred.resolve('one', 'two');
				}, 0);
				return deferred.promise();
			},

			function(arg1, arg2) {
				var deferred = new Deferred();
				strictEqual(arg1, 'one');
				strictEqual(arg2, 'two');
				setTimeout(function() {
					callOrder.push('fn2');
					deferred.resolve(arg1, arg2, 'three');
				}, 25);
				return deferred.promise();
			},

			function(arg1, arg2, arg3) {
				callOrder.push('fn3');
				strictEqual(arg1, 'one');
				strictEqual(arg2, 'two');
				strictEqual(arg3, 'three');
				return 'four';
			},

			function() {
				callOrder.push('fn4');
				deepEqual(callOrder, ['fn1','fn2','fn3','fn4']);
			}
		]).then(function(){
			start();
		});

	});


	test('async', function() {
		stop();

		var callOrder = [];
		pipe([
			function() {
				var deferred = new Deferred();
				callOrder.push(1);
				deferred.resolve();
				callOrder.push(2);
				return deferred.promise();
			},
			function(){
				var deferred = new Deferred();
				callOrder.push(3);
				deferred.resolve();
				return deferred.promise();
			},
			function(){
				deepEqual(callOrder, [1,2,3]);
				start();
			}
		]);
	});


	test('error', function() {
		stop();
		expect(1);

		pipe([
			function() {
				return new Deferred().reject('error');
			},
			function(callback) {
				test.ok(false, 'next function should not be called');
				callback();
			}
		]).fail(function(err) {
			strictEqual(err, 'error');
			start();
		});
	});

});
