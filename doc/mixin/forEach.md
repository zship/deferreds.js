## forEach

Invoke `iterator` once for each item in `list`. `iterator` is called on all
items within `list` in parallel, so there is no guarantee that the items will
be processed in order.


### Iterator

`function(element, index, list) : Promise`

* `element` - {Any} - the current element
* `index` - {Number} - the current list index
* `list` - {Array} - the original Array
* **fulfilled value** - {Any} to indicate that the current iteration is finished


### Fulfilled value

The returned {Promise} is fulfilled when `iterator` has been fulfilled for
every element in the `list`.  If `iterator` is rejected at any point, the
returned {Promise} will also be rejected.

Fulfills with no value.


### Example

```js
var Deferred = require('deferreds/Deferred');
var forEach = require('deferreds/forEach');

forEach([1, 3, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		args.push(num);
		deferred.resolve();
	}, num * 10);
	return deferred.promise();
}).then(function() {
	//timeouts were 10ms for 1, 20ms for 2, and 30ms for 3
	console.log(args); //> [1, 2, 3]
});
```
