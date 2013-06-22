## some

Determines whether any value in `list` passes the truth test provided by
`iterator`. `iterator` is called on all items within `list` in parallel, so
there is no guarantee that the items will be processed in order.

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

If `iterator` is rejected at any point, the returned {Promise} will also be
rejected.

Fulfills with a {Boolean} indicating whether or not any item in `list` passed
`iterator`'s test.


### Example

```js
var Deferred = require('deferreds/Deferred');
var some = require('deferreds/some');

some([1, 2, 3], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		deferred.resolve(num === 3);
	}, 10);
	return deferred.promise();
}).then(function(result) {
	console.log(result); //> true
});
```
