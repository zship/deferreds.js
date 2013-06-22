## filterSeries

Builds an {Array} containing all values in `list` which pass the truth test
provided by `iterator`. `iterator` is called on each item in the list in order,
waiting for the {Promise} object returned from `iterator` to be fulfilled
before proceeding.


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
every element in the `list`. If `iterator` is rejected for any element,
processing will cease and the returned {Promise} will be immediately rejected.

Fulfills with an {Array} containing all values in `list` which passed
`iterator`'s truth test.


### Example

```js
var Deferred = require('deferreds/Deferred');
var filterSeries = require('deferreds/filterSeries');

var order = [];

filterSeries([3, 1, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		order.push(num);
		var isOdd = (num % 2 !== 0);
		deferred.resolve(isOdd);
	}, num * 10);
	return deferred.promise();
}).then(function(result) {
	console.log(result); //> [3, 1]
	console.log(order); //> [3, 1, 2]
});
```
