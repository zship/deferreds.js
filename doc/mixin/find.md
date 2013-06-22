## find

Determines the first value in `list` for which `iterator` is fulfilled with
`true`. `iterator` is called on all items within `list` in parallel, so there
is no guarantee that the items will be processed in order.


### Iterator

`function(element, index, list) : Promise`

* `element` - {Any} - the current element
* `index` - {Number} - the current list index
* `list` - {Array} - the original Array
* **fulfilled value** -
  [Truthy/Falsy](http://www.sitepoint.com/javascript-truthy-falsy/) indicating
  whether current `element` passes


### Fulfilled value

The returned {Promise} object can be fulfilled:

* The first time `iterator` is fulfilled with `true` for an item
* When `iterator` has been fulfilled with `false` for every item

If `iterator` is rejected at any point, the returned {Promise} will also be rejected.

Fulfills with:

* {Any} - the first value in `list` which passed `iterator`'s truth test, **or**
* {undefined} - if no value passed


### Example

```js
var Deferred = require('deferreds/Deferred');
var find = require('deferreds/find');

var order = [];

find([3, 1, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		order.push(num);
		var isEven = (num % 2 === 0);
		deferred.resolve(isEven);
	}, num * 10);
	return deferred.promise();
}).then(function(result) {
	console.log(result); //> 2
	console.log(order); //> [1, 2, 3]
});
```
