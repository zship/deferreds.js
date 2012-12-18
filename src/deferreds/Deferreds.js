define(function(require) {

	/** @namespace */
	var Deferreds = {
		'anyToDeferred': require('./anyToDeferred'),
		'every': require('./every'),
		'filter': require('./filter'),
		'filterSeries': require('./filterSeries'),
		'find': require('./find'),
		'findSeries': require('./findSeries'),
		'forceNew': require('./forceNew'),
		'forEach': require('./forEach'),
		'forEachSeries': require('./forEachSeries'),
		'isDeferred': require('./isDeferred'),
		'isPromise': require('./isPromise'),
		'map': require('./map'),
		'mapSeries': require('./mapSeries'),
		'parallel': require('./parallel'),
		'reduce': require('./reduce'),
		'reduceRight': require('./reduceRight'),
		'reject': require('./reject'),
		'rejectSeries': require('./rejectSeries'),
		'series': require('./series'),
		'some': require('./some'),
		'until': require('./until'),
		'waterfall': require('./waterfall'),
		'whilst': require('./whilst')
	};


	return Deferreds;

});
