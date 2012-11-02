define(function(require) {

	var when = require('./when');
	var isFunction = require('amd-utils/lang/isFunction');
	var isDeferred = require('./isDeferred');



	var anyToDeferred = function(obj) {
		//any arguments after obj will be passed to obj(), if obj is a function
		var args = Array.prototype.slice.call(arguments, 1);
		if (isDeferred(obj)) {
			return obj;
		}
		else if (isFunction(obj)) {
			var result = obj.apply(obj, args);
			if (isDeferred(result)) {
				return result;
			}
			return when(result);
		}
		else {
			return when(obj);
		}
	};

	return anyToDeferred;

});
