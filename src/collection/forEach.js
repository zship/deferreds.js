define(['amd-utils/lang/isArray', 'amd-utils/array/forEach', 'amd-utils/object/forOwn'], function (isArray, forEach, forOwn) {

	function cForEach(list, fn, thisObj) {
		if (isArray(list)) {
			return forEach(list, fn, thisObj);
		}
		return forOwn(list, fn, thisObj);
	}

	return cForEach;

});
