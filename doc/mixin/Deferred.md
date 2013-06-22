A {Deferred} object is a flexible way of registering an arbitrary number of
callbacks which can continue to be registered and invoked after the original
callback dispatch ({Deferred#resolve} or {Deferred#reject}) has occurred.
Deferreds.js' implementation comforms to the
[Promises/A+](https://github.com/promises-aplus/promises-spec) spec. An
example:

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
	.fail(function(err) {
		console.error(err);
	})
	//callback methods are chainable
	.then(function(users) {
		users.forEach(function(user) {
			//...
		});
	})
	//multiple callbacks of the same type (then/success,
	//fail/failure) can be added
	.then(function(users) {
		//...
	});
```


### States

There are three states a {Deferred} object can have: "pending" (the starting
state), "fulfilled" (indicating success), and "rejected" (indicating failure).
{Deferred#fulfill} and {Deferred#reject} are used to change the state. A
{Deferred} object is only allowed to change state once, so multiple calls to
{Deferred#fulfill} or {Deferred#reject} will have no effect after the first
call.


### Callbacks

There are two types of callbacks which can be registered on a {Deferred}
object: `onFulfilled` and `onRejected`. They are registered through
{Deferred#then} and added to a first-in first-out queue. {Deferred#done} (add
an `onFulfilled` callback), {Deferred#fail} (add an `onRejected` callback), and
{Deferred#always} (add the same function as an `onFulfilled` and `onRejected`
callback) are convenience methods to add callbacks while returning the same
{Deferred} object (as opposed to {Deferred#then}, which returns a new
{Promise}).

Callbacks are first invoked when the {Deferred}'s state is changed, and then
immediately upon registration thereafter. Changing state to "fulfilled" will
invoke all `onFulfilled` callbacks, while changing state to "rejected" will
invoke all `onRejected` callbacks. After a state change to "fulfilled", all
`onFulfilled` callbacks added will be invoked immediately as they're added and
with the same arguments first passed to {Deferred#fulfill}. Other types of
callbacks will be ignored.  Similarly, after a state changed to "rejected", all
`onRejected` callbacks added will be invoked immediately as they're added and
other types of callbacks will be ignored.




## promise

Return a {Promise} object, which is an object containing a restricted set of
methods, all of which delegate to this {Deferred}. You will normally want
return this {Promise} object instead of the {Deferred} in order to guarantee
that downstream code cannot alter the {Deferred}'s state. See {Promise} for
more information.




## state

Returns the {Deferred.State} of this Deferred object.




## fulfill

Mark the {Deferred.State} as "fulfilled" and call any `onFulfilled` callbacks.




## reject

Mark the {Deferred.State} as "rejected" and call any `onRejected` callbacks.




## then

Add an `onFulfilled` and/or `onRejected` callback to the {Deferred} object's
queues and return a new {Promise} which will be fulfilled or rejected when this
{Deferred} is fulfilled or rejected. This is done to maintain chainability, as
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

Add a `doneCallback` to the {Deferred} object's queue.




## fail

Add a `failCallback` to the {Deferred} object's queue.




## always

Add a callback to both the `doneCallback` and `failCallback` queue.
