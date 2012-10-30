define(function(require) {

	var $ = require('jquery');
	var isFunction = require('amd-utils/lang/isFunction');


	var _isDeferredObject = function(obj) {
		return obj && obj.promise;
	};


	var anyToDeferred = function(obj) {
		//any arguments after obj will be passed to obj(), if obj is a function
		var args = Array.prototype.slice.call(arguments, 1);
		if (_isDeferredObject(obj)) {
			return obj;
		}
		else if (isFunction(obj)) {
			var result = obj.apply(obj, args);
			if (!_isDeferredObject(result)) {
				return $.Deferred().resolve(result);
			}
			return result;
		}
		else {
			return $.Deferred().resolve(obj);
		}
	};

	return anyToDeferred;

});
