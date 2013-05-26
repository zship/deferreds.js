define(function(require){

	var isDeferred = require('deferreds/isDeferred');
	var Deferred = require('deferreds/Deferred');


	module('isDeferred');


	test('isDeferred', function() {
		var deferred = new Deferred();
		ok(isDeferred(deferred), 'new Deferred isDeferred: true');
		ok(!isDeferred(deferred.promise()), 'Promise isDeferred: false');
		ok(!isDeferred({}), 'Empty object isDeferred: false');
	});

});
