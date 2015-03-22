'use strict';

angular.module('fm.state').factory('connectionRefusedInterceptor', [
  '$q',
  function ($q) {
    return {
      'responseError': function (rejection) {
        // a status of 500 with ECONNREFUSED in the data is really a 503 Service Unavailable so change the status
        if (rejection.status === 500 && rejection.data && typeof rejection.data === 'string' && rejection.data.indexOf('ECONNREFUSED') !== -1) {
          rejection.status = 503;
        }

        return $q.reject(rejection);
      }
    };
  }
]).config([
  '$httpProvider',
  function ($httpProvider) {
    $httpProvider.interceptors.push('connectionRefusedInterceptor');
  }
]);
