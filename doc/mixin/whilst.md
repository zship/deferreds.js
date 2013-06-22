## whilst

An asynchronous version of the `while` construct. Alternates between calling
`test` and `iterator` until the result of `test` is `false`. Both `test` and
`iterator` can optionally return a {Promise} object and {deferreds/whilst} will
wait for it to be fulfilled before continuing.


### Fulfilled value

The returned {Promise} is fulfilled when `test` is fulfilled with a value of
`false`. If either `test` or `iterator` returns a {Promise} which is rejected,
processing will cease and the returned {Promise} will be immediately rejected.

Fulfills with no value.


### Example

```js
var called = [];
var count = 0;

whilst(
	function() {
		called.push('test ' + count);
		return (count !== 2);
	},
	function() {
		var deferred = new Deferred();
		setTimeout(function() {
			called.push('iterator ' + count);
			deferred.resolve();
		}, 10);
		return deferred.promise();
	}
).then(function() {
	console.log(called);
	/*

	> [
		'test 0',
		'iterator 0',
		'test 1',
		'iterator 1',
		'test 2'
	]

	*/
});
```
