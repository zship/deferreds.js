## series

Evaluates elements in `tasks` one at a time and in order, storing the result of
evaluating each task in a new {Array}.


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

The returned {Promise} is fulfilled when the last {Promise} in `tasks` has been
fulfilled. If any task is rejected, processing will cease and the returned
{Promise} will be immediately rejected.

Fulfills with an in-order {Array} of the results of evaluating each task in
`tasks`.


### Example

```js
var Deferred = require('deferreds/Deferred');
var series = require('deferreds/series');


//for brevity in examples, _timedDeferred is a Function which returns a Promise
//is fulfilled with `val` after `t` milliseconds
var _timedDeferred = function(t, val) {
	var deferred = new Deferred();
	setTimeout(function() {
		deferred.resolve(val);
	}, t);
	return deferred.promise();
};


//regular usage: Array of Functions returning Promises
series([
	function() {
		return _timedDeferred(20, 'A');
	},
	//20ms passes, then:
	function(){
		return _timedDeferred(30, 'B');
	},
	//30ms passes, then:
	function(){
		return _timedDeferred(10, 'C');
	}
]).then(function(result) {
	console.log(result); //> ['A', 'B', 'C']
});


//Deferred/Promise objects and regular values may be passed as-is, and result
//will still be in order
series([
	function() {
		return _timedDeferred(20, 'A');
	},
	_timedDeferred(30, 'B'),
	'C'
]).then(function(result) {
	console.log(result); //> ['A', 'B', 'C']
});
```
