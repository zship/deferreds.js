define(function(require) {

	var reduce = require('./reduce');
	var map = require('../collection/map');
	var pluck = require('../collection/pluck');

	var reduceRight = function(arr, memo, iterator) {
		var reversed = map(arr, function(val, i) {
			return {index: i, value: val};
		}).reverse();
		reversed = pluck(reversed, 'value');
		return reduce(reversed, memo, iterator);
	};

	return reduceRight;

});
