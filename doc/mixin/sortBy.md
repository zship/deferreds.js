## sortBy

Produces a sorted copy of `list`, ranked by the results of running each item
through `iterator`. `iterator` is called on all items within `list` in
parallel, so there is no guarantee that the items will be processed in order.


### Iterator

`function(element, index, list) : Promise`

* `element` - {Any} - the current element
* `index` - {Number} - the current list index
* `list` - {Array} - the original Array
* **fulfilled value** - {Any} - criterion by which to rank the final result


### Fulfilled value

The returned {Promise} is fulfilled when `iterator` has been fulfilled for
every element in the `list`.  If `iterator` is rejected at any point, the
returned {Promise} will also be rejected.

Fulfills with an {Array}: a sorted copy of `list`.


### Example

```js
var Deferred = require('deferreds/Deferred');
var sortBy = require('deferreds/sortBy');

var people = [{name : 'curly', age : 50}, {name : 'moe', age : 30}];
sortBy(people, function(person) {
	var deferred = new Deferred();
	setTimeout(function() {
		deferred.resolve(person);
	}, 10);
	return deferred.promise();
}).then(function(result) {
	console.log(result); //> [{name : 'moe', age : 30}, {name : 'curly', age : 50}]
});
```
