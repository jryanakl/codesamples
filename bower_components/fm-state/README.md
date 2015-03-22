fm-state
========

# ErrorInterceptor

Along with the `authInterceptor` and `connectionRefusedInterceptors` is the general purposes `errorInterceptor`. The purpose
of the `errorInterceptor` is to handle all errors returned by the server with a default response if the error isn't handled
manually. To achieve this, an `$fmError` object is attached to the response of all errors as `$error` to track if the error
has been resolved. If a process uses the `setResolved` method on `$error` the `errorInterceptor` will ignore the error and
won't display a toast message for it.

## Examples

Allowing the errorInterceptor's default behavior:

```
$http.get('/users').success(function() {});
```

If the server returns an error response it will be displayed in a toast message.

Handling an error from the server and preventing the errorInterceptor's default behavior:

```
$http.get('/users').success(function() {}).error(function(err) {
  err.$error.setResolved(true);

  $scope.error = 'You are unable to view users at this time.';
});
```


## State Management

### ng-idle

`ng-idle` is configured with defaults on module config and load.  Watch is started when the user logs in 
and is restarted with each successful http response.  Watch is removed on user logout.  The watch time-to-live is dictated by 
the authentication response ttl attribute - 30 seconds buffer.

### Idler

idler is a factory that handles the timeout countdown and timeout state by showing a module to warn the user the token is about to timeout 
and provide them away to send a keep alive ping to the server. 

### Logout

Logout issues a call to the logout endpoint, clears http cache and broadcasts a logout event `fmlogout` so applications may provide 
a handler to do custom application cleanup prior to redirecting to the login state.

### Timedout

A state that provides a toast message prior to redirecting the user to logout and ultimately the login  state.

