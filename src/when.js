/*jshint latedef:false*/
define([], function() {

	/*
	 * full CommonJS Promises/A implementation, with some extras present in
	 * jQuery.Deferred (done() and fail())
	 * this is modified from the cujo/when library:
	 * https://github.com/cujojs/when
	 */
	var freeze, envFreeze, falseRx, undef;

	falseRx = /^false$/i;
	envFreeze = 'WHEN_PARANOID';

	// If secure and Object.freeze is available, use it.
	freeze = identity;

	//
	// Public API
	//

	when.defer     = defer;     // Create a deferred
	when.resolve   = resolve;   // Create a resolved promise
	when.reject    = reject;    // Create a rejected promise
	when.isPromise = isPromise; // Determine if a thing is a promise

	/**
	 * Register an observer for a promise or immediate value.
	 * @function
	 * @name when
	 * @namespace
	 *
	 * @param promiseOrValue {*}
	 * @param {Function} [callback] callback to be called when promiseOrValue is
	 *   successfully resolved.  If promiseOrValue is an immediate value, callback
	 *   will be invoked immediately.
	 * @param {Function} [errback] callback to be called when promiseOrValue is
	 *   rejected.
	 * @param {Function} [progressHandler] callback to be called when progress updates
	 *   are issued for promiseOrValue.
	 * @returns {Promise} a new {@link Promise} that will complete with the return
	 *   value of callback or errback or the completion value of promiseOrValue if
	 *   callback and/or errback is not supplied.
	 */
	function when(promiseOrValue, callback, errback, progressHandler) {
		// Get a trusted promise for the input promiseOrValue, and then
		// register promise handlers
		return resolve(promiseOrValue).then(callback, errback, progressHandler);
	}

	/**
	 * Returns promiseOrValue if promiseOrValue is a {@link Promise}, a new Promise if
	 * promiseOrValue is a foreign promise, or a new, already-resolved {@link Promise}
	 * whose resolution value is promiseOrValue if promiseOrValue is an immediate value.
	 * @memberOf when
	 *
	 * @param promiseOrValue {*}
	 * @returns Guaranteed to return a trusted Promise.  If promiseOrValue is a when.js {@link Promise}
	 *   returns promiseOrValue, otherwise, returns a new, already-resolved, when.js {@link Promise}
	 *   whose resolution value is:
	 *   * the resolution value of promiseOrValue if it's a foreign promise, or
	 *   * promiseOrValue if it's a value
	 */
	function resolve(promiseOrValue) {
		var promise, deferred;

		if(promiseOrValue instanceof Promise) {
			// It's a when.js promise, so we trust it
			promise = promiseOrValue;

		} else {
			// It's not a when.js promise.
			// Check to see if it's a foreign promise or a value.

			// Some promises, particularly Q promises, provide a valueOf method that
			// attempts to synchronously return the fulfilled value of the promise, or
			// returns the unresolved promise itself.  Attempting to break a fulfillment
			// value out of a promise appears to be necessary to break cycles between
			// Q and When attempting to coerce each-other's promises in an infinite loop.
			// For promises that do not implement "valueOf", the Object#valueOf is harmless.
			// See: https://github.com/kriskowal/q/issues/106
			if (promiseOrValue !== undefined && typeof promiseOrValue.valueOf === 'function') {
				promiseOrValue = promiseOrValue.valueOf();
			}

			if(isPromise(promiseOrValue)) {
				// It looks like a thenable, but we don't know where it came from,
				// so we don't trust its implementation entirely.  Introduce a trusted
				// middleman when.js promise
				deferred = defer();

				// IMPORTANT: This is the only place when.js should ever call .then() on
				// an untrusted promise.
				promiseOrValue.then(deferred.resolve, deferred.reject, deferred.progress);
				promise = deferred.promise;

			} else {
				// It's a value, not a promise.  Create a resolved promise for it.
				promise = resolved(promiseOrValue);
			}
		}

		return promise;
	}

	/**
	 * Returns a rejected promise for the supplied promiseOrValue. If
	 * promiseOrValue is a value, it will be the rejection value of the
	 * returned promise.  If promiseOrValue is a promise, its
	 * completion value will be the rejected value of the returned promise
	 * @memberOf when
	 *
	 * @param promiseOrValue {*} the rejected value of the returned {@link Promise}
	 * @return {Promise} rejected {@link Promise}
	 */
	function reject(promiseOrValue) {
		return when(promiseOrValue, function(value) {
			return rejected(value);
		});
	}

	/**
	 * Trusted Promise constructor.  A Promise created from this constructor is
	 * a trusted when.js promise.  Any other duck-typed promise is considered
	 * untrusted.
	 * @constructor
	 * @name Promise
	 */
	function Promise(then) {
		this.then = then;
	}

	Promise.prototype = freeze({
		/**
		 * Register a callback that will be called when a promise is
		 * resolved or rejected.  Optionally also register a progress handler.
		 * Shortcut for .then(alwaysback, alwaysback, progback)
		 * @memberOf Promise
		 * @param alwaysback {Function}
		 * @param progback {Function}
		 * @return {Promise}
		 */
		always: function(alwaysback, progback) {
			return this.then(alwaysback, alwaysback, progback);
		},

		/**
		 * Register a rejection handler.  Shortcut for .then(null, errback)
		 * @memberOf Promise
		 * @param errback {Function}
		 * @return {Promise}
		 */
		otherwise: function(errback) {
			return this.then(undef, errback);
		},

		done: function(callback) {
			return this.then(callback);
		},

		fail: function(errback) {
			return this.then(undef, errback);
		}
	});

	/**
	 * Create an already-resolved promise for the supplied value
	 * @private
	 *
	 * @param value anything
	 * @return {Promise}
	 */
	function resolved(value) {
		var p = new Promise(function(callback) {
			try {
				return resolve(callback ? callback(value) : value);
			} catch(e) {
				return rejected(e);
			}
		});

		return freeze(p);
	}

	/**
	 * Create an already-rejected {@link Promise} with the supplied
	 * rejection reason.
	 * @private
	 *
	 * @param reason rejection reason
	 * @return {Promise}
	 */
	function rejected(reason) {
		var p = new Promise(function(callback, errback) {
			try {
				return errback ? resolve(errback(reason)) : rejected(reason);
			} catch(e) {
				return rejected(e);
			}
		});

		return freeze(p);
	}

	/**
	 * Creates a new, Deferred with fully isolated resolver and promise parts,
	 * either or both of which may be given out safely to consumers.
	 * The Deferred itself has the full API: resolve, reject, progress, and
	 * then. The resolver has resolve, reject, and progress.  The promise
	 * only has then.
	 * @memberOf when
	 * @function
	 *
	 * @return {Deferred}
	 */
	function defer() {
		var deferred, promise, listeners, progressHandlers,
			_then, _progress, _resolve;

		/**
		 * The promise for the new deferred
		 * @type {Promise}
		 */
		promise = new Promise(then);

		/**
		 * The full Deferred object, with {@link Promise} and {@link Resolver} parts
		 * @class Deferred
		 * @name Deferred
		 */
		deferred = {
			then:     then,
			resolve:  promiseResolve,
			reject:   promiseReject,
			progress: promiseProgress,

			promise:  freeze(promise),

			resolver: freeze({
				resolve:  promiseResolve,
				reject:   promiseReject,
				progress: promiseProgress
			})
		};

		listeners = [];
		progressHandlers = [];

		/**
		 * Pre-resolution then() that adds the supplied callback, errback, and progback
		 * functions to the registered listeners
		 * @private
		 *
		 * @param [callback] {Function} resolution handler
		 * @param [errback] {Function} rejection handler
		 * @param [progback] {Function} progress handler
		 * @throws {Error} if any argument is not null, undefined, or a Function
		 */
		_then = function(callback, errback, progback) {
			var deferred = defer();

			listeners.push(function(promise) {
				promise.then(callback, errback)
					.then(deferred.resolve, deferred.reject, deferred.progress);
			});

			progback && progressHandlers.push(progback);

			return deferred.promise;
		};

		/**
		 * Issue a progress event, notifying all progress listeners
		 * @private
		 * @param update {*} progress event payload to pass to all listeners
		 */
		_progress = function(update) {
			var progress, i = 0;

			while (progress = progressHandlers[i++]) {
				progress(update);
			}
		};

		/**
		 * Transition from pre-resolution state to post-resolution state, notifying
		 * all listeners of the resolution or rejection
		 * @private
		 * @param completed {Promise} the completed value of this deferred
		 */
		_resolve = function(completed) {
			var listener, i = 0;

			completed = resolve(completed);

			// Replace _then with one that directly notifies with the result.
			_then = completed.then;

			// Replace _resolve so that this Deferred can only be completed
			// once. Also make _progress a noop, since progress can no longer
			// be issued for the resolved promise.
			_resolve = resolve;
			_progress = noop;

			// Notify listeners
			while (listener = listeners[i++]) {
				listener(completed);
			}

			// Free progressHandlers array since we'll never issue progress events
			progressHandlers = listeners = undef;

			return completed;
		};


		/**
		 * Wrapper to allow _then to be replaced safely
		 * @param [callback] {Function} resolution handler
		 * @param [errback] {Function} rejection handler
		 * @param [progback] {Function} progress handler
		 * @return {Promise} new Promise
		 * @throws {Error} if any argument is not null, undefined, or a Function
		 */
		function then(callback, errback, progback) {
			return _then(callback, errback, progback);
		}

		/**
		 * Wrapper to allow _resolve to be replaced
		 */
		function promiseResolve(val) {
			return _resolve(val);
		}

		/**
		 * Wrapper to allow _resolve to be replaced
		 */
		function promiseReject(err) {
			return _resolve(rejected(err));
		}

		/**
		 * Wrapper to allow _progress to be replaced
		 * @param  {*} update progress update
		 */
		function promiseProgress(update) {
			_progress(update);
		}

		return deferred;
	}

	/**
	 * Determines if promiseOrValue is a promise or not.  Uses the feature
	 * test from http://wiki.commonjs.org/wiki/Promises/A to determine if
	 * promiseOrValue is a promise.
	 *
	 * @param promiseOrValue anything
	 * @returns {Boolean} true if promiseOrValue is a {@link Promise}
	 */
	function isPromise(promiseOrValue) {
		return promiseOrValue && typeof promiseOrValue.then === 'function';
	}


	/**
	 * No-Op function used in method replacement
	 * @private
	 */
	function noop() {}

	function identity(x) {
		return x;
	}

	return when;
});
