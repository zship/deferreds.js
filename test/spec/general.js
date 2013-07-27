define(function(require) {

	'use strict';


	var assert = require('assert');
	require('setimmediate');

	var adapter = global.adapter;
	var Functions = {
		'every': require('deferreds/every'),
		'filter': require('deferreds/filter'),
		'filterSeries': require('deferreds/filterSeries'),
		'find': require('deferreds/find'),
		'findSeries': require('deferreds/findSeries'),
		'forEach': require('deferreds/forEach'),
		'forEachSeries': require('deferreds/forEachSeries'),
		'isDeferred': require('deferreds/isDeferred'),
		'isPromise': require('deferreds/isPromise'),
		'map': require('deferreds/map'),
		'mapSeries': require('deferreds/mapSeries'),
		'parallel': require('deferreds/parallel'),
		'pipe': require('deferreds/pipe'),
		'reduce': require('deferreds/reduce'),
		'series': require('deferreds/series'),
		'some': require('deferreds/some'),
		'sortBy': require('deferreds/sortBy'),
		'whilst': require('deferreds/whilst')
	};


	var parallel = 'every filter find forEach map some sortBy'.split(' ');
	var series = 'filterSeries findSeries forEachSeries mapSeries reduce'.split(' ');


	describe('parallel functions', function() {
		parallel.forEach(function(key) {
			describe('deferreds/' + key, function() {

				it('should process elements in parallel', function(done) {
					var args = [];
					Functions[key]([2, 1], function(num) {
						var deferred = adapter.pending();
						setTimeout(function(){
							args.push(num);
							//fulfill with whatever value is necessary to process all elements
							if ('filter find forEach map sortBy'.split(' ').indexOf(key) !== -1) {
								deferred.fulfill();
							}
							else if (key === 'every') {
								deferred.fulfill(true);
							}
							else if (key === 'some') {
								deferred.fulfill(false);
							}
						}, num * 16);
						return deferred.promise;
					}).then(function() {
						assert.deepEqual(args, [1, 2]);
					}).then(done, done);
				});

				it('should call iterator for every item before being rejected', function(done) {
					var called = 0;
					Functions[key]([1, 2, 3], function() {
						called++;
						return adapter.rejected('error');
					}).then(function() {
						assert(false, 'should not be fulfilled');
					},
					function(err) {
						assert.strictEqual(called, 3);
						assert.strictEqual(err, 'error', key + ': onRejected called');
					}).then(done, done);
				});

			});
		});


	});


	describe('series functions', function() {
		series.forEach(function(key) {
			describe('deferreds/' + key, function() {

				it('should process elements in series', function(done) {
					var completed = 0;
					Functions[key]([1, 2, 3], function(num, i) {
						if (key === 'reduce') { //first arg is memo
							num = i;
							i = arguments[2];
						}
						var deferred = adapter.pending();
						setImmediate(function() {
							assert.strictEqual(completed, i + 1, num + ' waited for previous to complete');
							deferred.fulfill(num);
						});
						completed++;
						return deferred.promise;
					})
					.then(function() {})
					.then(done, done);
				});

				it('should immediately reject its promise if iterator is ever rejected', function(done) {
					var called = 0;
					Functions[key]([1, 2, 3], function() {
						called++;
						return adapter.rejected('error');
					}).then(function() {
						assert(false, 'should not be fulfilled');
					}, function(err) {
						assert.strictEqual(called, 1);
						assert.strictEqual(err, 'error', 'onRejected() called');
					}).then(done, done);
				});

			});
		});
	});


	describe('both parallel and series functions', function() {
		parallel.concat(series).forEach(function(key) {
			describe('deferreds/' + key, function() {

				it('should fulfill its promise when passed `[]`', function(done) {
					Functions[key]([], function() {
						assert(false, 'iterator should not be called');
					})
					.then(function() {})
					.then(done, done);
				});

			});
		});
	});

});
