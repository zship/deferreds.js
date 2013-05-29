define(function(require){

	'use strict';


	var Deferreds = require('deferreds/Deferreds');
	var Deferred = require('deferreds/Deferred');


	module('Deferreds (general tests)');


	var parallel = 'every filter find forEach map some'.split(' ');
	var series = 'filterSeries findSeries forEachSeries mapSeries reduce reduceRight'.split(' ');


	test('errors', function() {
		stop(parallel.length + series.length);
		expect(parallel.length * 2 + series.length * 2);

		parallel.forEach(function(name) {
			var called = 0;
			Deferreds[name]([1, 2, 3], function() {
				called++;
				return new Deferred().reject('error').promise();
			}).then(
				function() {
					ok(false, name + ': should not resolve');
					start();
				},
				function(err) {
					strictEqual(called, 3, name + ': parallel method failed, but called iterator for every item beforehand');
					strictEqual(err, 'error', name + ': fail() called');
					start();
				}
			);
		});

		series.forEach(function(name) {
			var called = 0;
			Deferreds[name]([1, 2, 3], function() {
				called++;
				return new Deferred().reject('error').promise();
			}).done(function() {
				ok(false, name + ': should not resolve');
				start();
			}).fail(function(err) {
				strictEqual(called, 1, name + ': series method failed fast');
				strictEqual(err, 'error', name + ': fail() called');
				start();
			});
		});

	});


	test('empty array', function() {
		stop(parallel.length + series.length);

		var fns = parallel.concat(series);

		expect(fns.length);

		fns.forEach(function(name) {
			Deferreds[name]([], function() {
				ok(false, name + ': iterator should not be called');
			}).then(function() {
				ok(true, name + ': should call callback');
				start();
			});
		});
	});

});
