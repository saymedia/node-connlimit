# connlimit

``connlimit`` is a NodeJS module for artificially limiting the number of
connections to a Node server.

Why would you want to do that? Often in production environments it is valuable
to *know* the limits of your system, so you can better predict how it will
behave under load. A truly overloaded server can fail in various bizarre ways,
and may have unintended side-effects to other parts of the system.

With limiting in place, you can model your expected maximum load, test that
your deployment scales to that many connections, and then limit it. This means
that if you get a burst of unexpectedly high load, you'll still reject
connections but you'll remain within your known-good capacity, decreasing
the likelihood of catastrophic failure.

Another advantage of *knowing* your limits is that you can plan around them.
If you know you're now routinely getting more connections than you originally
planned, you can predict the right time to scale horizontally by adding more
instances of your application, or you can increase the limit after ensuring
that your infrastructure can handle the new limit.

## Usage

```js
var connLimit = require('connlimit');

var server = http.createServer(someApp);
connLimit(server, 10000); // only allow 10000 concurrent requests
server.listen(listenPort);
```

## Practical Usage

This sort of limiting is best applied to servers that are running behind
an HTTP-layer load balancer, since this provides a means to evenly
redistribute requests to other backends when one backend reaches its limit.
This will also shield the artificially-limited server from being attacked by
a client that simply opens hundreds of connections and occupies all of the
available slots, blocking out other clients.

This module has been tested in production behind *Perlbal*, a reverse-proxy
load balancer written in Perl. Perlbal has a feature where it will "connect
ahead" to the backend and hold open one additional connection ready to be
used by an incoming request, which interacts nicely with connLimit's
"immediately close when overloaded" behavior by signalling immediately that
the server is not ready to server requests. Similar configurations are
presumably possible in other reverse-proxy solutions.

## Monitoring

In a production deployment you'll want to monitor for cases where servers
reach their limits, since that ought to be an exceptional case. To accommodate
this, the ``connLimit`` function takes an additional set of options of which
the only option is currently ``onLimit``:

```js
function onLimit() {
    // log, emit statsd metrics, etc
}

connLimit(
    server, 10000,
    {
        onLimit: onLimit
    }
);
```

The limit function will be called whenever a connection is rejected due to
hitting the limit.

Of course you should also monitor the non-exceptional usage of your system
so you can understand when it is time to scale up. ``connLimit`` does not
provide a facility for this because it's easy to achieve by using directly
the built-in server events, and e.g. connect middlewares already exist for
doing this.


## Contributing

Development environment is standard: just clone the repo and run
``npm install`` within it.

Contributions are welcome and assumed to be licensed under the MIT license,
as this package itself is. Please be sure to run the unit tests and the
linter on your modified version, and then open a pull request.

```
npm test
npm run-script lint
```

The project's code style is represented by the `.jshintrc` file but please
also attempt to remain consistent with the prevailing style even if particular
details *aren't* tested for by the linter.
