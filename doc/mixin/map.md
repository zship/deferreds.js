## map

Produces a new {Array} by mapping each item in `list` through the
transformation function `iterator`. `iterator` is called on all items within
`list` in parallel, so there is no guarantee that the items will be processed
in order. However, the final list will retain the ordering of the passed
`list`.


### Iterator

`function(element, index, list) : Promise`

* `element` - {Any} - the current element
* `index` - {Number} - the current list index
* `list` - {Array} - the original Array
* **fulfilled value** - {Any} - the transformed version of `element`


### Fulfilled value

The returned {Promise} is fulfilled when `iterator` has been fulfilled for
every element in the `list`.  If `iterator` is rejected at any point, the
returned {Promise} will also be rejected.

Fulfills with a new {Array} of transformed elements.


### Example

```js
var Deferred = require('deferreds/Deferred');
var map = require('deferreds/map');

var order = [];

map([3, 1, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		order.push(num);
		deferred.resolve(num * 2);
	}, num * 10);
	return deferred.promise();
}).then(function(result) {
	console.log(result); //> [6, 2, 4]
	console.log(order); //> [1, 2, 3]
});
```
