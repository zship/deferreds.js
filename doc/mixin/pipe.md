## pipe

Evaluates elements in `tasks` one at a time and in order, each time passing the
result as an argument to the next {Function} in the chain. If a task evaluates
to a {Promise}, the next argument will not be evaluated until the {Promise} has
been fulfilled. This is equivalent to chaining {Promise#then} calls, just
possibly more succinct. `pipe` represents the same concept as [Bash
pipelines](http://www.gnu.org/software/bash/manual/html_node/Pipelines.html)
and the F# language's [forward pipe
operator](http://msdn.microsoft.com/en-us/library/dd233228.aspx).


### Tasks

Each task in `tasks` may be (in order of expected usage):

* {Function} returning a {Promise}
	* Fulfilled value is passed forward in the chain
* {Function} returning {Any}
	* Returned value is passed forward in the chain
* {Promise} object
	* Fulfilled value is passed forward in the chain
* {Any}
	* Value is passed forward in the chain


### Fulfilled value

The returned {Promise} is fulfilled when every passed {Promise} in `tasks` has
been fulfilled. If any task is rejected, processing will cease and the returned
{Promise} will be immediately rejected.

Fulfills with the same ({Any}) value as the last task in `tasks`.


### Example

```js
var Deferred = require('deferreds/Deferred');
var pipe = require('deferreds/pipe');

//regular usage: Array of Functions returning Promises
pipe([
	function() {
		var deferred = new Deferred();
		setTimeout(function() {
			deferred.resolve('one', 'two');
		}, 10);
		return deferred.promise();
	},
	function(arg1, arg2) {
		console.log(arg1); //> 'one'
		console.log(arg2); //> 'two'

		var deferred = new Deferred();
		setTimeout(function() {
			deferred.resolve({
				arg1: arg1,
				arg2: arg2,
				arg3: 'three'
			});
		}, 10);
		return deferred.promise();
	},
	function(result) {
		console.log(result.arg1); //> 'one'
		console.log(result.arg2); //> 'two'
		console.log(result.arg3); //> 'three'

		var deferred = new Deferred();
		setTimeout(function() {
			deferred.resolve(['four']);
		}, 10);
		return deferred.promise();
	}
]).then(function(result) {
	console.log(result); //> ['four']
});


//Deferred/Promise objects and regular values may be passed as-is
pipe([
	function() {
		var deferred = new Deferred();
		setTimeout(function() {
			//doesn't matter because next task is not a function
			deferred.resolve('does not matter');
		}, 10);
		return deferred.promise();
	},
	Deferred().resolve('B').promise(),
	function(arg) {
		console.log(arg); //> 'B'
	},
	'C',
	function(arg) {
		console.log(arg); //> 'C'
	},
]);
```
