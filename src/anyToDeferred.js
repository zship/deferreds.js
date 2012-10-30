define(function(require) {

	var when = require('./when');
	var isFunction = require('amd-utils/lang/isFunction');


	var _isDeferredObject = function(obj) {
		return obj && obj.promise;
	};


	var anyToDeferred = function(obj) {
		//any arguments after obj will be passed to obj(), if obj is a function
		var args = Array.prototype.slice.call(arguments, 1);
		if (_isDeferredObject(obj)) {
			return when(obj);
		}
		else if (isFunction(obj)) {
			var result = obj.apply(obj, args);
			return when(result);
		}
		else {
			return when(obj);
		}
	};

	return anyToDeferred;

});
