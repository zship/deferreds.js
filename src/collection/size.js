define(['amd-utils/lang/isArray', 'amd-utils/object/keys'], function (isArray, keys) {

	function size(obj) {
		if (!obj) {
			return 0;
		}
		if (isArray(obj)) {
			return obj.length;
		}
		return keys(obj).length;
	}

	return size;

});
