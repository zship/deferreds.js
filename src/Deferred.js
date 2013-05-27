/*global setImmediate */
define(function(require) {

	'use strict';


	var toArray = require('mout/lang/toArray');
	var isFunction = require('mout/lang/isFunction');
	var isPromise = require('./isPromise');
	var Promise = require('./Promise');
	require('setimmediate');


	/**
	 * @class
	 */
	var Deferred = function() {
		if (!(this instanceof Deferred)) {
			throw new Error('Deferred constructor function must be called with the "new" keyword');
		}

		this._state = Deferred.State.PENDING;
		this._callbacks = {
			fulfilled: [],
			rejected: []
		};
		this._closingArguments = [];
		this._promise = new Promise(this);
	};


	/**
	 * @return {Promise}
	 */
	Deferred.prototype.promise = function() {
		return this._promise;
	};


	/**
	 * @return {Deferred.State}
	 */
	Deferred.prototype.state = function() {
		return this._state;
	};


	Deferred.prototype._drainCallbacks = function(args) {
		setImmediate(function() {
			var callbacks;

			switch (this._state) {
				case Deferred.State.FULFILLED:
					callbacks = this._callbacks.fulfilled;
					break;
				case Deferred.State.REJECTED:
					callbacks = this._callbacks.rejected;
					break;
				default:
					return;
			}

			try {
				while (callbacks.length) {
					callbacks.shift().apply(undefined, args);
				}
			}
			catch (e) {
				this.reject(e);
			}
		}.bind(this));
	};


	/**
	 * @param {...Any} args
	 * @return this
	 */
	Deferred.prototype.resolve = function() {
		if (this._state !== Deferred.State.PENDING) {
			return this;
		}

		this._state = Deferred.State.FULFILLED;
		this._drainCallbacks(arguments);
		this._closingArguments = arguments;
		return this;
	};


	/**
	 * @param {...Any} args
	 * @return this
	 */
	Deferred.prototype.reject = function() {
		if (this._state !== Deferred.State.PENDING) {
			return this;
		}

		this._state = Deferred.State.REJECTED;
		this._drainCallbacks(arguments);
		this._closingArguments = arguments;
		return this;
	};


	/**
	 * @param {Function} doneCallback
	 * @param {Function} [failCallback]
	 * @param {Function} [progressCallback]
	 * @return this
	 */
	Deferred.prototype.then = function(onFulfilled, onRejected) {
		var piped = new Deferred();

		this._callbacks.fulfilled.push(function() {
			if (this._state === Deferred.State.FULFILLED && !isFunction(onFulfilled)) {
				//edge case of Promises/A+ 3.2.6.4 (that's why it looks like one)
				piped.resolve.apply(piped, this._closingArguments);
			}
			else {
				var args = toArray(arguments);
				args.unshift(onFulfilled);
				Deferred.fromAny.apply(undefined, args).then(
					piped.resolve.bind(piped),
					piped.reject.bind(piped)
				);
			}
		}.bind(this));

		this._callbacks.rejected.push(function() {
			if (this._state === Deferred.State.REJECTED && !isFunction(onRejected)) {
				//edge case of Promises/A+ 3.2.6.5 (that's why it looks like one)
				piped.reject.apply(piped, this._closingArguments);
			}
			else {
				var args = toArray(arguments);
				args.unshift(onRejected);
				Deferred.fromAny.apply(undefined, args).then(
					piped.resolve.bind(piped),
					piped.reject.bind(piped)
				);
			}
		}.bind(this));

		if (this._state !== Deferred.State.PENDING) {
			this._drainCallbacks(this._closingArguments);
		}

		return piped.promise();
	};


	/**
	 * @param {Function} onFulfilled
	 * @param {Function} onRejected
	 * @return this
	 */
	Deferred.prototype._addCallbacks = function(onFulfilled, onRejected) {
		if (onFulfilled) {
			this._callbacks.fulfilled.push(onFulfilled);
		}

		if (onRejected) {
			this._callbacks.rejected.push(onRejected);
		}

		if (this._state !== Deferred.State.PENDING) {
			this._drainCallbacks(this._closingArguments);
		}

		return this;
	};


	/**
	 * @param {Function} callback
	 * @return this
	 */
	Deferred.prototype.done = function(onFulfilled) {
		return this._addCallbacks(onFulfilled);
	};


	/**
	 * @param {Function} callback
	 * @return this
	 */
	Deferred.prototype.fail = function(onRejected) {
		return this._addCallbacks(undefined, onRejected);
	};


	/**
	 * @param {Function} callback
	 * @return this
	 */
	Deferred.prototype.always = function(callback) {
		return this._addCallbacks(callback, callback);
	};


	/**
	 * @enum {String}
	 * @const
	 */
	Deferred.State = {
		PENDING: 'pending',
		FULFILLED: 'fulfilled',
		REJECTED: 'rejected'
	};


	/**
	 * Monad `return` equivalent
	 * @param {Any} obj
	 * @return {Deferred}
	 */
	Deferred.fromAny = function(obj) {
		//any arguments after obj will be passed to obj(), if obj is a function
		var args = Array.prototype.slice.call(arguments, 1);
		if (isPromise(obj)) {
			return obj;
		}
		else if (isFunction(obj)) {
			var result;
			try {
				result = obj.apply(obj, args);
			}
			catch (e) {
				return new Deferred().reject(e).promise();
			}
			if (isPromise(result)) {
				return result;
			}
			return new Deferred().resolve(result).promise();
		}
		else {
			return new Deferred().resolve(obj).promise();
		}
	};


	return Deferred;

});
