{Queue} is a data structure similar to a [thread
pool](http://en.wikipedia.org/wiki/Thread_pool_pattern). Tasks added to a Queue
will be processed in parallel up to the `concurrency` limit. They are given to
workers in index order (using `Array.prototype.shift`). It is suited to more
chaotic situations where asynchronous operations may need to start at any time
or be halted abruptly. Complex UI operations come to mind.

### States

{Queue} has two states: "running" and "stopped". It begins in a **stopped
state** and will not begin processing tasks until {Queue#start} has been
called. {Queue#stop} will begin the transition back into the "stopped" state,
returning a {Promise} which will be fulfilled when all currently-running tasks
in the {Queue} have completed.

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
* {Queue#slice}
* {Queue#filter}
* {Queue#map}




## stop

{Queue#stop} will begin transitioning the {Queue} into the "stopped" state,
returning a {Promise} which will be fulfilled when all currently-running tasks
in the {Queue} have completed.




## saturated

Dispatched when {Queue#length} equals the concurrency limit (meaning further
tasks will be queued).




## empty

Dispatched when a worker begins running the last item.




## drain

Dispatched when a worker completes the last item.
