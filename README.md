Deferreds.js
============

[![Build Status](https://travis-ci.org/zship/deferreds.js.png?branch=master)](https://travis-ci.org/zship/deferreds.js)
[![Dependency Status](https://gemnasium.com/zship/deferreds.js.png)](https://gemnasium.com/zship/deferreds.js)

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

AMD, CommonJS (node.js), and browser-global copies are included.



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



Compatibility
-------------

Deferreds.js' functions are designed to work with any
[Promises/A+](https://github.com/promises-aplus/promises-spec)-compliant
`Promise` implementations. An implementation which passes the Promises/A+ test
suite is included in
[deferreds/Deferred](http://zship.github.io/deferreds.js/api/v1.0.0/#/module:deferreds/Deferred),
but any [compliant
implementation](https://github.com/promises-aplus/promises-spec/blob/master/implementations.md)
or [jQuery's Deferred since 1.8](http://api.jquery.com/deferred.then/) will
work precisely the same.



API documentation
-----------------

Deferreds.js has thorough API documentation:
* [v1.0.0](http://zship.github.io/deferreds.js/api/v1.0.0/)
* [v0.2.0](http://zship.github.io/deferreds.js/api/v0.2.0/)



License
-------

Released under the [MIT
License](http://www.opensource.org/licenses/mit-license.php).
