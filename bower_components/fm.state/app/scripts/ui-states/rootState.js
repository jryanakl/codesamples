'use strict';

angular.module('fm.state').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('root', {
      abstract: true,
      resolve: {
        locale: ['locale', function (locale) {
          return locale.ready('common').then(function () {
            return locale;
          });
        }]
      },
      views: {
        root: {
          templateUrl: 'root.html'
        }
      }
    });
  }
]);
