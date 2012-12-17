define(function(require) {

	var forceNew = require('./forceNew');
	var forEach = require('amd-utils/array/forEach');
	var isArray = require('amd-utils/lang/isArray');


	var States = {
		PENDING: "pending",
		RESOLVED: "resolved",
		REJECTED: "rejected"
	};


	//just a restricted view of a Deferred object
	var Promise = function(deferred) {
		this._deferred = deferred;
	};


	forEach(['then', 'done', 'fail', 'always', 'progress'], function(name) {
		Promise.prototype[name] = function() {
			this._deferred[name].apply(this._deferred, arguments);
			return this;
		};
	});


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


	var Deferred = function() {
		if (!(this instanceof Deferred)) {
			return forceNew(Deferred, arguments, 'Deferred');
		}

		this._state = States.PENDING;
		this._callbacks = {
			done: [],
			fail: [],
			progress: []
		};
		this._closingArguments = [];
		this._promise = new Promise(this);
	};


	Deferred.prototype = {

		promise: function() {
			return this._promise;
		},


		state: function() {
			return this._state;
		},


		resolve: function() {
			if (this._state !== States.PENDING) { //already resolved/rejected
				return this;
			}

			this._state = States.RESOLVED;
			_execute(this._callbacks.done, arguments);
			this._closingArguments = arguments;
			return this;
		},


		reject: function() {
			if (this._state !== States.PENDING) { //already resolved/rejected
				return this;
			}

			this._state = States.REJECTED;
			_execute(this._callbacks.fail, arguments);
			this._closingArguments = arguments;
			return this;
		},


		notify: function() {
			if (this._state !== States.PENDING) { //already resolved/rejected
				return this;
			}

			_execute(this._callbacks.progress, arguments);
			return this;
		},


		then: function(done, fail, progress) {
			if (this._state === States.RESOLVED) {
				_execute(done, this._closingArguments);
				return this;
			}

			if (this._state === States.REJECTED) {
				_execute(fail, this._closingArguments);
				return this;
			}

			if (done) {
				this._callbacks.done.push(done);
			}

			if (fail) {
				this._callbacks.fail.push(fail);
			}

			if (progress) {
				this._callbacks.progress.push(progress);
			}

			return this;
		},


		done: function(callback) {
			return this.then(callback);
		},


		fail: function(errback) {
			return this.then(undefined, errback);
		},


		always: function(alwaysback, progback) {
			return this.then(alwaysback, alwaysback, progback);
		},


		progress: function(progback) {
			return this.then(undefined, undefined, progback);
		}

	};


	return Deferred;

});
