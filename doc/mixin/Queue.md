{Queue} is a data structure similar to a [thread
pool](http://en.wikipedia.org/wiki/Thread_pool_pattern). Tasks added to a Queue
will be processed in parallel through a `worker` function up to the
`concurrency` limit. They are given to workers in index order (using
`Array.prototype.shift`). It is suited to more chaotic situations where
asynchronous operations may need to start at any time or be halted abruptly.
Complex UI operations come to mind.

### States

{Queue} has two states: "running" and "stopped". It begins in a **stopped
state** and will not begin processing tasks until {Queue#start} has been
called. {Queue#stop} will transition back into the "stopped" state.

### Events

{Queue} uses the [js-signals](http://millermedeiros.github.io/js-signals/)
library to dispatch events as tasks are added and completed. {Queue#on} and
{Queue#off} are used to add and remove event listeners. The events:

* {Queue#event:saturated}
* {Queue#event:empty}
* {Queue#event:drain}

### Array methods

{Queue}'s prototype object is an instance of {Array}. That means that the
standard {Array} properties and methods are present and behave how you would
expect them to behave. The following methods have been modified for {Queue}
(but keep the same parameter signatures by delegating to {Array}):

#### Mutator methods

These mutators delegate to their {Array} equivalents and then, if needed, kick
off task processing or dispatch the `"saturated"` event:

* {Queue#push}
* {Queue#pop}
* {Queue#reverse}
* {Queue#shift}
* {Queue#sort}
* {Queue#splice}
* {Queue#unshift}

#### Iteration methods

These iteration methods delegate to their {Array} equivalents and then return a
new (stopped) {Queue} rather than a new {Array}:

* {Queue#concat}
* {Queue#filter}
* {Queue#map}
* {Queue#slice}




## start

Transitions the {Queue} into the "running" state and begins processing tasks.




## stop

{Queue#stop} will begin transitioning the {Queue} into the "stopped" state,
returning a {Promise} which will be fulfilled when all currently-running tasks
in the {Queue} have completed.




## on

Add an event listener `callback` of type `key` to this {Queue}.




## off

Remove all event listeners of type `key` from this {Queue}. If `callback` is
passed, remove only that event listener.




## saturated

Dispatched when {Queue#length} equals the concurrency limit (meaning further
tasks will be queued).




## empty

Dispatched when a worker begins running the last item.




## drain

Dispatched when a worker completes the last item.




## clone

Makes a copy of this {Queue} with the same `worker` and `concurrency`. Intended
mainly for use by the {Array}-derived methods {Queue#concat}, {Queue#filter},
{Queue#map}, and {Queue#slice}.




## pop

Removes the last element from this {Queue} and returns that element. See
{Array#pop} on MDN.




## push

Adds one or more elements to the end of this {Queue} and returns the new length
of the {Queue}. See {Array#push} on MDN.




## reverse

Reverses the order of the elements of this {Queue} -- the first becomes the
last, and the last becomes the first. See {Array#reverse} on MDN.




## shift

Removes the first element from this {Queue} and returns that element. See
{Array#shift} on MDN.




## sort

Sorts the elements of this {Queue} in place and returns the {Queue}. See
{Array#sort} on MDN.




## splice

Adds and/or removes elements from this {Queue}, returning the {Queue}. See
{Array#splice} on MDN.




## unshift

Adds one or more elements to the front of the {Queue} and returns the new
length of the {Queue}. See {Array#unshift} on MDN.




## concat

Returns a new (stopped) {Queue} comprised of this {Queue} joined with other
{Queue}(s) and/or value(s). See {Array#concat} on MDN.




## slice

Extracts a section of the {Queue} and returns a new (stopped) {Queue}. See
{Array#slice} on MDN.




## filter

Creates a new (stopped) {Queue} with all of the elements of this {Queue} for
which the provided filtering function returns true. See {Array#filter} on MDN.




## map

Creates a new (stopped) {Queue} with the results of calling a provided function
on every element in this {Queue}. See {Array#map} on MDN.
