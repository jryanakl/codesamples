'use strict';

angular.module('fm.state').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('root.timedout', {
      url: '/timedout',
      views: {
        header: {
          template: ''
        },
        main: {
          template: '',
          controller: [
            '$state',
            '$stateParams',
            'locale',
            'toast',
            function($state, $stateParams, locale, toast){
              toast.addStickyErrorMessage(locale.getString('fmState.timedout'));
              $state.transitionTo('root.logout', $stateParams, {
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
