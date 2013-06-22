## reduce

Boils a `list` of values down into a single value. `memo` is the initial state
of the reduction, and the {Promise} result of each call to `iterator` should be
fulfilled with next desired value of `memo`. `iterator` is called on each item
in the list in order, waiting for the {Promise} object returned from `iterator`
to be fulfilled before proceeding.


### Iterator

`function(memo, element, index, list) : Promise`

* `memo` - {Any} - value from the previous step of the reduction
* `element` - {Any} - the current element
* `index` - {Number} - the current list index
* `list` - {Array} - the original Array
* **fulfilled value** - {Any} - next value of `memo`


### Fulfilled value

The returned {Promise} is fulfilled when `iterator` has been fulfilled for
every item in the `list`. If `iterator` is rejected at any point, processing
will cease and the returned {Promise} will be immediately rejected.

Fulfills with the final {Any} value of `memo`.


### Example

```js
var Deferred = require('deferreds/Deferred');
var reduce = require('deferreds/reduce');

var order = [];

reduce([3, 1, 2], function(memo, num) {
	var deferred = new Deferred();
	setTimeout(function(){
		order.push(num);
		deferred.resolve(num + memo);
	}, num * 10);
	return deferred.promise();
}, 0).then(function(result) {
	console.log(result); //> 6
	console.log(order); //> [3, 1, 2]
});
```
