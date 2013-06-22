## forEachSeries

Invoke `iterator` once for each item in `list`. `iterator` is called on each
item in the list in order, waiting for the {Promise} object returned from
`iterator` to be fulfilled before proceeding.


### Iterator

`function(element, index, list) : Promise`

* `element` - {Any} - the current element
* `index` - {Number} - the current list index
* `list` - {Array} - the original Array
* **fulfilled value** - {Any} to indicate that the current iteration is
  finished


### Fulfilled value

The returned {Promise} is fulfilled when `iterator` has been fulfilled for
every element in the `list`. If `iterator` is rejected at any point, processing
will cease and the returned {Promise} will be immediately rejected.

Fulfills with no value.


### Example

```js
var Deferred = require('deferreds/Deferred');
var forEachSeries = require('deferreds/forEachSeries');

forEachSeries([1, 3, 2], function(num) {
	var deferred = new Deferred();
	setTimeout(function(){
		args.push(num);
		deferred.resolve();
	}, num * 10);
	return deferred.promise();
}).then(function() {
	console.log(args); //> [1, 3, 2]
});
```
