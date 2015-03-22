(function() {
  'use strict';

  angular.module('fm.state').factory('errorInterceptor', [
    '$q',
    '$log',
    '$fmError',
    '$timeout',
    'toast',
    function ($q, $log, FMError, $timeout, toast) {
      return {
        'responseError': function (rejection) {
          if(rejection.status !== 401){
            var Error = new FMError();
            $log.info(rejection.data);

            if(!rejection.data){
              rejection.data = {
                message: rejection.statusText || ''
              };
            }
            else if(typeof rejection.data === 'string') {
              rejection.data = {
                message: rejection.data
              };
            }

            rejection.data.$error = Error;

            // Using a timeout the processes receiving the rejection has an opportunity
            // to handle the message. If the message is not handled the error messaged will be
            // displayed in a toast message.
            $timeout(function() {
              if(!Error.resolved) {
                toast.addErrorMessage(rejection.data.message);
              }
            });
          }
          return $q.reject(rejection);
        }
      };
    }
  ]).config([
    '$httpProvider',
    function ($httpProvider) {
      $httpProvider.interceptors.push('errorInterceptor');
    }
  ]);
})();
