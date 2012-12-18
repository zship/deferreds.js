define(function(require) {

	var reduce = require('./reduce');
	var map = require('amd-utils/collection/map');
	var pluck = require('amd-utils/collection/pluck');


	var reduceRight = function(list, iterator, memo) {
		var reversed = map(list, function(val, i) {
			return {index: i, value: val};
		}).reverse();
		reversed = pluck(reversed, 'value');
		return reduce(reversed, iterator, memo);
	};


	return reduceRight;

});
