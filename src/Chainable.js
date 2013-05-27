define(function(require) {

	'use strict';


	var Deferred = require('./Deferred');
	var Promise = require('./Promise');
	var Deferreds = require('./Deferreds');
	var forEach = require('mout/array/forEach');
	var toArray = require('mout/lang/toArray');
	var bind = require('mout/function/bind');
	var keys = require('mout/object/keys');


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

		//special: pass "undefined" for internal use in pipe().
		//this prevents resolve() from being called until pipe() has resolved.
		if (arguments.length === 1 && value === undefined) {
			return this;
		}

		Deferred.fromAny(value).then(bind(function() {
			if (arguments.length) {
				this.resolve.apply(this, arguments);
			}
			else {
				this.resolve();
			}
		}, this));
	};


	Chainable.prototype = Object.create(Deferred.prototype);
	Chainable.prototype.constructor = Chainable;


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


	var chained = keys(Deferreds).filter(function(key) {
		return key !== 'then';
	});


	forEach(chained, function(key) {
		Chainable.prototype[key] = function() {
			var args = toArray(arguments);

			return this.then(function(prev) {
				if (prev !== undefined) {
					args.unshift(prev);
				}
				return Deferreds[key].apply(undefined, args);
			});
		};
	});


	/**
	 * @name Deferreds.chain
	 * @method
	 * @param {Any} [wrapped]
	 * @return {Chainable}
	 */
	Deferreds.chain = Chainable;


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
	 * @name Chainable#reject
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#rejectSeries
	 * @method
	 * @param {Function} iterator
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

	/**
	 * @name Chainable#pipe
	 * @method
	 * @param {Any} tasks
	 * @return {Chainable}
	 */


});