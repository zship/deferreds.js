define(function(require) {

	'use strict';


	var Promise = require('./Promise');


	/**
	 * @class
	 */
	var Deferred = function() {
		if (!(this instanceof Deferred)) {
			throw new Error('Deferred constructor function must be called with the "new" keyword');
		}

		this._promise = new Promise();
	};


	Object.keys(Promise.prototype).forEach(function(key) {
		Deferred.prototype[key] = function() {
			this._promise[key].apply(this._promise, arguments);
		};
	});


	/**
	 * @return {Promise}
	 */
	Deferred.prototype.promise = function() {
		return this._promise;
	};


	/**
	 * @param {...Any} args
	 * @return this
	 */
	Deferred.prototype.resolve = function() {
		this._promise._resolve.apply(this._promise, arguments);
		return this;
	};


	/**
	 * @param {...Any} args
	 * @return this
	 */
	Deferred.prototype.reject = function() {
		this._promise._reject.apply(this._promise, arguments);
		return this;
	};


	return Deferred;

});
