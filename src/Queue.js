/*global setImmediate:false */
define(function(require) {

	'use strict';


	var Signal = require('signals');
	require('setimmediate');

	var Deferred = require('./Deferred');
	var Promise = require('./Promise');


	/**
	 * Processes tasks in parallel up to `concurrency` limit, reporting events
	 * along the way.
	 * @class
	 * @param {Function} worker
	 * @param {Number} iterator
	 */
	var Queue = function(worker, concurrency) {

		this._running = false;
		this._worker = worker;
		this._concurrency = concurrency;
		this._runningWorkers = 0;
		this._events = {
			saturated: new Signal(),
			emptied: new Signal(),
			drained: new Signal()
		};

	};


	Queue.prototype = Object.create(Array.prototype);
	Queue.prototype.constructor = Queue;


	/**
	 * @return {Queue}
	 */
	Queue.prototype.clone = function() {
		var cloned = new Queue(this._worker, this._concurrency);
		return cloned;
	};


	/**
	 * @return this
	 */
	Queue.prototype.start = function() {
		this._running = true;
		this._stoppedDeferred = undefined;
		this.process();
		return this;
	};


	/**
	 * @return {Promise}
	 */
	Queue.prototype.stop = function() {
		this._running = false;
		this._stoppedDeferred = new Deferred();
		if (this._runningWorkers === 0) {
			this._stoppedDeferred.resolve();
		}
		return this._stoppedDeferred.promise();
	};


	/**
	 * @param {String} key
	 * @param {Function} callback
	 * @return this
	 */
	Queue.prototype.on = function(key, callback) {
		this._events[key].add(callback);
		return this;
	};


	/**
	 * @param {String} key
	 * @param {Function} [callback]
	 * @return this
	 */
	Queue.prototype.off = function(key, callback) {
		if (callback) {
			this._events[key].remove(callback);
		}
		else {
			this._events[key].removeAll();
		}
		return this;
	};


	Queue.prototype.process = function() {
		setImmediate(function() {
			if (!this._running) {
				return;
			}

			if (!this.length) {
				return;
			}

			if (this._runningWorkers >= this._concurrency) {
				return;
			}

			var task = Array.prototype.shift.call(this);

			if (!this.length) {
				this._events.emptied.dispatch();
			}

			this._runningWorkers++;

			Promise.fromAny(this._worker(task)).then(function() {
				this._runningWorkers--;
				if (this.length === 0 && this._runningWorkers === 0) {
					this._events.drained.dispatch();
				}
				if (this._stoppedDeferred && this._runningWorkers === 0) {
					this._stoppedDeferred.resolve();
				}
				this.process();
			}.bind(this));
		}.bind(this));
	};


	//Array mutator methods
	['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift']
		.forEach(function(key) {
			Queue.prototype[key] = function() {
				var ret = Array.prototype[key].apply(this, arguments);
				if (this.length === this._concurrency) {
					this._events.saturated.dispatch();
				}
				this.process();
				return ret;
			};
		});


	//Array methods returning new arrays
	['concat', 'slice', 'filter', 'map']
		.forEach(function(key) {
			Queue.prototype[key] = function() {
				var ret = Array.prototype[key].apply(this, arguments);
				var q = this.clone();
				q.push.apply(q, ret);
				return q;
			};
		});


	return Queue;


	/**
	 * @event Queue#saturated
	 */

	/**
	 * @event Queue#empty
	 */

	/**
	 * @event Queue#drain
	 */


	/**
	 * @function Queue#pop
	 * @return {Any}
	 */

	/**
	 * @function Queue#push
	 * @param {Any} task
	 * @return {Number} new length of the Queue
	 */

	/**
	 * @function Queue#reverse
	 * @param {Any} task
	 */

	/**
	 * @function Queue#shift
	 * @return {Any} task
	 */

	/**
	 * @function Queue#sort
	 * @param {Function} compareFunction
	 * @return {Queue}
	 */

	/**
	 * @function Queue#splice
	 * @param {Number} index
	 * @param {Number} howMany
	 * @param {...Any} elements
	 * @return {Queue}
	 */

	/**
	 * @function Queue#unshift
	 * @param {...Any} elements
	 * @return {Number} new length of the Queue
	 */

	/**
	 * @function Queue#concat
	 * @param {Array|Any} values
	 * @return {Queue}
	 */

	/**
	 * @function Queue#slice
	 * @param {Number} begin
	 * @param {Number} end
	 * @return {Queue}
	 */

	/**
	 * @function Queue#filter
	 * @param {Function} callback
	 * @param {Object} [thisObject]
	 * @return {Queue}
	 */

	/**
	 * @function Queue#map
	 * @param {Function} callback
	 * @param {Object} [thisObject]
	 * @return {Queue}
	 */

});
