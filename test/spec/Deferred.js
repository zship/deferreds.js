define(function(require){

	var Deferred = require('Deferred');


	module('Deferred');


	test("New Deferred", function() {

		expect(19);


		var defer = Deferred();
		defer.resolve().done(function() {
			ok( true, "Success on resolve" );
			strictEqual(defer.state(), "resolved", "Deferred is resolved (state)");
		}).fail(function() {
			ok( false, "Error on resolve" );
		}).always(function() {
			ok( true, "Always callback on resolve" );
		});


		defer = Deferred();
		defer.reject().done(function() {
			ok( false, "Success on reject" );
		}).fail(function() {
			ok( true, "Error on reject" );
			strictEqual(defer.state(), "rejected", "Deferred is rejected (state)");
		}).always(function() {
			ok( true, "Always callback on reject" );
		});


		defer = new Deferred();
		var promise = defer.promise();
		strictEqual(defer.promise(), promise, "promise is always the same");


		"resolve reject".split(" ").forEach(function(change) {
			var defer = new Deferred();

			strictEqual(defer.state(), "pending", "pending after creation");

			var checked = 0;
			defer.progress(function(value) {
				strictEqual(value, checked, "Progress: right value (" + value + ") received");
			});

			for (checked = 0; checked < 3; checked++) {
				defer.notify(checked);
			}
			strictEqual(defer.state(), "pending", "pending after notification");

			defer[change]();
			notStrictEqual( defer.state(), "pending", "not pending after " + change );
			defer.notify();
		});

	});


	test("Deferred - chainability", function() {
		var defer = new Deferred();

		expect(8);

		"resolve reject notify then done fail progress always".split(" ").forEach(function(method) {
			strictEqual(defer[method](), defer, method + " is chainable" );
		});
	});


	test("Deferred.then - done", function() {
		expect(2);

		var value1;
		var value2;
		var defer = new Deferred();

		defer.done(function( a, b ) {
			value1 = a;
			value2 = b;
		});

		defer.resolve( 2, 3 );

		strictEqual( value1, 2, "first resolve value ok" );
		strictEqual( value2, 3, "second resolve value ok" );
	});


	test("Deferred.then - fail", function() {
		expect(2);

		var value1;
		var value2;
		var defer = new Deferred();

		defer.fail(function( a, b ) {
			value1 = a;
			value2 = b;
		});

		defer.reject( 2, 3 );

		strictEqual( value1, 2, "first reject value ok" );
		strictEqual( value2, 3, "second reject value ok" );
	});


	test("Deferred.then - progress", function() {
		expect(2);

		var value1;
		var value2;
		var defer = new Deferred();

		defer.progress(function( a, b ) {
			value1 = a;
			value2 = b;
		});

		defer.notify( 2, 3 );

		strictEqual( value1, 2, "first progress value ok" );
		strictEqual( value2, 3, "second progress value ok" );
	});


	test("Deferred.then - resolve, done", function() {
		expect(2);

		var value1;
		var value2;
		var defer = new Deferred();

		defer.resolve( 2, 3 );

		defer.done(function( a, b ) {
			value1 = a;
			value2 = b;
		});

		strictEqual( value1, 2, "first resolve value ok" );
		strictEqual( value2, 3, "second resolve value ok" );
	});


	test("Deferred.then - reject, fail", function() {
		expect(2);

		var value1;
		var value2;
		var defer = new Deferred();

		defer.reject( 2, 3 );

		defer.fail(function( a, b ) {
			value1 = a;
			value2 = b;
		});

		strictEqual( value1, 2, "first reject value ok" );
		strictEqual( value2, 3, "second reject value ok" );
	});


	asyncTest("Deferred - throw (not swallow!) errors", function() {
		expect(1);

		var defer = new Deferred();

		defer.then(function() {
			throw 'test';
		});

		setTimeout(function() {
			throws(function() {
				defer.resolve();
			}, 'Error propagates');
			start();
		}, 10);
	});

});
