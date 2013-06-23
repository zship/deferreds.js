A {Deferred} object wraps a {Promise} object and provides ways to change its
state from "pending" to "fulfilled" or "rejected". It is used to convert
callback or continuation-passing style (common in Node.js' asynchronous
functions) to a monadic {Promise} form. Which is a fancy way of saying "make
this contrived example&hellip;

```js
//Continuation-passing style
fs.readFile("config.json", function(err, data) {
	if (err) {
		console.error(err);
	}
	var mainConfig = JSON.parse(data).mainConfig;
	fs.exists(mainConfig, function(exists) {
		if (!exists) {
			throw new Error('Missing mainConfig file: ' + depFile);
		}
		loadConfig(mainConfig, function(err, mainConfigData) {
			//...
		});
	});
});
```

&hellip;look like this&hellip;

```js
//Promise style
promisifiedFs.readFile("config.json")
	.then(function(data) {
		return promisifiedFs.exists(JSON.parse(data).mainConfig);
	})
	.then(function(exists) {
		if (!exists) {
			throw new Error('Missing mainConfig file: ' + depFile);
		}
		return loadConfig(mainConfig);
	})
	.then(function(mainConfigData) {
		//...
	})
	.then(null, function(err) {
		console.error(err);
	});
```

&hellip;defined something like this:"

```js
//use Deferred to convert a continuation-passing-style function into a
//Promise-style function
var promisifiedFs = {
	readFile: function(file) {
		var deferred = new Deferred();
		fs.readFile(file, function(err, data) {
			if (err) {
				deferred.reject(err);
			}
			else {
				deferred.resolve(data);
			}
		});
		return deferred.promise();
	},
	exists: function(file) {
		var deferred = new Deferred();
		fs.exists(file, function(exists) {
			deferred.resolve(exists);
		});
		return deferred.promise();
	}
};

```

See {Promise} for the main discussion on this style.




## promise

Return the wrapped {Promise} object. You will normally want return this
{Promise} object instead of the {Deferred} in order to guarantee that
downstream code cannot alter the {Deferred}'s state.




## state

Returns the {Promise.State} of the wrapped {Promise} object.




## resolve

Mark the wrapped {Promise}'s {Promise.State} as "fulfilled" and call any
`onFulfilled` callbacks.




## reject

Mark the wrapped {Promise}'s {Promise.State} as "rejected" and call any
`onRejected` callbacks.




## then

Delegates to the wrapped {Promise} object's {Promise#then}.




## done

Delegates to the wrapped {Promise} object's {Promise#done}.




## fail

Delegates to the wrapped {Promise} object's {Promise#fail}.




## always

Delegates to the wrapped {Promise} object's {Promise#always}.
