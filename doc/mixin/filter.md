## filter

Builds an {Array} containing all values in `list` which pass the truth test
provided by `iterator`. `iterator` is called on all items within `list` in
parallel, so there is no guarantee that the items will be processed in order.
However, the final list will retain the ordering of the passed `list`.


### Iterator

`function(element, index, list) : Promise`

* `element` - {Any} - the current element
* `index` - {Number} - the current list index
* `list` - {Array} - the original Array
* **fulfilled value** -
  [Truthy/Falsy](http://www.sitepoint.com/javascript-truthy-falsy/) indicating
  whether current `element` passes


### Fulfilled value

The returned {Promise} is fulfilled when `iterator` has been fulfilled for
every item in the `list`. If `iterator` is rejected at any point, the returned
{Promise} will also be rejected.

Fulfills with an {Array} containing all values in `list` which passed
`iterator`'s truth test.


### Example

```js
var Deferred = require('deferreds/Deferred');
var filter = require('deferreds/filter');

var order = [];

filter([3, 1, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		order.push(num);
		var isOdd = (num % 2 !== 0);
		deferred.resolve(isOdd);
	}, num * 10);
	return deferred.promise();
}).then(function(result) {
	//filter() re-orders the final list to match the index order of the first
	//list
	console.log(result); //> [3, 1]
	console.log(order); //> [1, 2, 3]
});
```
