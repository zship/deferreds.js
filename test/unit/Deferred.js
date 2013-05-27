define(function(require){

	'use strict';


	var Deferred = require('deferreds/Deferred');
	var Promise = require('deferreds/Promise');
	var isPromise = require('deferreds/isPromise');


	module('Deferred');


	test('Deferred.fromAny', function() {
		stop();

		var check;

		check = new Deferred();
		strictEqual(Deferred.fromAny(check), check, 'Deferred object: returns same Deferred object');

		check = new Deferred().promise();
		strictEqual(Deferred.fromAny(check), check, 'Promise object: returns same Promise object');

		check = {
			then: function() {}
		};
		ok(Deferred.fromAny(check) instanceof Promise, 'foreign promise object: returns new Promise object');

		check = {};
		ok(isPromise(Deferred.fromAny(check)), 'plain object');

		check = function() {
			return {};
		};
		ok(isPromise(Deferred.fromAny(check)), 'function returning plain object');
		Deferred.fromAny(check).then(function(val) {
			deepEqual(val, {}, 'function returning plain object: resolves to return value');
			start();
		});

		var dfr = new Deferred();
		check = function() {
			return dfr;
		};
		strictEqual(Deferred.fromAny(check), dfr, 'function returning Deferred: returns same Deferred');

		check = function() {
			return dfr.promise();
		};
		strictEqual(Deferred.fromAny(check), dfr.promise(), 'function returning Promise: returns same Promise');
	});

});
