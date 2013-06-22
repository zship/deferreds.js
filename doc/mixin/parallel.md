## parallel

Evaluates all elements in `tasks` in parallel, storing the result of evaluating
each task in a new {Array}.


### Tasks

Each task in `tasks` may be (in order of expected usage):

* {Function} returning a {Promise}
	* Fulfilled value is stored
* {Function} returning {Any}
	* Returned value is stored
* {Promise} object
	* Fulfilled value is stored
* {Any}
	* Value is stored


### Fulfilled value

The returned {Promise} is fulfilled when every passed {Promise} in `tasks` has
been fulfilled. If any task is rejected, the returned {Promise} will also be
rejected.

Fulfills with an in-order {Array} of the results of evaluating each task in
`tasks`.


### Example

```js
var Deferred = require('deferreds/Deferred');
var parallel = require('deferreds/parallel');


//for brevity in examples, _timedDeferred is a Function which returns a Promise
//which is fulfilled with `val` after `t` milliseconds
var _timedDeferred = function(t, val) {
	var deferred = new Deferred();
	setTimeout(function() {
		deferred.resolve(val);
	}, t);
	return deferred.promise();
};


//regular usage: Array of Functions returning Promises
parallel([
	function() {
		return _timedDeferred(20, 'A');
	},
	function(){
		return _timedDeferred(30, 'B');
	},
	function(){
		return _timedDeferred(10, 'C');
	}
]).then(function(result) {
	//the resolve order was C, A, B because of the timeouts, but parallel()
	//maintains original ordering
	console.log(result); //> ['A', 'B', 'C']
});


//Promise objects and regular values may be passed as-is, and result will
//still be in order
parallel([
	function() {
		return _timedDeferred(20, 'A');
	},
	_timedDeferred(30, 'B'),
	'C'
]).then(function(result) {
	console.log(result); //> ['A', 'B', 'C']
});
```
