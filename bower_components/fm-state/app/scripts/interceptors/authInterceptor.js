'use strict';

angular.module('fm.state').factory('authInterceptor', [
  '$location',
  '$log',
  '$q',
  '$window',
  'fmStateConstants',
  function ($location, $log, $q, $window, fmStateConstants) {

    return {
      responseError: function (rejection) {
        $log.debug('Response error ' + rejection.status + ': ', rejection.data);
        if (rejection.status === 401) { //User has not authenticated yet or token has expired.
          var returnToUrl = $location.path();
          if('/' !== returnToUrl){
            $window.localStorage.setItem(fmStateConstants.returnToUrlKey, returnToUrl);
          }
          $location.path('/').replace();
        }
        return $q.reject(rejection);
      }
    };

  }

]).config([
  '$httpProvider',
  function ($httpProvider) {
    /**
     * This header is critical.  It tells the REST services that if authentication fails, do not send a WWW-Authenticate header.
     * The WWW-Authenticate header will make the browser pop its native authentication dialog.
     */
    $httpProvider.defaults.headers.common['Suppress-Auth-Header'] = 'true';
    $httpProvider.defaults.headers.common['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.common.Pragma = 'no-cache';
    /**
     * If the server returns a 401,
     * 1) save the current state,
     * 2) transition to login,
     * 3) and upon successful login, transition to the original target state.
     */
    $httpProvider.interceptors.push('authInterceptor');
  }
]);
