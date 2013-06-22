define(function(require) {

	'use strict';


	var toArray = require('mout/lang/toArray');
	var partial = require('mout/function/partial');

	var Deferred = require('./Deferred');
	var Promise = require('./Promise');

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


	/**
	 * @class
	 * @extends {Deferred}
	 * @param {Any} [wrapped]
	 */
	var Chainable = function(value) {
		if (!(this instanceof Chainable)) {
			throw new Error('Chainable constructor function must be called with the "new" keyword');
		}

		this._state = Deferred.State.PENDING;
		this._callbacks = {
			fulfilled: [],
			rejected: []
		};
		this._closingArguments = [];
		this._promise = new Promise(this);

		//special: pass "undefined" for internal use in then(). this prevents
		//resolve() from being called until the result of then() has been
		//fulfilled.
		if (arguments.length === 1 && value === undefined) {
			return this;
		}

		Deferred.fromAny(value).then(
			this.resolve.bind(this)
		);
	};


	Chainable.prototype = Object.create(Deferred.prototype);
	Chainable.prototype.constructor = Chainable;


	[
		'every',
		'filter',
		'filterSeries',
		'find',
		'findSeries',
		'forEach',
		'forEachSeries',
		'map',
		'mapSeries',
		'pipe',
		'reduce',
		'reduceRight',
		'some',
		'sortBy'
	].forEach(function(key) {
		Chainable.prototype[key] = function() {
			var args = toArray(arguments);

			return this.then(function(prev) {
				if (prev !== undefined) {
					args.unshift(prev);
				}
				return Functions[key].apply(undefined, args);
			});
		};
	});


	['parallel', 'series'].forEach(function(key) {
		Chainable.prototype[key] = function(tasks) {
			return this.then(function(prev) {
				tasks = tasks.map(function(task) {
					return partial(task, prev);
				});
				return Functions[key].call(undefined, tasks);
			});
		};
	});


	/**
	 * @override
	 * @return {Chainable}
	 */
	Chainable.prototype.then = function() {
		var chain = new Chainable(undefined);
		Deferred.prototype.then.apply(this, arguments).then(
			chain.resolve.bind(chain),
			chain.reject.bind(chain)
		);
		return chain;
	};


	return Chainable;


	/**
	 * @name Chainable#every
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#filter
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#filterSeries
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#find
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#findSeries
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#forEach
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#forEachSeries
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#map
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#mapSeries
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#parallel
	 * @method
	 * @param {Any} tasks
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#reduce
	 * @method
	 * @param {Function} iterator
	 * @param {Any} memo
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#reduceRight
	 * @method
	 * @param {Function} iterator
	 * @param {Any} memo
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#series
	 * @method
	 * @param {Any} tasks
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#some
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#sortBy
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

});
