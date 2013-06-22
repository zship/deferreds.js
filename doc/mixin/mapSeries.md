## mapSeries

Produces a new {Array} by mapping each item in `list` through the
transformation function `iterator`. `iterator` is called on each item in the
list in order, waiting for the {Promise} object returned from `iterator` to be
fulfilled before proceeding.


### Iterator

`function(element, index, list) : Promise`

* `element` - {Any} - the current element
* `index` - {Number} - the current list index
* `list` - {Array} - the original Array
* **fulfilled value** - {Any} - the transformed version of `element`


### Fulfilled value

The returned {Promise} is fulfilled when `iterator` has been fulfilled for
every element in the `list`.  If `iterator` is rejected at any point,
processing will cease and the returned {Promise} will be immediately rejected.

Fulfills with a new {Array} of transformed elements.


### Example

```js
var Deferred = require('deferreds/Deferred');
var mapSeries = require('deferreds/mapSeries');

var order = [];

mapSeries([3, 1, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		order.push(num);
		deferred.resolve(num * 2);
	}, num * 10);
	return deferred.promise();
}).then(function(result) {
	console.log(result); //> [6, 2, 4]
	console.log(order); //> [3, 1, 2]
});
```
