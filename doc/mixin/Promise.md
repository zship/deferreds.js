A {Promise} object is a flexible way of registering an arbitrary number of
callbacks to be invoked at a later time. Deferreds.js' implementation comforms
to the [Promises/A+](https://github.com/promises-aplus/promises-spec) spec.

```js
//let's make a function which retrieves a list of users from
//a server asynchronously using AJAX.

//the callback approach
var getUsers = function(callback) {
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		//in callback-centered style, the first argument to
		//a callback is often an error argument (which is
		//null if there is no error)
		if (request.status === 200) {
			callback(null, JSON.parse(request.responseText));
		}
		else {
			callback('There was a problem with the request.');
		}
	};

	request.open('GET', '/users');
	request.send();
};

getUsers(function(err, users) {
	if (err) {
		console.error(err);
		return;
	}

	users.forEach(function(user) {
		//...
	});
});


//the Deferred object approach
var getUsers = function() {
	var defer = new Deferred();
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		//Deferreds have separate callback mechanisms for
		//the notions of success and failure
		if (request.status === 200) {
			defer.resolve(JSON.parse(request.responseText));
		}
		else {
			defer.reject('There was a problem with the request.');
		}
	};

	request.open('GET', '/users');
	request.send();

	//returning just `defer` would work fine, but would
	//allow consumers of this function to call `fulfill` or
	//`reject` on it
	return defer.promise();
};

getUsers()
	//callback methods are chainable
	.then(function(users) {
		users.forEach(function(user) {
			//...
		});
	})
	.then(function(users) {
		//...
	})
	.fail(function(err) {
		console.error(err);
	});
```


### States

There are three states a {Promise} object can have: "pending" (the starting
state), "fulfilled" (indicating success), and "rejected" (indicating failure).
{Deferred#resolve} and {Deferred#reject} are used to change the state. A
{Promise} object is only allowed to change state once, so multiple calls to
{Deferred#fulfill} or {Deferred#reject} will have no effect after the first
call.

Why not just put {Deferred#resolve} and {Deferred#reject} on the {Promise}
object itself? Just to provide some encapsulation. Foreign code can be provided
with {Promise} objects with some guarantee that it will not be able to change
the state. In other words, the only code that should be able to decide when an
asynchronous operation has ended is your own (using
{Deferred#resolve}/{Deferred#reject}).


### Callbacks

There are two types of callbacks which can be registered on a {Promise}
object: `onFulfilled` and `onRejected`. They are registered through
{Promise#then} and added to a first-in first-out queue. {Promise#done} (add
an `onFulfilled` callback), {Promise#fail} (add an `onRejected` callback), and
{Promise#always} (add the same function as an `onFulfilled` and `onRejected`
callback) are convenience methods to add callbacks while returning the same
{Promise} object (as opposed to {Promise#then}, which returns a new
{Promise}).

Callbacks are first invoked when the {Promise}'s state is changed, and then
immediately upon registration thereafter. Changing state to "fulfilled" will
invoke all `onFulfilled` callbacks, while changing state to "rejected" will
invoke all `onRejected` callbacks. After a state change to "fulfilled", all
`onFulfilled` callbacks added will be invoked immediately as they're added and
with the same arguments first passed to {Deferred#resolve}. Other types of
callbacks will be ignored.  Similarly, after a state changed to "rejected", all
`onRejected` callbacks added will be invoked immediately as they're added and
other types of callbacks will be ignored.


## state

Returns the {Promise.State} of this Promise object.


## then

Add an `onFulfilled` and/or `onRejected` callback to the {Promise} object's
queues and return a new {Promise} which will be fulfilled or rejected when this
{Promise} is fulfilled or rejected. This is done to maintain chainability, as
each new invocation of {Promise#then} will add callbacks which will wait for
the callbacks from the previous invocation of {Promise#then} to be
fulfilled/rejected before executing. An example:

```js
var step1 = function() {
	var deferred = new Deferred();
	setTimeout(function(){
		deferred.resolve([1, 2, 3, 4, 5]);
	}, 10);
	return deferred.promise();
};

var step3 = function(val) {
	alert('Maximum value: ' + val);
};


//without the chainable behavior of `then`
//------------

//use an intermediary Deferred object
var defer = new Deferred();
step1().done(function(list) {
	defer.resolve(Math.max(list));
});
defer.done(step3);


//with
//---------

step1()
	.then(function(list) {
		return Math.max(list);
	})
	.then(step3);
```


## done

Add an `onFulfilled` callback to the {Promise} object's queue.


## fail

Add an `onRejected` callback to the {Promise} object's queue.


## always

Add the same function to the {Promise} object's queue as both an `onFulfilled`
callback and an `onRejected` callback.
