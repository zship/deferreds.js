/*global setImmediate */
define(function(require) {

	'use strict';


	var toArray = require('mout/lang/toArray');
	var isFunction = require('mout/lang/isFunction');
	var partial = require('mout/function/partial');
	require('setimmediate');

	var isPromise = require('./isPromise');


	/**
	 * @class
	 */
	var Promise = function() {
		if (!(this instanceof Promise)) {
			throw new Error('Promise constructor function must be called with the "new" keyword');
		}

		this._state = Promise.State.PENDING;
		this._callbacks = {
			fulfilled: [],
			rejected: []
		};
		this._closingArguments = [];
	};


	/**
	 * @enum {String}
	 * @const
	 */
	Promise.State = {
		PENDING: 'pending',
		FULFILLED: 'fulfilled',
		REJECTED: 'rejected'
	};


	/**
	 * @return {Promise.State}
	 */
	Promise.prototype.state = function() {
		return this._state;
	};


	Promise.prototype._drainCallbacks = function() {
		if (this._isDrainPending) {
			return;
		}
		this._isDrainPending = true;

		setImmediate(function() {
			this._isDrainPending = false;

			var callbacks;

			switch (this._state) {
				case Promise.State.FULFILLED:
					callbacks = this._callbacks.fulfilled;
					this._callbacks.rejected = [];
					break;
				case Promise.State.REJECTED:
					callbacks = this._callbacks.rejected;
					this._callbacks.fulfilled = [];
					break;
				default:
					return;
			}

			try {
				while (callbacks.length) {
					callbacks.shift().apply(undefined, this._closingArguments);
				}
			}
			catch (e) {
				this._reject(e);
			}
		}.bind(this));
	};


	Promise.prototype._setState = function(state) {
		this._resolve = this._reject = function() {
			return this;
		};
		this._state = state;
		this._closingArguments = Array.prototype.slice.call(arguments, 1);
		this._drainCallbacks();
		return this;
	};


	/**
	 * @param {...Any} args
	 * @private
	 * @function
	 * @return this
	 */
	Promise.prototype._resolve = partial(Promise.prototype._setState, Promise.State.FULFILLED);


	/**
	 * @param {...Any} args
	 * @private
	 * @function
	 * @return this
	 */
	Promise.prototype._reject = partial(Promise.prototype._setState, Promise.State.REJECTED);


	/**
	 * @param {Function} doneCallback
	 * @param {Function} [failCallback]
	 * @return {Promise}
	 */
	Promise.prototype.then = function(onFulfilled, onRejected) {
		var piped = new Promise();

		this.done(function callFulfilled() {
			if (this._state === Promise.State.FULFILLED && !isFunction(onFulfilled)) {
				//edge case of Promises/A+ 3.2.6.4 (that's why it looks like one)
				piped._resolve.apply(piped, this._closingArguments);
			}
			else {
				var args = [onFulfilled].concat(toArray(arguments));
				Promise.fromAny.apply(undefined, args)
					.done(piped._resolve.bind(piped))
					.fail(piped._reject.bind(piped));
			}
		}.bind(this));

		this.fail(function callRejected() {
			if (this._state === Promise.State.REJECTED && !isFunction(onRejected)) {
				//edge case of Promises/A+ 3.2.6.5 (that's why it looks like one)
				piped._reject.apply(piped, this._closingArguments);
			}
			else {
				var args = [onRejected].concat(toArray(arguments));
				Promise.fromAny.apply(undefined, args)
					.done(piped._resolve.bind(piped))
					.fail(piped._reject.bind(piped));
			}
		}.bind(this));

		return piped;
	};


	Promise.prototype._addCallbacks = function(onFulfilled, onRejected) {
		if (onFulfilled) {
			this._callbacks.fulfilled.push(onFulfilled);
		}

		if (onRejected) {
			this._callbacks.rejected.push(onRejected);
		}

		if (this._state !== Promise.State.PENDING) {
			this._drainCallbacks();
		}

		return this;
	};


	/**
	 * @param {Function} callback
	 * @return this
	 */
	Promise.prototype.done = function(onFulfilled) {
		return this._addCallbacks(onFulfilled);
	};


	/**
	 * @param {Function} callback
	 * @return this
	 */
	Promise.prototype.fail = function(onRejected) {
		return this._addCallbacks(undefined, onRejected);
	};


	/**
	 * @param {Function} callback
	 * @return this
	 */
	Promise.prototype.always = function(callback) {
		return this._addCallbacks(callback, callback);
	};


	/**
	 * Monad `return` equivalent
	 * @param {Any} obj
	 * @return {Promise}
	 */
	Promise.fromAny = function(obj) {
		if (isPromise(obj)) {
			if (obj instanceof Promise) {
				return obj;
			}
			else {
				var promise = new Promise();
				obj.then(
					promise._resolve.bind(promise),
					promise._reject.bind(promise)
				);
				return promise;
			}
		}
		else if (isFunction(obj)) {
			//any arguments after obj will be passed to obj()
			var args = Array.prototype.slice.call(arguments, 1);
			var result;
			try {
				result = obj.apply(obj, args);
			}
			catch (e) {
				return new Promise()._reject(e);
			}
			return Promise.fromAny(result);
		}
		else {
			return new Promise()._resolve(obj);
		}
	};


	return Promise;

});
