define(function(require) {

	var Deferred = require('./Deferred');
	var isFunction = require('amd-utils/lang/isFunction');
	var isPromise = require('./isPromise');


	var anyToDeferred = function(obj) {
		//any arguments after obj will be passed to obj(), if obj is a function
		var args = Array.prototype.slice.call(arguments, 1);
		if (isPromise(obj)) {
			return obj;
		}
		else if (isFunction(obj)) {
			var result = obj.apply(obj, args);
			if (isPromise(result)) {
				return result;
			}
			return Deferred().resolve(result);
		}
		else {
			return Deferred().resolve(obj);
		}
	};


	return anyToDeferred;

});
