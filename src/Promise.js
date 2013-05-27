define(function(require) {

	'use strict';


	var mixin = require('mout/object/mixIn');


	/**
	 * @class
	 * @param {Deferred} deferred
	 */
	var Promise = function(deferred) {
		this._deferred = deferred;
	};


	mixin(Promise.prototype, /** @lends Promise.prototype */ {

		/**
		 * @return {Deferred.State}
		 */
		state: function() {
			return this._deferred._state;
		},

		/**
		 * @param {Function} doneCallback
		 * @param {Function} [failCallback]
		 * @param {Function} [progressCallback]
		 * @return this
		 */
		then: function() {
			return this._deferred.then.apply(this._deferred, arguments);
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		done: function() {
			this._deferred.done.apply(this._deferred, arguments);
			return this;
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		fail: function() {
			this._deferred.fail.apply(this._deferred, arguments);
			return this;
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		always: function() {
			this._deferred.always.apply(this._deferred, arguments);
			return this;
		}

	});


	return Promise;

});
