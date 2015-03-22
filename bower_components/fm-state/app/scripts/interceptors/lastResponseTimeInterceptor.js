'use strict';

/**
 * Intended to record the last response datetime for use with the idle timeout.
 */
angular.module('fm.state').factory('lastResponseTimeInterceptor', [
  '$injector',
  function ($injector) {
    return {
      'response': function(response){
        var auth = $injector.get('auth'),
          $idle = $injector.get('$idle');
        if(!!auth.getToken() && !$idle.idling()){
          $idle.watch();
        }
        return response;
      }
    };
  }
]).config([
  '$httpProvider',
  function ($httpProvider) {
    $httpProvider.interceptors.push('lastResponseTimeInterceptor');
  }
]);
