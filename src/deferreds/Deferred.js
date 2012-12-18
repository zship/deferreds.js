define(function(require) {

	var forceNew = require('./forceNew');
	var isArray = require('amd-utils/lang/isArray');
	var Promise = require('./Promise');


	//apply each callback in `callbacks` with `args`
	var _execute = function(callbacks, args) {
		if (!callbacks) {
			return;
		}

		if (!isArray(callbacks)) {
			callbacks = [callbacks];
		}

		for (var i = 0; i < callbacks.length; i++) {
			callbacks[i].apply(null, args);
		}
	};


	/**
	 * @class
	 */
	var Deferred = function() {
		if (!(this instanceof Deferred)) {
			return forceNew(Deferred, arguments, 'Deferred');
		}

		this._state = Deferred.State.PENDING;
		this._callbacks = {
			done: [],
			fail: [],
			progress: []
		};
		this._closingArguments = [];
		this._promise = new Promise(this);
	};


	Deferred.prototype = {

		/**
		 * @return {Promise}
		 */
		promise: function() {
			return this._promise;
		},


		/**
		 * @return {Deferred.State}
		 */
		state: function() {
			return this._state;
		},


		/**
		 * @param {...*} args
		 * @return this
		 */
		resolve: function() {
			if (this._state !== Deferred.State.PENDING) { //already resolved/rejected
				return this;
			}

			this._state = Deferred.State.RESOLVED;
			_execute(this._callbacks.done, arguments);
			this._closingArguments = arguments;
			return this;
		},


		/**
		 * @param {...*} args
		 * @return this
		 */
		reject: function() {
			if (this._state !== Deferred.State.PENDING) { //already resolved/rejected
				return this;
			}

			this._state = Deferred.State.REJECTED;
			_execute(this._callbacks.fail, arguments);
			this._closingArguments = arguments;
			return this;
		},


		/**
		 * @return this
		 */
		notify: function() {
			if (this._state !== Deferred.State.PENDING) { //already resolved/rejected
				return this;
			}

			_execute(this._callbacks.progress, arguments);
			return this;
		},


		/**
		 * @param {Function} doneCallback
		 * @param {Function} [failCallback]
		 * @param {Function} [progressCallback]
		 * @return this
		 */
		then: function(doneCallback, failCallback, progressCallback) {
			if (this._state === Deferred.State.RESOLVED) {
				_execute(doneCallback, this._closingArguments);
				return this;
			}

			if (this._state === Deferred.State.REJECTED) {
				_execute(failCallback, this._closingArguments);
				return this;
			}

			if (doneCallback) {
				this._callbacks.done.push(doneCallback);
			}

			if (failCallback) {
				this._callbacks.fail.push(failCallback);
			}

			if (progressCallback) {
				this._callbacks.progress.push(progressCallback);
			}

			return this;
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		done: function(callback) {
			return this.then(callback);
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		fail: function(callback) {
			return this.then(undefined, callback);
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		always: function(callback) {
			return this.then(callback, callback);
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		progress: function(callback) {
			return this.then(undefined, undefined, callback);
		}

	};


	/**
	 * @enum {String}
	 * @const
	 */
	Deferred.State = {
		PENDING: "pending",
		RESOLVED: "resolved",
		REJECTED: "rejected"
	};


	return Deferred;

});
