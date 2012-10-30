define(['amd-utils/lang/isArray', 'amd-utils/array/map', 'amd-utils/object/map'], function (isArray, arrayMap, objectMap) {

	function map(list, iterator, context) {
		if (isArray(list)) {
			return arrayMap(list, iterator, context);
		}
		else {
			return objectMap(list, iterator, context);
		}
	}

	return map;

});
