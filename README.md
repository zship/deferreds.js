Deferreds.js
============

[![Build Status](https://travis-ci.org/zship/deferreds.js.png?branch=master)](https://travis-ci.org/zship/deferreds.js)
[![Coverage Status](https://coveralls.io/repos/zship/deferreds.js/badge.png)](https://coveralls.io/r/zship/deferreds.js)
[![Dependency Status](https://gemnasium.com/zship/deferreds.js.png)](https://gemnasium.com/zship/deferreds.js)
[![NPM version](https://badge.fury.io/js/deferreds.png)](http://badge.fury.io/js/deferreds)

Deferreds.js is a utility library centered around working with
[Promises/A+](https://github.com/promises-aplus/promises-spec) Promise/Deferred
objects. The main goal is to do for Deferred objects what
[async.js](https://github.com/caolan/async) does for Node-style asynchronous
functions&#x200A;&mdash;&#x200A;that is, provide many common higher-order
functions (map, reduce, filter, etc.) accepting potentially-asynchronous
Deferred objects as arguments.



Installation
------------

Using npm:

```
npm install deferreds
```

UMD (AMD and CommonJS) and browser-global copies are included.



Compatibility
-------------

* **v1.x** -
  [Promises/A+](https://github.com/promises-aplus/promises-spec)-compliant
  [implementations](https://github.com/promises-aplus/promises-spec/blob/master/implementations.md)
  * The test suite is currently run against [jQuery.Deferred
    1.8](http://api.jquery.com/deferred.then/), [Q
    0.x](https://github.com/kriskowal/q), [RSVP
    2.x](https://github.com/tildeio/rsvp.js), and [when
    2.x](https://github.com/cujojs/when).
* **v0.x** - Promise implementations with a non-chainable `then` method (such
  as [jQuery.Deferred](http://api.jquery.com/deferred.then/) < 1.8)



Features
--------

Utility functions fall into one of two categories: *Collection*
functions and *Control Flow* functions. They can be further split into
functions which operate on inputs in *parallel* and ones which operate in
*series*:


### Collection

### Parallel

* [every](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/every)
* [filter](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/filter)
* [find](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/find)
* [forEach](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/forEach)
* [map](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/map)
* [some](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/some)
* [sortBy](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/sortBy)

### Series

* [filterSeries](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/filterSeries)
* [findSeries](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/findSeries)
* [forEachSeries](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/forEachSeries)
* [mapSeries](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/mapSeries)
* [reduce](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/reduce)


### Control Flow

* [whilst](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/whilst)

#### Parallel

* [parallel](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/parallel)

#### Series

* [series](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/series)
* [pipe](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/pipe)

```js
var Deferred = require('deferreds/Deferred');
var series = require('deferreds/series');


//_delayed is a Function which returns a Promise
//is fulfilled with `val` after `t` milliseconds
var _delayed = function(t, val) {
  var deferred = new Deferred();
  setTimeout(function() {
    deferred.resolve(val);
  }, t);
  return deferred.promise();
};


//regular usage: Array of Functions returning Promises
series([
  function() {
    return _delayed(20, 'A');
  },
  //20ms passes, then:
  function(){
    return _delayed(30, 'B');
  },
  //30ms passes, then:
  function(){
    return _delayed(10, 'C');
  }
]).then(function(result) {
  console.log(result); //> ['A', 'B', 'C']
});


//Deferred/Promise objects and regular values may be passed as-is, and result
//will still be in order
series([
  function() {
    return _delayed(20, 'A');
  },
  _delayed(30, 'B'),
  'C'
]).then(function(result) {
  console.log(result); //> ['A', 'B', 'C']
});
```

In most functions, `iterator` is expected to be an asynchronous function which
returns a `Deferred` or `Promise` object. This is not a requirement, but you
**are** using this library to work with asynchronous code, right? All functions
return a `Promise` object referencing a "master" `Deferred` object which will
resolve with a value which would normally be returned in common higher-order
function libraries. `Deferreds`' methods can all accept asynchronous functions,
so the final result is not always known at return time.  Therefore we supply
output within the resolved values of `Deferred` objects rather than returning
them.


#### Parallel Methods

**Parallel** methods will call `iterator` for all items in the `list` in
parallel, not guaranteeing the order in which items are processed. They return
a `Promise` referencing a "master" `Deferred` object which will be resolved
when all `Deferred` objects returned from `iterator` (or the `Deferred` objects
referenced from the `Promise` objects returned from `iterator`) are resolved.
If any `Deferred` object referenced in `iterator` is rejected, the "master"
`Deferred` object will immediately be rejected. However, because `iterator` was
initially called for all items in parallel, those calls will continue to run
(by necessity, not by design) in the background.


#### Series Methods

**Series** methods will call `iterator` for each item in the `list`
one-at-a-time, each time waiting for the `Deferred` object returned from
`iterator` (or referenced from the `Promise` object returned from `iterator`)
to resolve. If `list` is an `Array`, order of iteration is guaranteed. They
return a `Promise` object referencing a "master" `Deferred` object which will
be resolved when the `Deferred` object returned from the last call to
`iterator` (or the `Deferred` object referenced from the `Promise` object
returned from the last call to `iterator`) is resolved.  If any `Deferred`
object returned from `iterator` is rejected, series methods will fail fast,
skipping any remaining items and rejecting the "master" `Deferred` object.


#### Failing Fast

All methods will cease processing and immediately reject their returned
`Deferred` object if any `iterator` (for collection functions) or `task` (for
flow control functions) evaluates to a `Deferred` object which is rejected.
This is especially useful for *series* methods because they process in order,
making skipping further processing possible when failing fast.



API documentation
-----------------

* [v1.0.0](http://zship.github.io/deferreds.js/api/v1.0.0/)
* [v0.2.0](http://zship.github.io/deferreds.js/api/v0.2.0/)



License
-------

Released under the [MIT
License](http://www.opensource.org/licenses/mit-license.php).
