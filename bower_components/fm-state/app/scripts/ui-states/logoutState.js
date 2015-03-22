'use strict';

angular.module('fm.state').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('root.logout', {
      url: '/logout',
      views: {
        header: {
          template: ''
        },
        main: {
          template: '',
          controller: [
            '$rootScope',
            '$state',
            'auth',
            function($rootScope, $state, auth){
              auth.invalidateCredentials();
              $rootScope.$broadcast('fmlogout'); //broadcast logout event.
              $state.go('root.login', {}, {
                location: 'replace',
                reload: true,
                notify: true
              });
            }
          ]
        }
      }
    });
  }
]);
