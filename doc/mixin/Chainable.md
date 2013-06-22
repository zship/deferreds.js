{Chainable} is a special {Deferred} object which is made up of (delegated)
methods from the static utility modules under `deferreds/`. The purpose is to
reduce nesting and simplify chaining between the higher-order functions in
`deferreds/`. The result of each function in the chain is passed as the first
argument to the next function. Internally all calls go through the
{Chainable#then} method, so each function in the chain will always wait for the
previous function to resolve.

```js
//just a quick function to return Promise objects which
//are fulfilled after a timeout.
var Delayed = function(val) {
	var deferred = new Deferred();
	setTimeout(function() {
		deferred.resolve(val);
	}, 10);
	return deferred.promise();
};


var list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
Chainable(list)
	//list passed:
	//.filter(list, function(n) {
	.filter(function(n) {
		return Delayed(n % 2 === 0);
	})
	//.reject(<result of filter()>, function(n) {
	.reject(function(n) {
		return Delayed(n % 4 === 0);
	})
	//.sortBy(<result of reject()>, function(n) {
	.sortBy(function(n) {
		return Delayed(-1 * n);
	})
	.then(function(result) {
		console.log(result); //> [10, 6, 2]
	});
```

Without {Chainable}, the above example would be somewhat obscured:

```js
var list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

filter(list, function(n) {
	return Delayed(n % 2 === 0);
})
	.then(function(result) {
		return reject(result, function(n) {
			return Delayed(n % 4 === 0);
		});
	})
	.then(function(result) {
		return sortBy(result, function(n) {
			return Delayed(-1 * n);
		});
	})
	.then(function(result) {
		console.log(result); //> [10, 6, 2]
	});
```




## constructor

Make a new {Chainable} object, starting a new chain with the value of `wrapped`
to be passed to the next function in the chain. If `wrapped` is not passed, the
next function in the chain must be a no-arg such as {Chainable#then} or
{Chainable#parallel}.




## then

Uses {Deferred#then} to chain functions in series, each one waiting for the
{Promise} returned from the previous function to be fulfilled. The only change
in this override is to return a {Chainable} rather than a {Deferred}. See
{Deferred#then} and the overview of {Chainable} for more about how `then` works.




## every

Delegates to {Deferreds.every}, filling in the `list` argument from the result
of the previous function in the chain. Because {Deferreds.every} resolves to a
single {Boolean} value, this will most likely end the chain.




## filter

Delegates to {Deferreds.filter}, filling in the `list` argument from the result
of the previous function in the chain.




## filterSeries

Delegates to {Deferreds.filterSeries}, filling in the `list` argument from the
result of the previous function in the chain.




## find

Delegates to {Deferreds.find}, filling in the `list` argument from the result
of the previous function in the chain. Because {Deferreds.find} resolves to a
non-collection value, this will most likely end the chain.




## findSeries

Delegates to {Deferreds.findSeries}, filling in the `list` argument from the
result of the previous function in the chain. Because {Deferreds.findSeries}
resolves to a non-collection value, this will most likely end the chain.




## forEach

Delegates to {Deferreds.forEach}, filling in the `list` argument from the
result of the previous function in the chain. Because {Deferreds.forEach} does
not resolve a value, this will effectively end the chain unless a no-arg
({Chainable#then}) is used next (at which point you might consider asking
yourself if there's a better way to do what you're doing). 




## forEachSeries

Delegates to {Deferreds.forEachSeries}, filling in the `list` argument from the
result of the previous function in the chain. Because {Deferreds.forEachSeries}
does not resolve a value, this will effectively end the chain unless a no-arg
({Chainable#then}) is used next (at which point you might consider asking
yourself if there's a better way to do what you're doing).




## map

Delegates to {Deferreds.map}, filling in the `list` argument from the result of
the previous function in the chain.




## mapSeries

Delegates to {Deferreds.mapSeries}, filling in the `list` argument from the
result of the previous function in the chain.




## parallel

Delegates to {Deferreds.parallel}, filling in the first argument from the
result of the previous function in the chain.




## reduce

Delegates to {Deferreds.reduce}, filling in the `list` argument from the result
of the previous function in the chain. Because {Deferreds.reduce} resolves to a
non-collection value, this will most likely end the chain.




## reduceRight

Delegates to {Deferreds.reduceRight}, filling in the `list` argument from the
result of the previous function in the chain. Because {Deferreds.reduceRight}
resolves to a non-collection value, this will most likely end the chain.




## reject

Delegates to {Deferreds.reject}, filling in the `list` argument from the result
of the previous function in the chain.




## rejectSeries

Delegates to {Deferreds.rejectSeries}, filling in the `list` argument from the
result of the previous function in the chain.




## series

Delegates to {Deferreds.series}, filling in the first argument from the
result of the previous function in the chain.




## some

Delegates to {Deferreds.some}, filling in the `list` argument from the result
of the previous function in the chain. Because {Deferreds.some} resolves to a
single {Boolean} value, this will most likely end the chain.




## sortBy

Delegates to {Deferreds.sortBy}, filling in the `list` argument from the result
of the previous function in the chain.
