define(function(require){

	'use strict';


	var hasOwn = require('mout/object/hasOwn');

	var Promise = require('deferreds/Promise');
	var Deferred = require('deferreds/Deferred');
	var isPromise = require('deferreds/isPromise');


	module('Promise');


	test('Deferred\'s promise method returns Promise', function() {
		var deferred = new Deferred().resolve();
		var promise = deferred.promise();

		ok(promise instanceof Promise);
		strictEqual(promise.constructor, Promise, 'returns a Promise object');
	});


	test('chainable', function() {
		var deferred = new Deferred().resolve();
		var promise = deferred.promise();

		[
			'done',
			'fail',
			'always'
		].forEach(function(name) {
			var ret = promise[name](function(){});
			strictEqual(ret, promise, name + ': returns same Promise object');
		});

		var ret = promise.then(function() {});
		strictEqual(ret.constructor, Promise, 'then: returns a new Promise object');
	});


	test('adding callbacks', function() {
		stop(5);
		expect(7);

		var deferred = new Deferred().resolve();
		var promise = deferred.promise();
		var callOrder = [];

		promise
			.done(function() {
				ok(true, 'resolve: done() works');
				callOrder.push(1);
				start();
			})
			.fail(function() {
				ok(false, 'resolve: fail() should not be called');
			})
			.always(function() {
				ok(true, 'resolve: always() works');
				callOrder.push(2);
				start();
			})
			.then(function() {
				ok(true, 'resolve: then() works');
				deepEqual(callOrder, [1, 2], 'fulfilled callbacks called in correct order');
				start();
			});

		deferred = new Deferred().reject();
		promise = deferred.promise();
		var callOrder2 = [];

		promise
			.done(function() {
				ok(false, 'reject: done() should not be called');
			})
			.fail(function() {
				ok(true, 'reject: fail() called');
				callOrder2.push(1);
				deepEqual(callOrder2, [1], 'rejected callbacks called in correct order');
				start();
			})
			.always(function() {
				ok(true, 'reject: always() called');
				start();
			})
			.then(function() {
				ok(false, 'reject: then() should not be called');
			});
	});


	test('cannot alter Deferred state', function() {
		var deferred = new Deferred();
		var promise = new Promise(deferred);

		if (!hasOwn(promise, 'resolve')) {
			ok(true, 'no resolve() method');
		}

		if (!hasOwn(promise, 'reject')) {
			ok(true, 'no reject() method');
		}
	});


	test('Promise.fromAny', function() {
		stop();

		var check;

		check = new Promise();
		strictEqual(Promise.fromAny(check), check, 'Deferred object: returns same Deferred object');

		check = {
			then: function() {}
		};
		ok(Promise.fromAny(check) instanceof Promise, 'foreign promise object: returns new Promise object');

		check = {};
		ok(isPromise(Promise.fromAny(check)), 'plain object');

		check = function() {
			return {};
		};
		ok(isPromise(Promise.fromAny(check)), 'function returning plain object');
		Promise.fromAny(check).then(function(val) {
			deepEqual(val, {}, 'function returning plain object: resolves to return value');
			start();
		});

		var promise = new Promise();

		check = function() {
			return promise;
		};
		strictEqual(Promise.fromAny(check), promise, 'function returning Promise: returns same Promise');
	});

});